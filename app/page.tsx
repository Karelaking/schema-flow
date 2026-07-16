"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Explorer } from "@/components/layout/Explorer";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/layout/Inspector";
import { useStore } from "@/lib/store";

export default function Page() {
  const loadProject = useStore(state => state.loadProject);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeProject() {
      try {
        setLoading(true);
        // 1. Fetch available projects
        const response = await fetch("/api/projects");
        const data = await response.json();
        
        if (data.success && data.projects.length > 0) {
          // Load the most recent project
          const latestProj = data.projects[0];
          const projectResponse = await fetch(`/api/projects/${latestProj.id}`);
          const projectData = await projectResponse.json();
          
          if (projectData.success) {
            loadProject(projectData.project);
          } else {
            setError("Failed to load project details");
          }
        } else {
          // No projects exist, create a default ecommerce project
          const defaultProj = {
            id: `proj-${Date.now()}`,
            name: "e-commerce_db",
            description: "Default visual database schema for e-commerce applications",
            dialect: "sqlite"
          };
          
          const createResponse = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultProj)
          });
          const createData = await createResponse.json();
          
          if (createData.success) {
            // Load the newly created default project structure
            const newProjectResponse = await fetch(`/api/projects/${defaultProj.id}`);
            const newProjectData = await newProjectResponse.json();
            if (newProjectData.success) {
              loadProject(newProjectData.project);
            } else {
              setError("Failed to load newly created project");
            }
          } else {
            setError("Failed to initialize default project");
          }
        }
      } catch (err: any) {
        setError(`Initialization error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    initializeProject();
  }, [loadProject]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-3 bg-background text-foreground">
        <div className="animate-spin size-8 rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Initializing Workspace...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-3 bg-background text-foreground p-6 text-center">
        <div className="text-destructive font-semibold">Workspace Loading Failed</div>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-xs font-semibold px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 animate-fade-in"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Header Toolbar */}
      <Header />

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Explorer */}
        <Explorer />

        {/* Center: React Flow Canvas */}
        <Canvas />

        {/* Right Sidebar: Inspector */}
        <Inspector />
      </div>
    </div>
  );
}

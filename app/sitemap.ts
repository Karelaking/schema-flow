import type { MetadataRoute } from "next";
import { getDbService } from "@/packages/db";

// Cache/revalidate sitemap every 24 hours (86,400 seconds)
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schemaflow-studio.vercel.app";
  const currentDate = new Date();

  // 1. Static pages list
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/workspace`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    // 2. Fetch dynamic projects from database service directly
    const db = getDbService();
    const projects = await db.listProjects();

    // 3. Map dynamic project records to sitemap entries
    const dynamicRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${baseUrl}/workspace?project=${project.id}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    // Return static routes gracefully if database access fails
    return staticRoutes;
  }
}
"use client";

import React from "react";

/**
 * Standalone Logo Cloud section with an infinitely running marquee animation.
 */
export function LogoCloudSection(): React.JSX.Element {
  const logos = [
    {
      id: "n",
      content: (
        <div className="flex items-center gap-1 font-extrabold text-base tracking-tighter text-foreground">
          <span className="font-mono text-lg font-black">n&apos;</span>
        </div>
      ),
    },
    {
      id: "logoipsum-1",
      content: (
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground tracking-tight">
          <svg className="size-5 text-foreground fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          <span className="font-sans font-extrabold tracking-tight">Logoipsum</span>
        </div>
      ),
    },
    {
      id: "logoipsum-2",
      content: (
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground tracking-tight">
          <svg className="size-5 text-foreground fill-current" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="font-sans font-extrabold tracking-tight">Logoipsum</span>
        </div>
      ),
    },
    {
      id: "logoipsum-3",
      content: (
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground tracking-tight">
          <svg className="size-5 text-foreground stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" d="M12 2v4m0 12v4M2 12h4m12 0h4m-3.05-6.95l-2.83 2.83m-8.48 8.48l-2.83 2.83m0-14.14l2.83 2.83m8.48 8.48l2.83 2.83" />
          </svg>
          <span className="font-sans font-extrabold tracking-tight">Logoipsum</span>
        </div>
      ),
    },
    {
      id: "logoipsum-4",
      content: (
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground tracking-tight">
          <svg className="size-5 text-foreground fill-current" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span className="font-sans font-extrabold tracking-tight">Logoipsum</span>
        </div>
      ),
    },
  ];

  return (
    <section className="relative w-full border-b border-border/40 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl border-x border-border/40 px-6 sm:px-10 py-8 flex flex-col md:flex-row items-center gap-6">

        {/* Infinite Scrolling Marquee Container */}
        <div className="relative flex-1 overflow-hidden w-full">
          
          {/* Gradient Masks on Edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background to-transparent z-10" />

          {/* Marquee Track */}
          <div className="flex w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] gap-12 sm:gap-16 items-center">
            {/* Set 1 */}
            {logos.map((logo, idx) => (
              <React.Fragment key={`logo-1-${idx}`}>
                {logo.content}
              </React.Fragment>
            ))}

            {/* Set 2 (Duplicate for Seamless Loop) */}
            {logos.map((logo, idx) => (
              <React.Fragment key={`logo-2-${idx}`}>
                {logo.content}
              </React.Fragment>
            ))}

            {/* Set 3 (Triple for Ultra-Wide Screens) */}
            {logos.map((logo, idx) => (
              <React.Fragment key={`logo-3-${idx}`}>
                {logo.content}
              </React.Fragment>
            ))}
          </div>

        </div>

      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}

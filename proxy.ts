import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route matcher defining public routes that do not require authentication.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/cookies(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/favicon.ico",
  "/og-image.png",
]);

export default clerkMiddleware(async (auth: any, req: any) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Exclude static extensions (including .xml and .txt) and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API and TRPC routes
    "/(api|trpc)(.*)",
  ],
};
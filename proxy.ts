import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/monitoring(.*)",
  "/cookies(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sitemap.xml",
  "/sso-callback(.*)",
  "/robots.txt",
  "/favicon.ico",
  "/og-image.png",
]);

export default clerkMiddleware(async (auth: any, req: any) => {

  // Serve public pages directly to search engine bots without Clerk session sync handshakes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
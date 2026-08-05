import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
  const userAgent = req.headers.get("user-agent") || "";
  const isBot = /googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider/i.test(userAgent);

  // Serve public pages directly to search engine bots without Clerk session sync handshakes
  if (isBot && isPublicRoute(req)) {
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
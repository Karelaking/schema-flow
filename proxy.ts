import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route matcher defining public routes that do not require authentication.
 * Ensures search engine crawlers (Googlebot) and public visitors access landing,
 * legal, auth, sitemap, and robots pages without authentication redirect loops.
 */
const isPublicRoute = createRouteMatcher([
    "/",
    "/cookies(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/(.*)",
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.ico",
    "/og-image.png",
]);

/**
 * Next.js 16 Proxy enforcing Clerk authentication on protected routes without redirect loops.
 */
export const proxy = clerkMiddleware(async (auth: any, req: any) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export default proxy;

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};

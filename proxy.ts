import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route matcher defining public routes that do not require authentication.
 */
const isPublicRoute = createRouteMatcher([
    "/",
    "/cookies(.*)",
    "/workspace(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/(.*)",
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.ico",
    "/og-image.png",
]);

/**
 * Next.js Proxy enforcing Clerk authentication on protected routes without redirect loops.
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

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route matcher defining public routes that do not require authentication.
 */
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/lotus-key",
]);

/**
 * Next.js 16 Proxy enforcing Clerk authentication on protected routes.
 */
export const proxy = clerkMiddleware(async (auth: any, req: any) => {
    if (!isPublicRoute(req)) {
        const signInUrl = new URL("/sign-in", req.url).toString();
        await auth.protect({
            unauthenticatedUrl: signInUrl,
        });
    }
});

export default proxy;

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

import * as Sentry from "@sentry/nextjs";

export interface SentryUserContext {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
}

export interface SentryExtraContext {
    [key: string]: unknown;
}

/**
 * Utility function to report errors and exceptions to Sentry safely across client and server.
 */
export function captureException(
    error: unknown,
    extra?: SentryExtraContext
): string {
    if (!error) {
        return "";
    }

    return Sentry.captureException(error, {
        extra,
    });
}

/**
 * Utility function to send a custom message or log event to Sentry.
 */
export function captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info",
    extra?: SentryExtraContext
): string {
    return Sentry.captureMessage(message, {
        level,
        extra,
    });
}

/**
 * Sets current authenticated user context on the Sentry scope.
 */
export function setSentryUser(user: SentryUserContext | undefined): void {
    if (!user) {
        Sentry.setUser(null);
        return;
    }

    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        ip_address: user.ip_address,
    });
}

/**
 * Higher-order wrapper for Next.js App Router API route handlers to capture exceptions automatically.
 */
export function withSentryApiHandler<T extends (...args: any[]) => Promise<Response>>(
    handler: T
): T {
    return (async (...args: Parameters<T>): Promise<Response> => {
        try {
            return await handler(...args);
        } catch (error: unknown) {
            Sentry.captureException(error);
            throw error;
        }
    }) as T;
}

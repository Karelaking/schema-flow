"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, KeyRound, ShieldCheck, Database, Layers, Sparkles, Network } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Type guard to check if an error object is a Clerk API response error.
 */
const isClerkAPIResponseError = (
    err: unknown
): err is { errors: Array<{ message?: string; longMessage?: string; code?: string }> } => {
    return (
        typeof err === "object" &&
        err !== null &&
        "errors" in err &&
        Array.isArray((err as { errors: unknown }).errors)
    );
};

/**
 * Zod validation schema for primary sign-in form.
 */
const signInSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

/**
 * Zod validation schema for reset password form.
 */
const resetPasswordSchema = z.object({
    code: z.string().min(1, "Verification code is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Google Icon component for OAuth button.
 */
const GoogleIcon = (): React.JSX.Element => (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
    </svg>
);

/**
 * GitHub Icon component for OAuth button.
 */
const GitHubIcon = (): React.JSX.Element => (
    <svg className="size-4 fill-current shrink-0" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

/**
 * Custom Sign-In Component featuring 50-50 split screen and react-hook-form integration.
 */
export const CustomSignIn = (): React.JSX.Element | null => {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();

    const [mounted, setMounted] = useState<boolean>(false);
    const [verifying, setVerifying] = useState<boolean>(false);
    const [forgotPassword, setForgotPassword] = useState<boolean>(false);
    const [resetStep, setResetStep] = useState<"request" | "code">("request");
    const [code, setCode] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Primary Sign-In Form with react-hook-form
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Reset Password Form with react-hook-form
    const {
        register: registerReset,
        handleSubmit: handleSubmitReset,
        formState: { errors: resetErrors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            code: "",
            newPassword: "",
        },
    });

    /**
     * OAuth redirect handler.
     */
    const handleOAuth = async (strategy: "oauth_google" | "oauth_github"): Promise<void> => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "OAuth sign-in failed.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("OAuth sign-in failed. Please try again.");
            }
        }
    };

    /**
     * React-hook-form submit handler for Sign-In.
     */
    const onSubmitForm = async (data: SignInFormValues): Promise<void> => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const result = await signIn.create({
                identifier: data.email,
                password: data.password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/");
            } else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
                setVerifying(true);
                setLoading(false);
            } else {
                setError("Additional verification required.");
                setLoading(false);
            }
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "Invalid email or password.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Invalid credentials. Please check details.");
            }
        }
    };

    /**
     * Verification code submit handler.
     */
    const handleVerifyCode = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/");
            } else {
                setError("Verification code incomplete.");
                setLoading(false);
            }
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "Invalid verification code.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Invalid code provided.");
            }
        }
    };

    /**
     * Password reset code request handler.
     */
    const handleSendResetCode = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        const currentEmail = getValues("email");
        if (!isLoaded || !currentEmail) {
            setError("Please enter your email address first.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: currentEmail,
            });
            setResetStep("code");
            setLoading(false);
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "Unable to send reset code.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error sending reset code.");
            }
        }
    };

    /**
     * React-hook-form reset password submission handler.
     */
    const onSubmitResetForm = async (data: ResetPasswordFormValues): Promise<void> => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code: data.code,
                password: data.newPassword,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/");
            } else {
                setError("Password reset incomplete.");
                setLoading(false);
            }
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "Password reset failed.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error resetting password.");
            }
        }
    };

    if (!mounted) {
        return (
            <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
                <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background">
                    <div className="size-9 rounded-full bg-muted animate-pulse" />
                    <div className="w-full max-w-md mx-auto my-auto space-y-6">
                        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
                        <div className="h-11 w-full bg-muted rounded-xl animate-pulse" />
                        <div className="h-11 w-full bg-muted rounded-xl animate-pulse" />
                        <div className="h-11 w-full bg-muted rounded-xl animate-pulse" />
                    </div>
                </div>
                <div className="hidden lg:block bg-zinc-950 min-h-screen" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground selection:bg-primary/20">
            {/* Left Side Partition: Form Section */}
            <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 bg-background border-r border-border/40">
                {/* Top Brand Header */}
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90">
                        <div className="flex size-9 items-center justify-center rounded-full bg-foreground text-background font-bold shadow-xs transition-transform group-hover:scale-105">
                            <span className="text-xs font-mono font-black tracking-tighter">sf.</span>
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-foreground">
                            schemaflow<span className="text-primary font-black">.</span>studio
                        </span>
                    </Link>
                </div>

                {/* Form Main Container */}
                <div className="w-full max-w-md mx-auto my-auto py-8">
                    {/* Header Title */}
                    <div className="mb-8 text-left">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            {verifying
                                ? "Security Verification"
                                : forgotPassword
                                    ? resetStep === "request"
                                        ? "Reset Password"
                                        : "Set New Password"
                                    : "Welcome Back"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            {verifying
                                ? "Enter the verification code sent to your email"
                                : forgotPassword
                                    ? resetStep === "request"
                                        ? "Enter your email address to receive a recovery code"
                                        : "Enter the code from your email and your new password"
                                    : "Sign in to access your schema flow workspace"}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 flex items-start gap-2.5 p-3.5 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl animate-in fade-in duration-200">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* 2FA Verification View */}
                    {verifying ? (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label htmlFor="signin-security-code" className="block text-xs font-semibold text-foreground mb-1.5">
                                    Security Code
                                </label>
                                <div className="flex items-center rounded-xl border border-border bg-background/50 px-3.5 h-11 gap-3 transition-all focus-within:ring-2 focus-within:ring-ring/40">
                                    <KeyRound className="size-4 text-muted-foreground shrink-0" />
                                    <input
                                        id="signin-security-code"
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        aria-label="Security Code"
                                        autoComplete="one-time-code"
                                        className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !code}
                                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                <span>Verify & Sign In</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setVerifying(false);
                                    setError(null);
                                }}
                                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 text-center cursor-pointer"
                            >
                                Back to sign in
                            </button>
                        </form>
                    ) : forgotPassword ? (
                        /* Reset Password Flow */
                        resetStep === "request" ? (
                            <form onSubmit={handleSendResetCode} className="space-y-4">
                                <div>
                                    <label htmlFor="reset-email" className="block text-xs font-semibold text-foreground mb-1.5">
                                        Email Address
                                    </label>
                                    <div className={cn(
                                        "flex items-center rounded-xl border bg-background/50 px-3.5 h-11 gap-3 transition-all",
                                        errors.email ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30" : "border-border focus-within:ring-2 focus-within:ring-ring/40"
                                    )}>
                                        <Mail className="size-4 text-muted-foreground shrink-0" />
                                        <input
                                            id="reset-email"
                                            type="email"
                                            {...register("email")}
                                            placeholder="me@company.com"
                                            aria-label="Email Address"
                                            autoComplete="email"
                                            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                    <span>Send Reset Code</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotPassword(false);
                                        setError(null);
                                    }}
                                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 text-center cursor-pointer"
                                >
                                    Cancel and return to Sign In
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmitReset(onSubmitResetForm)} className="space-y-4">
                                <div>
                                    <label htmlFor="reset-code" className="block text-xs font-semibold text-foreground mb-1.5">
                                        Reset Code
                                    </label>
                                    <div className={cn(
                                        "flex items-center rounded-xl border bg-background/50 px-3.5 h-11 gap-3 transition-all",
                                        resetErrors.code ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30" : "border-border focus-within:ring-2 focus-within:ring-ring/40"
                                    )}>
                                        <KeyRound className="size-4 text-muted-foreground shrink-0" />
                                        <input
                                            id="reset-code"
                                            type="text"
                                            {...registerReset("code")}
                                            placeholder="Enter 6-digit code"
                                            aria-label="Reset Code"
                                            autoComplete="one-time-code"
                                            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                        />
                                    </div>
                                    {resetErrors.code && (
                                        <p className="text-xs text-destructive mt-1 font-medium">{resetErrors.code.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="reset-new-password" className="block text-xs font-semibold text-foreground mb-1.5">
                                        New Password
                                    </label>
                                    <div className={cn(
                                        "flex items-center rounded-xl border bg-background/50 px-3.5 h-11 gap-3 transition-all",
                                        resetErrors.newPassword ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30" : "border-border focus-within:ring-2 focus-within:ring-ring/40"
                                    )}>
                                        <Lock className="size-4 text-muted-foreground shrink-0" />
                                        <input
                                            id="reset-new-password"
                                            type={showPassword ? "text" : "password"}
                                            {...registerReset("newPassword")}
                                            placeholder="••••••••••••"
                                            aria-label="New Password"
                                            autoComplete="new-password"
                                            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {resetErrors.newPassword && (
                                        <p className="text-xs text-destructive mt-1 font-medium">{resetErrors.newPassword.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                    <span>Reset Password & Sign In</span>
                                </button>
                            </form>
                        )
                    ) : (
                        /* Primary Sign-In View using React Hook Form */
                        <div className="space-y-5">
                            {/* Social OAuth Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOAuth("oauth_google")}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl border border-border/60 bg-background hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50 hover:-translate-y-0.5"
                                >
                                    <GoogleIcon />
                                    <span>Google</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleOAuth("oauth_github")}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl border border-border/60 bg-background hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50 hover:-translate-y-0.5"
                                >
                                    <GitHubIcon />
                                    <span>GitHub</span>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center my-4">
                                <div className="border-t border-border/60 w-full" />
                                <span className="bg-background px-3 text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground shrink-0">
                                    Or continue with email
                                </span>
                            </div>

                            {/* React Hook Form */}
                            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                                <div id="clerk-captcha" />
                                <div>
                                    <label htmlFor="signin-email" className="block text-xs font-semibold text-foreground mb-1.5">
                                        Email Address
                                    </label>
                                    <div className={cn(
                                        "flex items-center rounded-xl border bg-background/50 px-3.5 h-11 gap-3 transition-all",
                                        errors.email ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30" : "border-border focus-within:ring-2 focus-within:ring-ring/40"
                                    )}>
                                        <Mail className="size-4 text-muted-foreground shrink-0" />
                                        <input
                                            id="signin-email"
                                            type="email"
                                            {...register("email")}
                                            placeholder="me@company.com"
                                            aria-label="Email Address"
                                            autoComplete="email"
                                            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="signin-password" className="text-xs font-semibold text-foreground">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForgotPassword(true);
                                                setError(null);
                                            }}
                                            className="text-xs text-primary hover:underline font-medium transition-all cursor-pointer"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className={cn(
                                        "flex items-center rounded-xl border bg-background/50 px-3.5 h-11 gap-3 transition-all",
                                        errors.password ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30" : "border-border focus-within:ring-2 focus-within:ring-ring/40"
                                    )}>
                                        <Lock className="size-4 text-muted-foreground shrink-0" />
                                        <input
                                            id="signin-password"
                                            type={showPassword ? "text" : "password"}
                                            {...register("password")}
                                            placeholder="••••••••••••"
                                            aria-label="Password"
                                            autoComplete="current-password"
                                            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md group mt-2"
                                >
                                    {loading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Switch Link */}
                <div className="pt-6 border-t border-border/40 text-center">
                    <p className="text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href={"/sign-up" as any} className="font-semibold text-foreground hover:text-primary underline-offset-4 hover:underline transition-all">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side Partition: High-Impact Unsplash Visual Graphic Panel */}
            <div className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between min-h-screen bg-zinc-950">
                {/* Unsplash Background Image - Global Digital Network */}
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"
                    alt="SchemaFlow Studio Data Architecture"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                />

                {/* Dark Overlay Gradient for High Contrast Text Legibility */}
                <div className="absolute inset-0 bg-linear-to-t from-black/15 via-black/15 to-black/15 backdrop-blur-xs" />

                {/* Middle: High-Contrast Glassmorphic Typography Box */}
                <div className="relative z-10 my-auto w-full max-w-lg mx-auto">
                    <div className="border border-white/15 bg-black/65 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                            Architect & Visualize Database Schemas Effortlessly.
                        </h2>
                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal drop-shadow-sm">
                            Design interactive ERDs, generate production-ready Drizzle ORM code, and synchronize your multi-database architecture in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSignIn;

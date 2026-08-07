"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck, KeyRound, RefreshCw, Code2, Cpu, Sparkles, Database, Layers, Network } from "lucide-react";
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
 * Zod validation schema for sign-up form.
 */
const signUpSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

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
 * Custom Sign-Up Component featuring 50-50 split screen and react-hook-form integration.
 */
export const CustomSignUp = (): React.JSX.Element | null => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();

    const [mounted, setMounted] = useState<boolean>(false);
    const [code, setCode] = useState<string>("");
    const [pendingVerification, setPendingVerification] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Primary Sign-Up Form with react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
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
            await signUp.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "OAuth registration failed.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("OAuth sign-up failed. Please try again.");
            }
        }
    };

    /**
     * React-hook-form submit handler for Sign-Up.
     */
    const onSubmitForm = async (data: SignUpFormValues): Promise<void> => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);
        setUserEmail(data.email);

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
            setLoading(false);
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "Registration failed.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Registration failed. Please check details.");
            }
        }
    };

    /**
     * Verification code submission handler.
     */
    const handleVerify = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({ code });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/");
            } else {
                setError("Verification incomplete.");
                setLoading(false);
            }
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "Invalid verification code.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Invalid verification code provided.");
            }
        }
    };

    /**
     * Resends email verification code.
     */
    const handleResendCode = async (): Promise<void> => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setLoading(false);
        } catch (err: unknown) {
            setLoading(false);
            if (isClerkAPIResponseError(err)) {
                setError(err.errors[0]?.longMessage || err.errors[0]?.message || "Failed to resend code.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to resend code.");
            }
        }
    };

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
                            {pendingVerification ? "Verify Email" : "Create Account"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            {pendingVerification
                                ? `We sent a verification code to ${userEmail}`
                                : "Start architecting and visualizing schemas effortlessly"}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 flex items-start gap-2.5 p-3.5 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl animate-in fade-in duration-200">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Pending Verification View */}
                    {pendingVerification ? (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label htmlFor="signup-verification-code" className="block text-xs font-semibold text-foreground mb-1.5">
                                    Verification Code
                                </label>
                                <div className="flex items-center rounded-xl border border-border bg-background/50 px-3.5 h-11 gap-3 transition-all focus-within:ring-2 focus-within:ring-ring/40">
                                    <KeyRound className="size-4 text-muted-foreground shrink-0" />
                                    <input
                                        id="signup-verification-code"
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        aria-label="Verification Code"
                                        autoComplete="one-time-code"
                                        className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0 font-mono tracking-widest text-center"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !code}
                                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                <span>Complete Verification</span>
                            </button>

                            <div className="flex items-center justify-between pt-2 text-xs">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                                    <span>Resend Code</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPendingVerification(false);
                                        setError(null);
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    Change email
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Primary Sign-Up Form using React Hook Form */
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
                                    Or register with email
                                </span>
                            </div>

                            {/* React Hook Form */}
                            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                                <div id="clerk-captcha" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="signup-first-name" className="block text-xs font-semibold text-foreground mb-1.5">
                                            First Name
                                        </label>
                                        <div className="flex items-center rounded-xl border border-border bg-background/50 px-3.5 h-11 gap-3 transition-all focus-within:ring-2 focus-within:ring-ring/40">
                                            <User className="size-4 text-muted-foreground shrink-0" />
                                            <input
                                                id="signup-first-name"
                                                type="text"
                                                {...register("firstName")}
                                                placeholder="John"
                                                aria-label="First Name"
                                                autoComplete="given-name"
                                                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="signup-last-name" className="block text-xs font-semibold text-foreground mb-1.5">
                                            Last Name
                                        </label>
                                        <div className="flex items-center rounded-xl border border-border bg-background/50 px-3.5 h-11 gap-3 transition-all focus-within:ring-2 focus-within:ring-ring/40">
                                            <User className="size-4 text-muted-foreground shrink-0" />
                                            <input
                                                id="signup-last-name"
                                                type="text"
                                                {...register("lastName")}
                                                placeholder="Doe"
                                                aria-label="Last Name"
                                                autoComplete="family-name"
                                                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden border-none p-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="signup-email" className="block text-xs font-semibold text-foreground mb-1.5">
                                        Email Address
                                    </label>
                                    <div className={cn(
                                        "flex items-center rounded-xl border bg-background/50 px-3.5 h-11 gap-3 transition-all",
                                        errors.email ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30" : "border-border focus-within:ring-2 focus-within:ring-ring/40"
                                    )}>
                                        <Mail className="size-4 text-muted-foreground shrink-0" />
                                        <input
                                            id="signup-email"
                                            type="email"
                                            {...register("email")}
                                            placeholder="name@company.com"
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
                                    <label htmlFor="signup-password" className="block text-xs font-semibold text-foreground mb-1.5">
                                        Password
                                    </label>
                                    <div className={cn(
                                        "flex items-center rounded-xl border bg-background/50 px-3.5 h-11 gap-3 transition-all",
                                        errors.password ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30" : "border-border focus-within:ring-2 focus-within:ring-ring/40"
                                    )}>
                                        <Lock className="size-4 text-muted-foreground shrink-0" />
                                        <input
                                            id="signup-password"
                                            type={showPassword ? "text" : "password"}
                                            {...register("password")}
                                            placeholder="Minimum 8 characters"
                                            aria-label="Password"
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
                                            <span>Create Account</span>
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
                        Already have an account?{" "}
                        <Link href={"/sign-in" as any} className="font-semibold text-foreground hover:text-primary underline-offset-4 hover:underline transition-all">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side Partition: High-Impact Unsplash Visual Graphic Panel */}
            <div className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between min-h-screen bg-zinc-950">
                {/* Unsplash Background Image */}
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"
                    alt="SchemaFlow Studio Network Visual"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                />

                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/15 via-black/15 to-black/15 backdrop-blur-xs" />

                {/* Middle: Glassmorphic Typography Box */}
                <div className="relative z-10 my-auto w-full max-w-lg mx-auto">
                    <div className="border border-white/15 bg-black/65 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                            Join Thousands Building Next-Gen Database Models.
                        </h2>
                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal drop-shadow-sm">
                            Create visual schema models, collaborate seamlessly with your team, and export type-safe ORM definitions in seconds.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSignUp;

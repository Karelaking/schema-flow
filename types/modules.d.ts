declare module "cmdk" {
    import * as React from "react";

    export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
        label?: string;
        shouldFilter?: boolean;
        filter?: (value: string, search: string) => number;
        value?: string;
        onValueChange?: (value: string) => void;
        loop?: boolean;
    }

    export const Command: React.ForwardRefExoticComponent<
        CommandProps & React.RefAttributes<HTMLDivElement>
    > & {
        Input: React.ForwardRefExoticComponent<any>;
        List: React.ForwardRefExoticComponent<any>;
        Empty: React.ForwardRefExoticComponent<any>;
        Group: React.ForwardRefExoticComponent<any>;
        Item: React.ForwardRefExoticComponent<any>;
        Separator: React.ForwardRefExoticComponent<any>;
        Loading: React.ForwardRefExoticComponent<any>;
    };
}

declare module "sonner" {
    import * as React from "react";

    export interface ToasterProps {
        theme?: "light" | "dark" | "system";
        position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
        richColors?: boolean;
        expand?: boolean;
        duration?: number;
        visibleToasts?: number;
        closeButton?: boolean;
        toastOptions?: any;
        className?: string;
        style?: React.CSSProperties;
    }

    export const Toaster: React.FC<ToasterProps>;

    export const toast: {
        (message: string | React.ReactNode, data?: any): string | number;
        success: (message: string | React.ReactNode, data?: any) => string | number;
        error: (message: string | React.ReactNode, data?: any) => string | number;
        info: (message: string | React.ReactNode, data?: any) => string | number;
        warning: (message: string | React.ReactNode, data?: any) => string | number;
        dismiss: (id?: string | number) => void;
    };
}

declare module "idb-keyval" {
    export function get<T = any>(key: IDBValidKey): Promise<T | undefined>;
    export function set(key: IDBValidKey, val: any): Promise<void>;
    export function del(key: IDBValidKey): Promise<void>;
    export function keys(): Promise<IDBValidKey[]>;
    export function clear(): Promise<void>;
}

interface Window {
    showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
}

interface FileSystemHandlePermissionDescriptor {
    mode?: "read" | "readwrite";
}

interface FileSystemHandle {
    queryPermission?: (descriptor?: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
    requestPermission?: (descriptor?: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
}

declare module "@clerk/nextjs" {
    import * as React from "react";
    export const ClerkProvider: React.FC<{ children: React.ReactNode }>;
    export const SignInButton: React.FC<{ children?: React.ReactNode; mode?: string }>;
    export const SignUpButton: React.FC<{ children?: React.ReactNode; mode?: string }>;
    export const UserButton: React.FC<any>;
    export const SignIn: React.FC<any>;
    export const SignUp: React.FC<any>;
    export function useUser(): { isLoaded: boolean; isSignedIn?: boolean; user?: any };
    export function useAuth(): { isLoaded: boolean; isSignedIn?: boolean; userId?: string | null };
}

declare module "@clerk/nextjs/server" {
    export function clerkMiddleware(handler?: any): any;
    export function createRouteMatcher(patterns: string[]): (req: any) => boolean;
    export function auth(): Promise<{ userId: string | null; sessionClaims?: any }>;
    export const clerkClient: {
        users: {
            updateUserMetadata: (userId: string, metadata: { publicMetadata?: any; privateMetadata?: any }) => Promise<any>;
            getUser: (userId: string) => Promise<any>;
        };
    };
}

declare module "gsap" {
    export const gsap: any;
    export default gsap;
}

declare module "gsap/ScrollTrigger" {
    export const ScrollTrigger: any;
    export default ScrollTrigger;
}

declare module "yaml" {
    export function parse(text: string): any;
    export function stringify(value: any): string;
    const YAML: {
        parse: (text: string) => any;
        stringify: (value: any) => string;
    };
    export default YAML;
}

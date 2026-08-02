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



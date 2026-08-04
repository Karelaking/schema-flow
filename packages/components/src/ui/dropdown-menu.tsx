"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * DropdownMenu root — manages open/close state.
 */
const DropdownMenu = ({ ...props }: MenuPrimitive.Root.Props): React.JSX.Element => {
    return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
};

/**
 * DropdownMenu portal — renders children into a portal.
 */
const DropdownMenuPortal = ({ ...props }: MenuPrimitive.Portal.Props): React.JSX.Element => {
    return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
};

/**
 * DropdownMenu trigger — wraps the element that opens the menu.
 */
const DropdownMenuTrigger = ({ ...props }: MenuPrimitive.Trigger.Props): React.JSX.Element => {
    return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
};

/**
 * Props for the DropdownMenuContent component.
 */
type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
    Pick<
        MenuPrimitive.Positioner.Props,
        "align" | "alignOffset" | "side" | "sideOffset"
    >;

/**
 * DropdownMenu content — the floating dropdown panel.
 * Follows SRP: positioning is delegated to the Positioner primitive.
 */
const DropdownMenuContent = ({
    align = "start",
    alignOffset = 0,
    side = "bottom",
    sideOffset = 4,
    className,
    ...props
}: DropdownMenuContentProps): React.JSX.Element => {
    return (
        <MenuPrimitive.Portal>
            <MenuPrimitive.Positioner
                className="isolate z-50 outline-none"
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
            >
                <MenuPrimitive.Popup
                    data-slot="dropdown-menu-content"
                    className={cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className)}
                    {...props}
                />
            </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
    );
};

/**
 * DropdownMenu group — groups related menu items.
 */
const DropdownMenuGroup = ({ ...props }: MenuPrimitive.Group.Props): React.JSX.Element => {
    return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
};

/**
 * Props for items that support the inset layout pattern.
 */
interface InsetProps {
    inset?: boolean;
}

/**
 * DropdownMenu label — non-interactive header for a group.
 */
const DropdownMenuLabel = ({
    className,
    inset,
    ...props
}: MenuPrimitive.GroupLabel.Props & InsetProps): React.JSX.Element => {
    return (
        <MenuPrimitive.GroupLabel
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={cn(
                "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
                className
            )}
            {...props}
        />
    );
};

/**
 * Props for the DropdownMenuItem component.
 */
type DropdownMenuItemProps = MenuPrimitive.Item.Props & InsetProps & {
    variant?: "default" | "destructive";
};

/**
 * DropdownMenu item — individual interactive option within the menu.
 */
const DropdownMenuItem = ({
    className,
    inset,
    variant = "default",
    ...props
}: DropdownMenuItemProps): React.JSX.Element => {
    return (
        <MenuPrimitive.Item
            data-slot="dropdown-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
                className
            )}
            {...props}
        />
    );
};

/**
 * DropdownMenu sub — manages a submenu.
 */
const DropdownMenuSub = ({ ...props }: MenuPrimitive.SubmenuRoot.Props): React.JSX.Element => {
    return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
};

/**
 * DropdownMenu sub trigger — opens a submenu on hover/focus.
 */
const DropdownMenuSubTrigger = ({
    className,
    inset,
    children,
    ...props
}: MenuPrimitive.SubmenuTrigger.Props & InsetProps): React.JSX.Element => {
    return (
        <MenuPrimitive.SubmenuTrigger
            data-slot="dropdown-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        >
            {children}
            <ChevronRightIcon className="ml-auto" />
        </MenuPrimitive.SubmenuTrigger>
    );
};

/**
 * DropdownMenu sub content — the floating submenu panel.
 * Reuses DropdownMenuContent for DRY positioning logic.
 */
const DropdownMenuSubContent = ({
    align = "start",
    alignOffset = -3,
    side = "right",
    sideOffset = 0,
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuContent>): React.JSX.Element => {
    return (
        <DropdownMenuContent
            data-slot="dropdown-menu-sub-content"
            className={cn("w-auto min-w-24 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className)}
            align={align}
            alignOffset={alignOffset}
            side={side}
            sideOffset={sideOffset}
            {...props}
        />
    );
};

/**
 * DropdownMenu checkbox item — toggleable menu option with check indicator.
 */
const DropdownMenuCheckboxItem = ({
    className,
    children,
    checked,
    inset,
    ...props
}: MenuPrimitive.CheckboxItem.Props & InsetProps): React.JSX.Element => {
    return (
        <MenuPrimitive.CheckboxItem
            data-slot="dropdown-menu-checkbox-item"
            data-inset={inset}
            className={cn(
                "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            checked={checked}
            {...props}
        >
            <span
                className="pointer-events-none absolute right-2 flex items-center justify-center"
                data-slot="dropdown-menu-checkbox-item-indicator"
            >
                <MenuPrimitive.CheckboxItemIndicator>
                    <CheckIcon />
                </MenuPrimitive.CheckboxItemIndicator>
            </span>
            {children}
        </MenuPrimitive.CheckboxItem>
    );
};

/**
 * DropdownMenu radio group — groups mutually exclusive radio items.
 */
const DropdownMenuRadioGroup = ({ ...props }: MenuPrimitive.RadioGroup.Props): React.JSX.Element => {
    return (
        <MenuPrimitive.RadioGroup
            data-slot="dropdown-menu-radio-group"
            {...props}
        />
    );
};

/**
 * DropdownMenu radio item — mutually exclusive menu option.
 */
const DropdownMenuRadioItem = ({
    className,
    children,
    inset,
    ...props
}: MenuPrimitive.RadioItem.Props & InsetProps): React.JSX.Element => {
    return (
        <MenuPrimitive.RadioItem
            data-slot="dropdown-menu-radio-item"
            data-inset={inset}
            className={cn(
                "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        >
            <span
                className="pointer-events-none absolute right-2 flex items-center justify-center"
                data-slot="dropdown-menu-radio-item-indicator"
            >
                <MenuPrimitive.RadioItemIndicator>
                    <CheckIcon />
                </MenuPrimitive.RadioItemIndicator>
            </span>
            {children}
        </MenuPrimitive.RadioItem>
    );
};

/**
 * DropdownMenu separator — visual divider between menu sections.
 */
const DropdownMenuSeparator = ({
    className,
    ...props
}: MenuPrimitive.Separator.Props): React.JSX.Element => {
    return (
        <MenuPrimitive.Separator
            data-slot="dropdown-menu-separator"
            className={cn("-mx-1 my-1 h-px bg-border", className)}
            {...props}
        />
    );
};

/**
 * DropdownMenu shortcut — keyboard shortcut indicator within a menu item.
 */
const DropdownMenuShortcut = ({
    className,
    ...props
}: React.ComponentProps<"span">): React.JSX.Element => {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn(
                "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
                className
            )}
            {...props}
        />
    );
};

export {
    DropdownMenu,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
};

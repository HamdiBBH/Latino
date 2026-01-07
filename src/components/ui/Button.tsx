"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "dark" | "outline" | "outline-light" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children: React.ReactNode;
}

const buttonVariants = {
    primary:
        "bg-gray-900 text-white border-gray-900 hover:bg-[#E8A87C] hover:border-[#E8A87C]",
    dark: "bg-gray-900 text-white border-gray-900 hover:bg-[#E8A87C] hover:border-[#E8A87C]",
    outline:
        "bg-transparent text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white",
    "outline-light":
        "bg-transparent text-white border-white/50 hover:bg-white hover:text-gray-900 hover:border-white",
    ghost: "bg-transparent text-gray-900 border-transparent hover:bg-gray-100",
};

const buttonSizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3.5 text-base",
    lg: "px-9 py-5 text-base",
};

export function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2.5",
                "font-semibold leading-none rounded-full",
                "border transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-lg",
                "focus:outline-none focus:ring-2 focus:ring-[#E8A87C]/50 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
                buttonVariants[variant],
                buttonSizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

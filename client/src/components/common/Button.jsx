import React from "react";
import { cn } from "./classNames";

const VARIANT_STYLES = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZE_STYLES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {leftIcon}
      <span className="flex flex-row items-center justify-start gap-3">{children}</span>
      {rightIcon}
    </button>
  );
}

import React from "react";
import { cn } from "./classNames";

const TONE_STYLES = {
  neutral:
    "text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200",
  info: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
  danger:
    "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
};

export default function IconButton({
  icon,
  label,
  tone = "neutral",
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-gray-700",
        TONE_STYLES[tone],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

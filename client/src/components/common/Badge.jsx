import React from "react";
import { cn } from "./classNames";

const TONE_STYLES = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  slate: "bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-200",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

export default function Badge({ tone = "slate", dotColor, className = "", children }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", TONE_STYLES[tone], className)}>
      {dotColor && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />}
      {children}
    </span>
  );
}

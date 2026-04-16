import React from "react";
import { cn } from "./classNames";

export default function Card({ className = "", children }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
}

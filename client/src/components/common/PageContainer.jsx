import React from "react";
import { cn } from "./classNames";

export default function PageContainer({ className = "", children }) {
  return (
    <div className={cn("min-h-screen bg-slate-50 p-6 transition-colors duration-300 dark:bg-gray-900", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}

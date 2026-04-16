import React from "react";
import { cn } from "./classNames";

export default function LoadingSpinner({ size = "md", centered = false, className = "" }) {
  const sizeClass = size === "lg" ? "h-10 w-10 border-[5px]" : "h-8 w-8 border-4";

  const spinner = (
    <div className={cn("animate-spin rounded-full border-blue-600 border-t-transparent", sizeClass, className)} />
  );

  if (centered) {
    return <div className="flex items-center justify-center">{spinner}</div>;
  }

  return spinner;
}

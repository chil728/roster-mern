import React from "react";
import { cn } from "./classNames";

export default function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  rightAdornment,
  className = "",
  inputClassName = "",
  multiline = false,
  rows = 3,
  ...props
}) {
  const baseFieldClass = cn(
    "w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-10 text-base text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
    !icon && "pl-3",
    !rightAdornment && "pr-3",
    multiline && "resize-none",
    inputClassName
  );

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-base font-medium text-slate-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400">
          {icon}
        </span>
      )}

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={baseFieldClass}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseFieldClass}
          {...props}
        />
      )}

      {rightAdornment && (
        <span className="absolute right-3 top-[28px] -translate-y-1/2 text-slate-400 dark:text-gray-400">
          {rightAdornment}
        </span>
      )}
    </div>
  );
}

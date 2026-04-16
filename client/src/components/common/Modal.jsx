import React from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={`w-full ${maxWidth} rounded-xl bg-white p-6 shadow-xl transition-colors duration-300 dark:bg-gray-800`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {children}

        {footer && <div className="pt-4">{footer}</div>}
      </div>
    </div>
  );
}

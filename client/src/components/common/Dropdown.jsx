import React, { useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Dropdown({
  label,
  value,
  options = [],
  placeholder = "Select",
  open,
  onOpenChange,
  onChange,
}) {
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, onOpenChange]);

  return (
    <div>
      {label && (
        <label className="mb-1 block text-base font-medium text-slate-700 dark:text-gray-300">{label}</label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-base text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              {selectedOption.color && (
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedOption.color }} />
              )}
              <span className="font-medium">{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-slate-400 dark:text-gray-400">{placeholder}</span>
          )}
          <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
            role="listbox"
          >
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-gray-600"
                  role="option"
                  aria-selected={value === option.value}
                >
                  <span className="flex items-center gap-2">
                    {option.color && (
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: option.color }} />
                    )}
                    <span className="text-base font-medium text-slate-700 dark:text-gray-200">{option.label}</span>
                  </span>
                  {value === option.value && (
                    <Check size={16} className="text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2.5 text-base text-slate-500 dark:text-gray-400">No options available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

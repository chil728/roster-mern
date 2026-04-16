import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import TextField from "./TextField";

export default function PasswordField({ id, value, onChange, placeholder, required = false }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      id={id}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      icon={<Lock className="h-5 w-5" />}
      rightAdornment={
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-slate-400 transition-colors hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      }
    />
  );
}

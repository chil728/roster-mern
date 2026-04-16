import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const Avatar = ({ user, onActionComplete }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isEmailVerified =
    user?.isVerified ?? user?.emailVerified ?? user?.isAccountVerified ?? true;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleVerifyEmail = () => {
    setOpen(false);
    if (onActionComplete) {
      onActionComplete();
    }
    navigate("/email-verify");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm text-white relative"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {!isEmailVerified && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
        )}
        {user?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
      </button>

      {open && !isEmailVerified && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50"
          role="menu"
        >
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-700 rounded-lg"
            onClick={handleVerifyEmail}
            role="menuitem"
          >
            Verify Email
          </button>
        </div>
      )}
    </div>
  );
};

export default Avatar;

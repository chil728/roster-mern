import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Layers, LayoutDashboard, LogIn, LogOut, Menu, X, Sun, Moon, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from "react-toastify";
import api from "../lib/api";
import Button from "./common/Button";
import IconButton from "./common/IconButton";
import Avatar from "./Avatar";

const NavBar = () => {
  const navigate = useNavigate();

  const { isLoggedIn, setIsLoggedIn, setUser, user } =
    useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [isOpen, setIsOpen] = useState(false);
  const navLinkClassName =
    "text-base font-semibold text-gray-600 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white";

  const logout = async () => {
    try {
      const { data } = await api.post("/auth/logout");
      console.log(data);
      if (data.success) {
        setIsLoggedIn(false);
        setUser(null);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 text-black dark:text-white md:px-8 px-2 h-20 shadow-md relative z-50 transition-colors duration-300">
      <div className="flex justify-between items-center h-full">
        {/* Left Side - Logo or Title */}
        <div className="text-4xl bg-gradient-to-tr from-blue-500 to-indigo-400 bg-clip-text text-transparent">
          <button className="font-bold" onClick={() => navigate("/")}>
            Roster
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <IconButton
            icon={theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            label="Toggle theme"
            tone="neutral"
            onClick={toggleTheme}
          />
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <IconButton
            icon={theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            label="Toggle theme"
            tone="neutral"
            onClick={toggleTheme}
          />
          <button
            className={navLinkClassName}
            onClick={() => navigate("/")}
          >
            Home
          </button>
          {isLoggedIn && user?.role === "admin" && (
            <button
              className={navLinkClassName}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          )}
          <button
            className={navLinkClassName}
            onClick={() => navigate("/types")}
          >
            Types
          </button>
          {isLoggedIn ? (
            <>
              <Avatar user={user} />
              <Button variant="secondary" size="lg" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <div>
              <Button variant="secondary" size="lg" onClick={() => navigate("/login")} className="mr-4">
                Login
              </Button>
              <Button variant="primary" size="lg" onClick={() => navigate("/register")}>
                Sign Up
              </Button>
            </div>
            
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[60%] bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col p-6 pb-10 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end mb-8">
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-6 items-start">
          <div className="mb-4 flex gap-3 items-center text-lg">
            <Avatar user={user} onActionComplete={() => setIsOpen(false)} />
            { isLoggedIn ? `Welcome, ${user?.username || "User"}!` : "Guest" }
          </div>
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-xl font-semibold w-full text-left flex items-center gap-3"
            onClick={() => {
              navigate("/");
              setIsOpen(false);
            }}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-xl font-semibold w-full text-left flex items-center gap-3"
            onClick={() => {
              navigate("/types");
              setIsOpen(false);
            }}
          >
            <Layers className="w-5 h-5" />
            Types
          </button>
          {isLoggedIn && user?.role === "admin" && (
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-xl font-semibold w-full text-left flex items-center gap-3"
              onClick={() => {
                navigate("/dashboard");
                setIsOpen(false);
              }}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
          )}
          {isLoggedIn ? (
            <div className="w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full text-xl"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="secondary"
                size="lg"
                className="w-full text-xl"
                onClick={() => {
                  navigate("/login");
                  setIsOpen(false);
                }}
              >
                <LogIn className="h-5 w-5" />
                Login
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-full text-xl mt-4"
                onClick={() => {
                  navigate("/register");
                  setIsOpen(false);
                }}
              >
                <User className="h-5 w-5" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;

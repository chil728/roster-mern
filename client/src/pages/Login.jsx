import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { User } from "lucide-react";
import AuthCard from "../components/common/AuthCard";
import TextField from "../components/common/TextField";
import PasswordField from "../components/common/PasswordField";
import Button from "../components/common/Button";

const Login = () => {
  const navigate = useNavigate();

  const { setIsLoggedIn, getUserData, getUserTypes } = useContext(AuthContext);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
    
      const { data } = await api.post("/auth/login", { username, password });
      
      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
        await getUserTypes();
        navigate("/");
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthCard
      title="Login"
      footer={
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-gray-400">
          Don&apos;t have an account?
          <button
            onClick={() => navigate("/register")}
            className="ml-1 font-medium text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up here
          </button>
        </p>
      }
    >
      <form className="flex flex-col justify-center" onSubmit={submitHandler}>
        <div className="mb-4">
          <TextField
            id="username"
            name="username"
            icon={<User className="h-5 w-5" />}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <PasswordField
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <p className="mb-6 text-sm text-slate-600 dark:text-gray-400">
          Forgot Password?
          <button
            type="button"
            onClick={() => navigate("/reset-password")}
            className="ml-1 font-medium text-blue-500 underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Reset here
          </button>
        </p>

        <Button type="submit" variant="primary" size="lg" fullWidth>
          Login
        </Button>
      </form>
    </AuthCard>
  );
};

export default Login;

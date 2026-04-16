import { User, Mail } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/api";
import AuthCard from "../components/common/AuthCard";
import TextField from "../components/common/TextField";
import PasswordField from "../components/common/PasswordField";
import Button from "../components/common/Button";

const Register = () => {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submitHandler = async (e) => {
    try {
      e.preventDefault();

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const { data } = await api.post("/auth/register", { username, email, password });
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <AuthCard
      title="Register"
      footer={
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-gray-400">
          Already have an account?
          <button
            onClick={() => navigate("/login")}
            className="ml-1 font-medium text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Login here
          </button>
        </p>
      }
    >
      <form className="flex flex-col justify-center" onSubmit={submitHandler}>
        <div className="mb-4">
          <TextField
            id="username"
            icon={<User className="h-5 w-5" />}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <TextField
            id="email"
            type="email"
            icon={<Mail className="h-5 w-5" />}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <PasswordField
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <PasswordField
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth>
          Register
        </Button>
      </form>
    </AuthCard>
  );
};

export default Register;

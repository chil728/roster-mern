import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";
import api from "../lib/api";
import AuthCard from "../components/common/AuthCard";
import TextField from "../components/common/TextField";
import PasswordField from "../components/common/PasswordField";
import Button from "../components/common/Button";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email first.");
      return;
    }

    if (cooldown > 0) {
      toast.info(`Please wait ${cooldown}s before resending.`);
      return;
    }

    try {
      setIsSending(true);
      const { data } = await api.post("/auth/send-reset-otp", {
        email: email.trim().toLowerCase(),
      });

      if (data.success) {
        setCodeSent(true);
        setOtpVerified(false);
        setCooldown(60);
        toast.success(data.message || "Reset code sent.");
      } else {
        toast.error(data.message || "Failed to send reset code.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email.trim() || !otp.trim()) {
      toast.error("Please enter email and reset code.");
      return;
    }

    try {
      setIsVerifyingCode(true);
      const { data } = await api.post("/auth/verify-reset-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (data.success) {
        setOtpVerified(true);
        toast.success(data.message || "Reset code verified.");
      } else {
        toast.error(data.message || "Failed to verify reset code.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim() || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!otpVerified) {
      toast.error("Please verify reset code first.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsResetting(true);
      const { data } = await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      if (data.success) {
        toast.success(data.message || "Password reset successfully.");
        navigate("/login");
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      footer={
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-gray-400">
          Remember your password?
          <button
            onClick={() => navigate("/login")}
            className="ml-1 font-medium text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to login
          </button>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="reset-email"
          type="email"
          icon={<Mail className="h-5 w-5" />}
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!codeSent && (
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSendCode}
            disabled={isSending || cooldown > 0}
          >
            {isSending ? "Sending code..." : cooldown > 0 ? `Send again in ${cooldown}s` : "Send Reset Code"}
          </Button>
        )}

        {codeSent && !otpVerified && (
          <>
            <TextField
              id="reset-otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              required
            />
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleVerifyCode}
              disabled={isVerifyingCode}
            >
              {isVerifyingCode ? "Verifying code..." : "Verify Code"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              onClick={handleSendCode}
              disabled={isSending || cooldown > 0}
            >
              {isSending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
            </Button>
          </>
        )}

        {otpVerified && (
          <>
            <PasswordField
              id="new-password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <PasswordField
              id="confirm-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isResetting}>
              {isResetting ? "Resetting..." : "Reset Password"}
            </Button>
          </>
        )}
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "../lib/api";
import AuthCard from "../components/common/AuthCard";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import TextField from "../components/common/TextField";
import { AuthContext } from "../context/AuthContext";

const EmailVerify = () => {
  const navigate = useNavigate();
  const { user, getUserData } = useContext(AuthContext);
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (user?.isVerified) {
      setVerified(true);
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (user?.isVerified) {
      toast.info("Your email is already verified.");
      return;
    }

    if (cooldown > 0) {
      toast.info(`Please wait ${cooldown}s before resending.`);
      return;
    }

    try {
      setIsSending(true);
      const { data } = await api.post("/auth/send-verify-otp");

      if (data.success) {
        setCodeSent(true);
        setCooldown(60);
        toast.success(data.message || "Verification code sent.");
      } else {
        toast.error(data.message || "Failed to send verification code.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      setIsVerifying(true);
      const { data } = await api.post("/auth/verify-email", {
        otp: otp.trim(),
      });

      if (data.success) {
        toast.success(data.message || "Email verified successfully.");
        setVerified(true);
        await getUserData();
      } else {
        toast.error(data.message || "Verification failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthCard
      title="Email Verification"
      footer={
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-gray-400">
          Didn&apos;t receive it?
          <button
            onClick={handleSendCode}
            disabled={isSending || cooldown > 0}
            className="ml-1 font-medium text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isSending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
        </p>
      }
    >
      <form className="space-y-4 text-center" onSubmit={handleVerify}>
        <div className="flex justify-center">
          <Badge tone="green" className="text-sm">
            <MailCheck className="h-4 w-4" />
            {user?.isVerified || verified ? "Verified" : "Pending verification"}
          </Badge>
        </div>

        {!(user?.isVerified || verified) && !codeSent && (
          <>
            <p className="text-base text-slate-600 dark:text-gray-300">
              Click the button below to receive your verification code.
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendCode}
              disabled={isSending || cooldown > 0}
            >
              {isSending ? "Sending code..." : cooldown > 0 ? `Send again in ${cooldown}s` : "Send Verification Code"}
            </Button>
          </>
        )}

        {!(user?.isVerified || verified) && codeSent && (
          <>
            <p className="text-base text-slate-600 dark:text-gray-300">
              Please enter the 6-digit code from your email.
            </p>
            <TextField
              id="verify-otp"
              label="Verification Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              inputMode="numeric"
              required
            />
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
          </>
        )}

        {(user?.isVerified || verified) && (
          <Button type="button" variant="primary" size="lg" fullWidth onClick={() => navigate("/")}>
            Continue to Home
          </Button>
        )}

        <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </form>
    </AuthCard>
  );
};

export default EmailVerify;
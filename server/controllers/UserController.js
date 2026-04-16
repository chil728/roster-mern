import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Type from "../models/Type.js";
import dotenv from "dotenv";

import transporter from "../config/nodemailer.js";

dotenv.config();

const getCookieOptions = (req) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isHttps = req.secure || forwardedProto === "https";
  const secure = isHttps;

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const getClearCookieOptions = (req) => {
  const { httpOnly, secure, sameSite, path } = getCookieOptions(req);
  return { httpOnly, secure, sameSite, path };
};

export async function register(req, res) {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ success: false, message: "Invalid email address" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      });
    }

    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return res.json({
        success: false,
        message: "Password must contain at least one letter and one number",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, getCookieOptions(req));

    const mailOptions = {
      from: process.env.SENDER_GMAIL,
      to: email,
      subject: "Welcome to Roster App",
      text: `Hi ${username},\n\nThank you for registering at Roster App! We're excited to have you on board.\n\nBest regards,\nRoster App Team`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    return res.json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        success: false,
        message: "Username and password required",
      });
    }

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, getCookieOptions(req));

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", getClearCookieOptions(req));

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.body;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (req.userID === id) {
      res.clearCookie("token", getClearCookieOptions(req));
    }

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
}

export async function getUserData(req, res) {
  try {
    const userID = req.userID;
    const user = await User.findById(userID);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export async function sendVerifyOtp(req, res) {
  const userID = req.userID || req.body.userID;
  try {
    const user = await User.findById(userID);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "Email already verified." });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_GMAIL,
      to: user.email,
      subject: "Verify Your Account - Roster App",
      html: `
        <p>Hello ${user.username},</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>Please use this code to verify your email address.</p>
        <p>This code will expire in 15 minutes.</p>
        <p>Best regards,<br/>Roster App Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Verification OTP sent to email." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyEmail(req, res) {
  const userID = req.userID || req.body.userID;
  const otp = String(req.body.otp || "").trim();

  try {
    if (!otp) {
      return res.json({ success: false, message: "Verification code is required." });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "Email already verified." });
    }

    if (!user.verifyOtp || !user.verifyOtpExpires) {
      return res.json({ success: false, message: "Please request a verification code first." });
    }

    if (Date.now() > new Date(user.verifyOtpExpires).getTime()) {
      return res.json({ success: false, message: "Verification code expired. Please request a new one." });
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid verification code." });
    }

    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpires = null;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function sendResetOtp(req, res) {
  const email = req.body.email?.trim().toLowerCase();

  try {
    if (!email) {
      return res.json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });

    // Do not leak whether account exists
    if (!user) {
      return res.json({ success: true, message: "If this email exists, a reset code has been sent." });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_GMAIL,
      to: user.email,
      subject: "Reset Your Password - Roster App",
      html: `
        <p>Hello ${user.username},</p>
        <p>Your password reset code is: <strong>${otp}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>Roster App Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "If this email exists, a reset code has been sent." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyResetOtp(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();

  try {
    if (!email || !otp) {
      return res.json({ success: false, message: "Email and reset code are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid reset request." });
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.json({ success: false, message: "Please request a reset code first." });
    }

    if (Date.now() > new Date(user.resetPasswordExpires).getTime()) {
      return res.json({ success: false, message: "Reset code expired. Please request a new one." });
    }

    if (user.resetPasswordToken !== otp) {
      return res.json({ success: false, message: "Invalid reset code." });
    }

    return res.json({ success: true, message: "Reset code verified." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function resetPassword(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();
  const newPassword = req.body.newPassword;

  try {
    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "Email, verification code, and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters long" });
    }

    if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      return res.json({ success: false, message: "Password must contain at least one letter and one number" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid reset request." });
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.json({ success: false, message: "Please request a reset code first." });
    }

    if (Date.now() > new Date(user.resetPasswordExpires).getTime()) {
      return res.json({ success: false, message: "Reset code expired. Please request a new one." });
    }

    if (user.resetPasswordToken !== otp) {
      return res.json({ success: false, message: "Invalid reset code." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function isAuthenticated(req, res) {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

// Admin utility function to find user id
export async function findUsers(req, res) {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "username email role createdAt updatedAt"
    );

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const typesCount = await Type.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          typesCount,
        };
      })
    );

    return res.status(200).json({ success: true, users: usersWithCounts });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
}

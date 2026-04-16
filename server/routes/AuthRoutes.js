import express from "express";
import dotenv from "dotenv";

import {
  register,
  login,
  deleteUser,
  logout,
  findUsers,
  isAuthenticated,
  getUserData,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
} from "../controllers/UserController.js";
import {
  userAuth,
  userRoleAuth,
} from "../middleware/userAuth.js";

const AuthRouter = express.Router();

dotenv.config();

// Admin utility routes
AuthRouter.get("/users", userAuth, userRoleAuth("admin"), findUsers);
AuthRouter.delete("/delete", userAuth, userRoleAuth("admin"), deleteUser);

AuthRouter.post("/register", register);
AuthRouter.post("/login", login);
AuthRouter.get("/me", userAuth, getUserData);
AuthRouter.get("/check", userAuth, isAuthenticated);
AuthRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
AuthRouter.post("/verify-email", userAuth, verifyEmail);
AuthRouter.post("/send-reset-otp", sendResetOtp);
AuthRouter.post("/verify-reset-otp", verifyResetOtp);
AuthRouter.post("/reset-password", resetPassword);
AuthRouter.post("/logout", userAuth, logout);

export default AuthRouter;

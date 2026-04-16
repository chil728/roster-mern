import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Please Login." })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.id) {
      req.userID = decodedToken.id;
      req.role = decodedToken.role;
      next();
    } else {
      return res.status(401).json({ success: false, message: "Not Authorized. Invalid token." })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const userRoleAuth = (allowedRole) => {
  return async (req, res, next) => {
    try {
      if (req.role !== allowedRole) {
        return res.status(403).json({ success: false, message: "Not Authorized. No Permission." })
      }
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export { userAuth, userRoleAuth };
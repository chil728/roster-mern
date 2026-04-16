import express from "express";
import dotenv from "dotenv";
import {
  getTypes,
  getType,
  createType,
  updateType,
  deleteType,
} from "../controllers/TypeController.js";
import { userAuth } from "../middleware/userAuth.js";

const TypeRouter = express.Router();

dotenv.config();

TypeRouter.get("/", userAuth, getTypes);
TypeRouter.get("/:id", userAuth, getType);
TypeRouter.post("/", userAuth, createType);
TypeRouter.put("/:id", userAuth, updateType);
TypeRouter.delete("/:id",userAuth, deleteType);

export default TypeRouter;
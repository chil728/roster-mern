import express from "express";
import dotenv from "dotenv";

import {
  createRoster,
  getRostersByMonth,
  getRostersByCycle,
  updateRoster,
  deleteRoster,
  bulkCreateRoster,
  bulkDeleteRoster,
} from "../controllers/RosterController.js";
import { userAuth } from "../middleware/userAuth.js";

const RosterRouter = express.Router();

RosterRouter.use(userAuth);

dotenv.config();

RosterRouter.get("/by-cycle", getRostersByCycle);
RosterRouter.get("/", getRostersByMonth);
RosterRouter.post("/", createRoster);
RosterRouter.post("/bulk", bulkCreateRoster);
RosterRouter.delete("/bulk", bulkDeleteRoster);
RosterRouter.put("/:id", updateRoster);
RosterRouter.delete("/:id", deleteRoster);

export default RosterRouter;

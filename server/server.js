import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import AuthRouter from "./routes/AuthRoutes.js";
import TypeRouter from "./routes/TypeRoutes.js";
import RosterRouter from "./routes/RosterRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

// Connect to MongoDB and start the server
connectDB();

// Middlewares
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", AuthRouter);
app.use("/types", TypeRouter);
app.use("/rosters", RosterRouter);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

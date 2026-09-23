import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json(
    new ApiResponse("Service is healthy", {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStates[mongoose.connection.readyState] ?? "unknown",
    })
  );
});

export default router;

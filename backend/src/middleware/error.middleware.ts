import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { isProd } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof MulterError) {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File exceeds the 5MB size limit" : err.message;
  } else if (err instanceof Error) {
    message = isProd ? "Internal Server Error" : err.message;
    if ((err as { code?: number }).code === 11000) {
      statusCode = 409;
      message = "Duplicate value violates a unique constraint";
    }
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = err.message;
    }
    if (err.name === "CastError") {
      statusCode = 400;
      message = "Invalid identifier supplied";
    }
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}`, { stack: (err as Error)?.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(isProd ? {} : { stack: (err as Error)?.stack }),
  });
}

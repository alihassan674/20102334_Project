// ─────────────────────────────────────────────────────────────
// Lodgely — Global Error Handling Middleware
// ─────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from "express";

/** Custom application error with HTTP status code */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** 404 handler for unmatched routes */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/** Centralized error response handler */
export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${statusCode} — ${message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};

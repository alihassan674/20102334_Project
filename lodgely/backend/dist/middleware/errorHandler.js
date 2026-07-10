"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Error Handling Middleware (middleware/errorHandler.ts)
//
// Express needs a centralized place to catch and respond to
// errors. Without this, a crash in a controller would just
// hang the request or show a confusing default error page.
//
// This file provides:
//   1. AppError class — a custom error type that carries an HTTP status code
//   2. notFoundHandler — catches requests to routes that don't exist (404)
//   3. globalErrorHandler — catches ALL errors thrown anywhere in the app
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.notFoundHandler = exports.AppError = void 0;
// ── 1. Custom Error Class ─────────────────────────────────────
// By extending the built-in Error class, we can attach extra
// information (statusCode) that our global handler will read.
//
// Usage example:
//   throw new AppError("Room not found", 404);
class AppError extends Error {
    statusCode; // HTTP status code (e.g. 400, 404, 500)
    isOperational; // true = expected error (not a bug)
    constructor(message, statusCode = 500, isOperational = true) {
        super(message); // Call the parent Error constructor
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Fix the prototype chain so `instanceof AppError` works correctly
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
// ── 2. Not Found Handler (404) ────────────────────────────────
// Express calls this when NO route matched the incoming request.
// We create an AppError with status 404 and pass it to `next()`
// which forwards it to the globalErrorHandler below.
const notFoundHandler = (req, _res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
exports.notFoundHandler = notFoundHandler;
// ── 3. Global Error Handler ───────────────────────────────────
// Express recognizes a middleware with 4 parameters (err, req, res, next)
// as an ERROR-handling middleware. It runs whenever next(error) is called.
//
// We always return a consistent JSON structure:
//   { success: false, error: { message: "..." } }
// This makes it easy for the frontend to parse and display errors.
const globalErrorHandler = (err, _req, res, _next) => {
    // If the error is an AppError, use its status code; otherwise it's a bug → 500
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";
    // Always log the error on the server so we can debug it
    console.error(`[ERROR] ${statusCode} — ${message}`);
    // In development, also print the full stack trace to the terminal
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
    }
    // Send a clean JSON error response back to the client (frontend)
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            // Only include the stack trace in development (never expose it in production)
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        },
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=errorHandler.js.map
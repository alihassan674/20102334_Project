"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Global Error Handling Middleware
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.notFoundHandler = exports.AppError = void 0;
/** Custom application error with HTTP status code */
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
/** 404 handler for unmatched routes */
const notFoundHandler = (req, _res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
exports.notFoundHandler = notFoundHandler;
/** Centralized error response handler */
const globalErrorHandler = (err, _req, res, _next) => {
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
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=errorHandler.js.map
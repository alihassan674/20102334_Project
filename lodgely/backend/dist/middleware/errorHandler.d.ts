import { Request, Response, NextFunction } from "express";
/** Custom application error with HTTP status code */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
/** 404 handler for unmatched routes */
export declare const notFoundHandler: (req: Request, _res: Response, next: NextFunction) => void;
/** Centralized error response handler */
export declare const globalErrorHandler: (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map
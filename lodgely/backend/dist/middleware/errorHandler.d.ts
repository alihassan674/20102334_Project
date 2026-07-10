import { Request, Response, NextFunction } from "express";
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare const notFoundHandler: (req: Request, _res: Response, next: NextFunction) => void;
export declare const globalErrorHandler: (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map
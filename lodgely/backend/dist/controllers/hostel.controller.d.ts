import { Request, Response } from "express";
/** GET /api/hostels — List all hostels with room counts */
export declare const getAllHostels: (_req: Request, res: Response) => Promise<void>;
/** GET /api/hostels/:id — Get hostel details with rooms */
export declare const getHostelById: (req: Request, res: Response) => Promise<void>;
/** POST /api/hostels — Create a new hostel */
export declare const createHostel: (req: Request, res: Response) => Promise<void>;
/** PUT /api/hostels/:id — Update hostel */
export declare const updateHostel: (req: Request, res: Response) => Promise<void>;
/** DELETE /api/hostels/:id — Delete hostel (cascades to rooms/students) */
export declare const deleteHostel: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=hostel.controller.d.ts.map
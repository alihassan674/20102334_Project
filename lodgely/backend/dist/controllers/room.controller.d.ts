import { Request, Response } from "express";
/** GET /api/rooms — List rooms with optional filters */
export declare const getAllRooms: (req: Request, res: Response) => Promise<void>;
/** GET /api/rooms/:id — Get single room with students */
export declare const getRoomById: (req: Request, res: Response) => Promise<void>;
/** POST /api/rooms — Create a new room */
export declare const createRoom: (req: Request, res: Response) => Promise<void>;
/** PUT /api/rooms/:id — Update room details */
export declare const updateRoom: (req: Request, res: Response) => Promise<void>;
/** DELETE /api/rooms/:id — Delete room */
export declare const deleteRoom: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=room.controller.d.ts.map
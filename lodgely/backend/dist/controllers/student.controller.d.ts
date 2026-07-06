import { Request, Response } from "express";
/** GET /api/students — List all students with room/hostel info */
export declare const getAllStudents: (req: Request, res: Response) => Promise<void>;
/** GET /api/students/:id — Get single student */
export declare const getStudentById: (req: Request, res: Response) => Promise<void>;
/** POST /api/students — Register student + auto-assign to room */
export declare const createStudent: (req: Request, res: Response) => Promise<void>;
/** PUT /api/students/:id — Update student info */
export declare const updateStudent: (req: Request, res: Response) => Promise<void>;
/** DELETE /api/students/:id — Remove student (check-out) */
export declare const deleteStudent: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=student.controller.d.ts.map
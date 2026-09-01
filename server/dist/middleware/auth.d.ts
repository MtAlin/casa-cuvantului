import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
}
declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => void;
export default auth;
//# sourceMappingURL=auth.d.ts.map
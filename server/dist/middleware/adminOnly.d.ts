import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
declare const adminOnly: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export default adminOnly;
//# sourceMappingURL=adminOnly.d.ts.map
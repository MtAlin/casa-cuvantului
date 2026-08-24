import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      res.status(401).json({ message: 'No authorization header, access denied' });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: 'Invalid token format. Use: Bearer <token>' });
      return;
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired, please login again' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token, access denied' });
      return;
    }
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

export default auth;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; plan: string; is_admin: boolean };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const result = await pool.query(
      'SELECT id, email, plan, is_admin FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!result.rows[0]) return res.status(401).json({ error: 'User not found' });
    req.user = result.rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

export const requirePremium = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.plan !== 'premium') {
    return res.status(403).json({ error: 'Premium plan required', upgrade: true });
  }
  next();
};

import { Response, NextFunction } from 'express';
import pool from '../db/pool';
import { AuthRequest } from './auth';

export const logActivity = (action: string, entityType?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode < 400 && req.user) {
        pool.query(
          `INSERT INTO activity_logs (user_id, action, entity_type, metadata, ip_address)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            req.user.id,
            action,
            entityType || null,
            JSON.stringify({ method: req.method, path: req.path }),
            req.ip,
          ]
        ).catch(console.error);
      }
      return originalJson(body);
    };
    next();
  };
};

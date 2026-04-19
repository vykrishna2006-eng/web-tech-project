import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [users, apps, payments, activeToday] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE plan='premium') as premium FROM users`),
      pool.query(`SELECT COUNT(*) as total FROM applications`),
      pool.query(`SELECT COALESCE(SUM(amount),0) as revenue FROM payments WHERE status='completed'`),
      pool.query(`SELECT COUNT(DISTINCT user_id) as count FROM activity_logs WHERE created_at >= NOW() - INTERVAL '24 hours'`),
    ]);
    res.json({
      totalUsers: parseInt(users.rows[0].total),
      premiumUsers: parseInt(users.rows[0].premium),
      totalApplications: parseInt(apps.rows[0].total),
      revenue: parseInt(payments.rows[0].revenue) / 100,
      activeToday: parseInt(activeToday.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  let query = `SELECT id, name, email, plan, subscription_status, is_admin, created_at,
    (SELECT COUNT(*) FROM applications WHERE user_id = users.id) as app_count
    FROM users`;
  const params: unknown[] = [];
  if (search) { query += ` WHERE name ILIKE $1 OR email ILIKE $1`; params.push(`%${search}%`); }
  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// GET /api/admin/activity
router.get('/activity', async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT al.*, u.name, u.email FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC LIMIT 100`
  );
  res.json(result.rows);
});

// PATCH /api/admin/users/:id/toggle-admin
router.patch('/users/:id/toggle-admin', async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'UPDATE users SET is_admin = NOT is_admin WHERE id = $1 RETURNING id, name, is_admin',
    [req.params.id]
  );
  res.json(result.rows[0]);
});

export default router;

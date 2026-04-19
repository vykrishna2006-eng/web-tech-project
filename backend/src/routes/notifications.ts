import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [req.user!.id]
  );
  res.json(result.rows);
});

router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
  res.json({ success: true });
});

router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user!.id]);
  res.json({ success: true });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
  res.json({ success: true });
});

export default router;

import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await pool.query('SELECT * FROM tags WHERE user_id = $1 ORDER BY name', [req.user!.id]);
  res.json(result.rows);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, color } = req.body;
  const result = await pool.query(
    'INSERT INTO tags (user_id, name, color) VALUES ($1,$2,$3) RETURNING *',
    [req.user!.id, name, color || '#6366f1']
  );
  res.status(201).json(result.rows[0]);
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await pool.query('DELETE FROM tags WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
  res.json({ success: true });
});

export default router;

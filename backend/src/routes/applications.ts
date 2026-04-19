import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();
router.use(authenticate);

// GET /api/applications
router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, search, tag } = req.query;
  try {
    let query = `
      SELECT a.*, 
        r.name as resume_name,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color)) 
          FILTER (WHERE t.id IS NOT NULL), '[]') as tags,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', il.id, 'round_name', il.round_name, 'outcome', il.outcome))
          FILTER (WHERE il.id IS NOT NULL), '[]') as interview_rounds
      FROM applications a
      LEFT JOIN resumes r ON a.resume_id = r.id
      LEFT JOIN application_tags at2 ON a.id = at2.application_id
      LEFT JOIN tags t ON at2.tag_id = t.id
      LEFT JOIN interview_logs il ON a.id = il.application_id
      WHERE a.user_id = $1
    `;
    const params: unknown[] = [req.user!.id];
    let idx = 2;

    if (status) { query += ` AND a.status = $${idx++}`; params.push(status); }
    if (search) { query += ` AND (a.company_name ILIKE $${idx} OR a.role ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
    if (tag) { query += ` AND t.name = $${idx++}`; params.push(tag); }

    query += ` GROUP BY a.id, r.name ORDER BY a.position_order ASC, a.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/applications
router.post('/', async (req: AuthRequest, res: Response) => {
  const { company_name, role, job_url, location, salary_range, status, priority, applied_date, deadline, resume_id, notes, tags } = req.body;
  try {
    // Check free plan limit
    if (req.user!.plan === 'free') {
      const count = await pool.query('SELECT COUNT(*) FROM applications WHERE user_id = $1', [req.user!.id]);
      if (parseInt(count.rows[0].count) >= 10) {
        return res.status(403).json({ error: 'Free plan limit reached (10 applications). Upgrade to Premium.', upgrade: true });
      }
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, company_name, role, job_url, location, salary_range, status, priority, applied_date, deadline, resume_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user!.id, company_name, role, job_url, location, salary_range, status || 'applied', priority || 'medium', applied_date, deadline, resume_id || null, notes]
    );
    const app = result.rows[0];

    // Add tags
    if (tags && tags.length > 0) {
      for (const tagId of tags) {
        await pool.query('INSERT INTO application_tags (application_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [app.id, tagId]);
      }
    }

    // Emit real-time event
    getIO().to(`user:${req.user!.id}`).emit('application:created', app);

    // Create notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, application_id) VALUES ($1, $2, $3, $4, $5)`,
      [req.user!.id, 'Application Added', `You applied to ${company_name} for ${role}`, 'success', app.id]
    );

    res.status(201).json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/applications/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { company_name, role, job_url, location, salary_range, status, priority, applied_date, deadline, resume_id, notes, tags } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM applications WHERE id = $1 AND user_id = $2', [id, req.user!.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Application not found' });

    const result = await pool.query(
      `UPDATE applications SET company_name=$1, role=$2, job_url=$3, location=$4, salary_range=$5, status=$6, priority=$7,
       applied_date=$8, deadline=$9, resume_id=$10, notes=$11, updated_at=NOW()
       WHERE id=$12 AND user_id=$13 RETURNING *`,
      [company_name, role, job_url, location, salary_range, status, priority, applied_date, deadline, resume_id || null, notes, id, req.user!.id]
    );

    // Update tags
    if (tags !== undefined) {
      await pool.query('DELETE FROM application_tags WHERE application_id = $1', [id]);
      for (const tagId of tags) {
        await pool.query('INSERT INTO application_tags (application_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tagId]);
      }
    }

    const app = result.rows[0];
    getIO().to(`user:${req.user!.id}`).emit('application:updated', app);

    // Notify on status change
    if (existing.rows[0].status !== status) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, application_id) VALUES ($1, $2, $3, $4, $5)`,
        [req.user!.id, 'Status Updated', `${company_name} moved to ${status}`, 'info', id]
      );
      getIO().to(`user:${req.user!.id}`).emit('notification:new', { title: 'Status Updated', message: `${company_name} moved to ${status}` });
    }

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/applications/reorder - Kanban drag-drop
router.patch('/reorder', async (req: AuthRequest, res: Response) => {
  const { updates } = req.body; // [{ id, status, position_order }]
  try {
    for (const u of updates) {
      await pool.query(
        'UPDATE applications SET status = $1, position_order = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4',
        [u.status, u.position_order, u.id, req.user!.id]
      );
    }
    getIO().to(`user:${req.user!.id}`).emit('applications:reordered', updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM applications WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    getIO().to(`user:${req.user!.id}`).emit('application:deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

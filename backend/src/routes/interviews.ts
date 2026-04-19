import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();
router.use(authenticate);

// GET /api/interviews
router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT il.*, a.company_name, a.role FROM interview_logs il
     JOIN applications a ON il.application_id = a.id
     WHERE il.user_id = $1 ORDER BY il.interview_date DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

// POST /api/interviews
router.post('/', async (req: AuthRequest, res: Response) => {
  const { application_id, round_name, interview_date, interviewer_name, format, questions, feedback, outcome } = req.body;
  try {
    const app = await pool.query('SELECT * FROM applications WHERE id = $1 AND user_id = $2', [application_id, req.user!.id]);
    if (!app.rows[0]) return res.status(404).json({ error: 'Application not found' });

    const result = await pool.query(
      `INSERT INTO interview_logs (application_id, user_id, round_name, interview_date, interviewer_name, format, questions, feedback, outcome)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [application_id, req.user!.id, round_name, interview_date, interviewer_name, format, questions, feedback, outcome || 'pending']
    );

    // Notify
    const notif = {
      title: 'Interview Scheduled',
      message: `${round_name} at ${app.rows[0].company_name} on ${new Date(interview_date).toLocaleDateString()}`,
    };
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, application_id) VALUES ($1,$2,$3,'info',$4)`,
      [req.user!.id, notif.title, notif.message, application_id]
    );
    getIO().to(`user:${req.user!.id}`).emit('notification:new', notif);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/interviews/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { round_name, interview_date, interviewer_name, format, questions, feedback, outcome } = req.body;
  try {
    const result = await pool.query(
      `UPDATE interview_logs SET round_name=$1, interview_date=$2, interviewer_name=$3, format=$4, questions=$5, feedback=$6, outcome=$7, updated_at=NOW()
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [round_name, interview_date, interviewer_name, format, questions, feedback, outcome, req.params.id, req.user!.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/interviews/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await pool.query('DELETE FROM interview_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
  res.json({ success: true });
});

export default router;

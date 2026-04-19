import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/analytics/overview
router.get('/overview', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [totals, byStatus, byMonth, conversionRate, topCompanies, responseRate] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM applications WHERE user_id = $1`, [userId]),
      pool.query(`SELECT status, COUNT(*) as count FROM applications WHERE user_id = $1 GROUP BY status`, [userId]),
      pool.query(`
        SELECT TO_CHAR(applied_date, 'YYYY-MM') as month, COUNT(*) as count
        FROM applications WHERE user_id = $1 AND applied_date >= NOW() - INTERVAL '6 months'
        GROUP BY month ORDER BY month ASC`, [userId]),
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'applied') as applied,
          COUNT(*) FILTER (WHERE status IN ('oa','interview','offer')) as progressed,
          COUNT(*) FILTER (WHERE status = 'offer') as offers,
          COUNT(*) FILTER (WHERE status = 'interview') as interviews
        FROM applications WHERE user_id = $1`, [userId]),
      pool.query(`
        SELECT company_name, COUNT(*) as count FROM applications 
        WHERE user_id = $1 GROUP BY company_name ORDER BY count DESC LIMIT 5`, [userId]),
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status != 'applied') as responded
        FROM applications WHERE user_id = $1`, [userId]),
    ]);

    const conv = conversionRate.rows[0];
    const total = parseInt(conv.applied) + parseInt(conv.progressed);

    res.json({
      total: parseInt(totals.rows[0].total),
      byStatus: byStatus.rows,
      byMonth: byMonth.rows,
      conversion: {
        applicationToInterview: total > 0 ? ((parseInt(conv.interviews) / total) * 100).toFixed(1) : 0,
        applicationToOffer: total > 0 ? ((parseInt(conv.offers) / total) * 100).toFixed(1) : 0,
        interviewToOffer: parseInt(conv.interviews) > 0 ? ((parseInt(conv.offers) / parseInt(conv.interviews)) * 100).toFixed(1) : 0,
      },
      topCompanies: topCompanies.rows,
      responseRate: parseInt(responseRate.rows[0].total) > 0
        ? ((parseInt(responseRate.rows[0].responded) / parseInt(responseRate.rows[0].total)) * 100).toFixed(1)
        : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/timeline
router.get('/timeline', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(applied_date, 'YYYY-MM-DD') as date,
        COUNT(*) as applications,
        COUNT(*) FILTER (WHERE status = 'offer') as offers,
        COUNT(*) FILTER (WHERE status = 'interview') as interviews
      FROM applications 
      WHERE user_id = $1 AND applied_date >= NOW() - INTERVAL '90 days'
      GROUP BY date ORDER BY date ASC`, [req.user!.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

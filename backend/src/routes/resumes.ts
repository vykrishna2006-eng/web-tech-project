import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents allowed'));
    }
  },
});

// GET /api/resumes
router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT r.*, COUNT(a.id) as usage_count 
     FROM resumes r LEFT JOIN applications a ON r.id = a.resume_id
     WHERE r.user_id = $1 GROUP BY r.id ORDER BY r.created_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

// POST /api/resumes
router.post('/', upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { name, is_default } = req.body;
  try {
    if (is_default === 'true') {
      await pool.query('UPDATE resumes SET is_default = false WHERE user_id = $1', [req.user!.id]);
    }
    const result = await pool.query(
      `INSERT INTO resumes (user_id, name, file_url, file_size, is_default) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user!.id, name || req.file.originalname, `/uploads/${req.file.filename}`, req.file.size, is_default === 'true']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING file_url', [req.params.id, req.user!.id]);
    if (result.rows[0]) {
      const filePath = path.join(uploadDir, path.basename(result.rows[0].file_url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

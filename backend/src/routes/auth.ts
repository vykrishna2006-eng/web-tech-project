import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator"; // ✅ FIXED
import pool from "../db/pool";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();


// ================= REGISTER =================
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req: Request, res: Response) => {

    console.log("REGISTER BODY:", req.body); // ✅ DEBUG

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 12);

      const result = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hash]
      );

      const user = result.rows[0];

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      await pool.query(
        "INSERT INTO tags (user_id, name, color) VALUES ($1, 'Remote', '#10b981')",
        [user.id]
      );

      res.status(201).json({ token, user });

    } catch (err) {
      console.error("REGISTER ERROR:", err); // ✅ DEBUG
      res.status(500).json({ error: "Server error" });
    }
  }
);


// ================= LOGIN =================
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req: Request, res: Response) => {

    console.log("LOGIN BODY:", req.body); // ✅ DEBUG

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      const { password_hash, ...safeUser } = user;

      res.json({ token, user: safeUser });

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);


// ================= ME =================
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user!.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ================= UPDATE PROFILE =================
router.put(
  "/profile",
  authenticate,
  async (req: AuthRequest, res: Response) => {

    const { name, avatar_url } = req.body;

    try {
      const result = await pool.query(
        "UPDATE users SET name=$1, avatar_url=$2 WHERE id=$3 RETURNING id, name, email",
        [name, avatar_url, req.user!.id]
      );

      res.json(result.rows[0]);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
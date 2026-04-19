import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();
router.use(authenticate);

// Mock Razorpay integration (replace with real Razorpay SDK in production)
// POST /api/payments/create-order
router.post('/create-order', async (req: AuthRequest, res: Response) => {
  const { plan } = req.body;
  const amount = plan === 'premium_yearly' ? 199900 : 19900; // in paise (₹1999/yr or ₹199/mo)

  try {
    // In production: const razorpay = new Razorpay({...}); const order = await razorpay.orders.create({...});
    const mockOrderId = `order_mock_${Date.now()}`;

    await pool.query(
      `INSERT INTO payments (user_id, razorpay_order_id, amount, currency, status, plan) VALUES ($1,$2,$3,'INR','pending',$4)`,
      [req.user!.id, mockOrderId, amount, plan]
    );

    res.json({
      orderId: mockOrderId,
      amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/payments/verify
router.post('/verify', async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, plan } = req.body;

  try {
    // In production: verify signature with crypto HMAC
    // For mock: just mark as completed
    await pool.query(
      `UPDATE payments SET razorpay_payment_id = $1, status = 'completed' WHERE razorpay_order_id = $2 AND user_id = $3`,
      [razorpay_payment_id || `pay_mock_${Date.now()}`, razorpay_order_id, req.user!.id]
    );

    const endDate = plan === 'premium_yearly'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `UPDATE users SET plan = 'premium', subscription_status = 'active', subscription_end_date = $1 WHERE id = $2`,
      [endDate, req.user!.id]
    );

    // Notify user
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, 'Premium Activated!', 'Welcome to InternTrack Pro Premium. Enjoy unlimited tracking!', 'success')`,
      [req.user!.id]
    );
    getIO().to(`user:${req.user!.id}`).emit('subscription:upgraded', { plan: 'premium' });

    res.json({ success: true, plan: 'premium' });
  } catch (err) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// GET /api/payments/history
router.get('/history', async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user!.id]
  );
  res.json(result.rows);
});

// POST /api/payments/cancel
router.post('/cancel', async (req: AuthRequest, res: Response) => {
  await pool.query(
    `UPDATE users SET plan = 'free', subscription_status = 'cancelled' WHERE id = $1`,
    [req.user!.id]
  );
  res.json({ success: true });
});

export default router;

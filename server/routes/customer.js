const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { Order, OTP } = require('../models');

// POST /api/customer/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });

    const orders = await Order.find({ 'customer.phone': phone });
    if (!orders.length) return res.status(404).json({ error: 'No orders found for this number' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTP.deleteMany({ phone });
    await OTP.create({ phone, otp, expiresAt });

    // Dev mode: OTP returned in response (replace with Twilio SMS later)
    res.json({ success: true, otp });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/customer/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

    const record = await OTP.findOne({ phone, otp });
    if (!record) return res.status(401).json({ error: 'Invalid OTP. Please try again.' });
    if (record.expiresAt < new Date()) return res.status(401).json({ error: 'OTP expired. Request a new one.' });

    await OTP.deleteMany({ phone });

    const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/customer/orders
router.get('/orders', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

    const token = auth.replace('Bearer ', '');
    const { phone } = jwt.verify(token, process.env.JWT_SECRET);

    const orders = await Order.find({ 'customer.phone': phone }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (e) {
    res.status(401).json({ error: 'Session expired. Please login again.' });
  }
});

module.exports = router;

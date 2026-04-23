const router  = require('express').Router();
const { Order } = require('../models');
const authMiddleware = require('../middleware/auth');

// ── PUBLIC: place an order ───────────────────────────────
// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { product, productName, price, currency, customer, notes } = req.body;
    if (!product || !customer?.name || !customer?.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const order = await Order.create({ product, productName, price, currency, customer, notes });
    res.status(201).json({ success: true, orderId: order._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: list all orders ───────────────────────────────
// GET /api/orders  (auth required)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: get single order ─────────────────────────────
// GET /api/orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: update order status / tracking ──────────────
// PATCH /api/orders/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(trackingNumber && { trackingNumber }), ...(notes !== undefined && { notes }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: delete order ──────────────────────────────────
// DELETE /api/orders/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: stats summary ─────────────────────────────────
// GET /api/orders/meta/stats
router.get('/meta/stats', authMiddleware, async (req, res) => {
  try {
    const [total, pending, confirmed, shipped, delivered, cancelled, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$price' } } }]),
    ]);
    res.json({ total, pending, confirmed, shipped, delivered, cancelled, revenue: revenue[0]?.total || 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

const router  = require('express').Router();
const { Order } = require('../models');
const authMiddleware = require('../middleware/auth');

// ── PUBLIC: place an order ───────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { product, productName, price, currency, customer, notes, paymentIntent, downPayment, balance } = req.body;
    if (!product || !customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ error: 'Name, email and phone are required' });
    }
    const order = await Order.create({
      product, productName, price, currency, customer, notes,
      paymentIntent: paymentIntent || 'later',
      downPayment: downPayment || 4000,
      balance: balance || 3999,
    });
    res.status(201).json({ success: true, orderId: order._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: stats ─────────────────────────────────────────
router.get('/meta/stats', authMiddleware, async (req, res) => {
  try {
    const statuses = ['order_placed','down_payment_received','in_production','ready_to_ship','shipped','delivered','balance_payment_received','cancelled'];
    const counts = await Promise.all(statuses.map(s => Order.countDocuments({ status: s })));
    const total = await Order.countDocuments();
    const downPaidCount = await Order.countDocuments({ downPaymentPaid: true });
    const balancePaidCount = await Order.countDocuments({ balancePaid: true });
    const revenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$price' } } }]);
    const result = { total, downPaidCount, balancePaidCount, revenue: revenue[0]?.total || 0 };
    statuses.forEach((s, i) => { result[s] = counts[i]; });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: list all orders ───────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
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

// ── ADMIN: get single order ──────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: update order ──────────────────────────────────
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, trackingNumber, notes, downPaymentPaid, balancePaid } = req.body;
    const update = {
      ...(status !== undefined && { status }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(notes !== undefined && { notes }),
      ...(downPaymentPaid !== undefined && { downPaymentPaid }),
      ...(balancePaid !== undefined && { balancePaid }),
    };
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: delete order ──────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

const router = require('express').Router();
const { Notify } = require('../models');
const authMiddleware = require('../middleware/auth');

// POST /api/notify  — public signup
router.post('/', async (req, res) => {
  try {
    const { email, product = 'juno2' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    await Notify.findOneAndUpdate({ email }, { email, product }, { upsert: true, new: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/notify  — admin: list all signups
router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await Notify.find().sort({ createdAt: -1 });
    res.json({ list, total: list.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/notify/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Notify.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

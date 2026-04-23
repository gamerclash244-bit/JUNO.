const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { Admin } = require('../models');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/seed  — run once to create the admin account
// Protected by a secret query param so random people can't call it
router.get('/seed', async (req, res) => {
  try {
    if (req.query.secret !== process.env.JWT_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (exists) return res.json({ message: 'Admin already exists' });

    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await Admin.create({ email: process.env.ADMIN_EMAIL, password: hash });
    res.json({ message: 'Admin created' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

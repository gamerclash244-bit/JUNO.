const mongoose = require('mongoose');

// ── ORDER MODEL ──────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  product: { type: String, required: true },          // 'juno1'
  productName: { type: String, required: true },      // 'JUNO.1'
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  customer: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String },
    address: { type: String },
    city:    { type: String },
    state:   { type: String },
    pincode: { type: String },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: { type: String },
  trackingNumber: { type: String },
}, { timestamps: true });

// ── NOTIFY MODEL (Juno.2 waitlist) ──────────────────────
const notifySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  product: { type: String, default: 'juno2' },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

// ── ADMIN MODEL ──────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = {
  Order:  mongoose.model('Order',  orderSchema),
  Notify: mongoose.model('Notify', notifySchema),
  Admin:  mongoose.model('Admin',  adminSchema),
};

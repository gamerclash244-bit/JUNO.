const mongoose = require('mongoose');

// ── ORDER MODEL ──────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  product:     { type: String, required: true },
  productName: { type: String, required: true },
  price:       { type: Number, required: true },
  downPayment: { type: Number, default: 4000 },
  balance:     { type: Number, default: 3999 },
  currency:    { type: String, default: 'INR' },
  customer: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String },
    city:    { type: String },
    state:   { type: String },
    pincode: { type: String },
  },
  paymentIntent:   { type: String, enum: ['now', 'later'], default: 'later' },
  downPaymentPaid: { type: Boolean, default: false },
  balancePaid:     { type: Boolean, default: false },
  status: {
    type: String,
    enum: [
      'order_placed','down_payment_received','in_production',
      'ready_to_ship','shipped','delivered',
      'balance_payment_received','cancelled',
    ],
    default: 'order_placed',
  },
  notes:         { type: String },
  trackingNumber:{ type: String },
}, { timestamps: true });

// ── OTP MODEL ────────────────────────────────────────────
const otpSchema = new mongoose.Schema({
  phone:     { type: String, required: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true },
}, { timestamps: true });

// ── NOTIFY MODEL ─────────────────────────────────────────
const notifySchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  product:  { type: String, default: 'juno2' },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

// ── ADMIN MODEL ──────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = {
  Order:  mongoose.model('Order',  orderSchema),
  OTP:    mongoose.model('OTP',    otpSchema),
  Notify: mongoose.model('Notify', notifySchema),
  Admin:  mongoose.model('Admin',  adminSchema),
};

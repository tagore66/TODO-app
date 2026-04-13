const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Plan pricings in Paise (INR * 100)
const PLANS = {
  weekly: 49 * 100,
  monthly: 149 * 100,
  yearly: 999 * 100
};

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ name, email, password });
    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.googleId) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get current user status
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create Razorpay Order
router.post('/create-order', authMiddleware, async (req, res) => {
  const { plan } = req.body;
  const amount = PLANS[plan];

  if (!amount) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  try {
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_order_${Math.random().toString(36).substring(7)}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).send('Subscription order failed');
  }
});

// Verify Razorpay Payment
router.post('/verify-payment', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Payment verified, update user subscription
    try {
      const user = await User.findById(req.user.id);
      user.subscription.isSubscribed = true;
      user.subscription.plan = plan;
      
      const now = new Date();
      if (plan === 'weekly') now.setDate(now.getDate() + 7);
      else if (plan === 'monthly') now.setDate(now.getDate() + 30);
      else if (plan === 'yearly') now.setDate(now.getDate() + 365);
      
      user.subscription.expiryDate = now;
      await user.save();
      
      res.json({ success: true, message: 'Subscription activated!' });
    } catch (err) {
      res.status(500).send('Error updating subscription');
    }
  } else {
    res.status(400).json({ message: 'Invalid payment signature' });
  }
});

module.exports = router;

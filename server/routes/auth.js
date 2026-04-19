const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

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
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ name, email, password });
    await user.save();

    const tempToken = jwt.sign({ id: user.id, mfaSetupPending: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
    res.json({ forceMfaSetup: true, tempToken });
  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    res.status(500).json({ 
      message: err.code === 11000 ? 'Email already registered' : 'Server error during signup',
      details: err.message 
    });
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

    if (!user.mfaEnabled) {
      // MFA setup is mandatory
      const tempToken = jwt.sign({ id: user.id, mfaSetupPending: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
      return res.json({ forceMfaSetup: true, tempToken });
    }

    // MFA is enabled — require OTP
    const tempToken = jwt.sign({ id: user.id, mfaPending: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
    return res.json({ mfaRequired: true, tempToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user status
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
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

// MFA Setup - Generate Secret & QR Code
router.post('/mfa/setup', async (req, res) => {
  const { tempToken } = req.body;
  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.mfaSetupPending) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({
      name: `TodoApp (${user.email})`,
      issuer: 'TodoApp'
    });

    // Save secret to user but don't enable it yet
    user.mfaSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qrCodeUrl });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'MFA setup failed' });
  }
});

// MFA Verify Setup - Enable MFA
router.post('/mfa/verify-setup', async (req, res) => {
  const { tempToken, token } = req.body;
  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.mfaSetupPending) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      user.mfaEnabled = true;
      await user.save();
      
      const payload = { id: user.id };
      const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token: authToken, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'MFA verification failed' });
  }
});

// MFA Verify - During Login
router.post('/mfa/verify', async (req, res) => {
  const { tempToken, token } = req.body;
  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.mfaPending) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      const payload = { id: user.id };
      const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token: authToken, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'MFA verification failed' });
  }
});

module.exports = router;

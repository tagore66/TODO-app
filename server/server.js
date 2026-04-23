require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const path = require('path');
const https = require('https');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();


app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        });
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const payload = { id: req.user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`/dashboard.html?token=${token}`);
  });


app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});


const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  setInterval(() => {
    https.get(`${RENDER_URL}/ping`, (res) => {
      console.log(`Keep-alive ping status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Keep-alive ping error:', err.message);
    });
  }, 14 * 60 * 1000); 
}


app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

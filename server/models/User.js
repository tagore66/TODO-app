const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; } // Password required only for local auth
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  subscription: {
    isSubscribed: { type: Boolean, default: false },
    plan: { type: String, enum: ['none', 'weekly', 'monthly', 'yearly'], default: 'none' },
    expiryDate: { type: Date }
  },
  mfaSecret: {
  type: String,
  default: null,
},
mfaEnabled: {
  type: Boolean,
  default: false,
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }

  // Encrypt mfaSecret before saving
  if (this.isModified('mfaSecret') && this.mfaSecret) {
    this.mfaSecret = encrypt(this.mfaSecret);
  }
  
  next();
});

// Decrypt mfaSecret after initializing
UserSchema.post('init', function(doc) {
  if (doc.mfaSecret) {
    doc.mfaSecret = decrypt(doc.mfaSecret);
  }
});

// Method to verify password
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);

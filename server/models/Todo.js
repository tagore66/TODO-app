const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const TodoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt task before saving
TodoSchema.pre('save', function(next) {
  if (this.isModified('task')) {
    this.task = encrypt(this.task);
  }
  next();
});

// Decrypt task after initializing
TodoSchema.post('init', function(doc) {
  if (doc.task) {
    doc.task = decrypt(doc.task);
  }
});

module.exports = mongoose.model('Todo', TodoSchema);

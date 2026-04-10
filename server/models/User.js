const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema(
  {
    handle: { type: String, default: '' },
    lastUpdated: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    platforms: {
      leetcode: { type: platformSchema, default: () => ({}) },
      codeforces: { type: platformSchema, default: () => ({}) },
      codechef: { type: platformSchema, default: () => ({}) },
    },
    preferences: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      defaultView: {
        type: String,
        enum: ['dashboard', 'contests'],
        default: 'dashboard',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);

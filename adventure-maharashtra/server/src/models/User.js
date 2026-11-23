import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  normalizedEmail: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'PARK_ADMIN', 'ENTRY_STAFF', 'SUPER_ADMIN'],
    default: 'CUSTOMER',
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'PENDING'],
    default: 'ACTIVE'
  },
  assignedParks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Park'
  }]
}, {
  timestamps: true
});

userSchema.pre('save', function() {
  if (this.email) {
    this.normalizedEmail = this.email.toLowerCase().trim();
  }
});

export const User = mongoose.model('User', userSchema);
export default User;
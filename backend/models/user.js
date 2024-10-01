import mongoose from 'mongoose';

// Main User schema
const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true, unique: true },
  lastname: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    default: 'User',
  },
  profilePic: {
    type: String,
    default: 'https://res.cloudinary.com/dhcawltsr/image/upload/v1719572309/user_swzm7h.webp',
  },
  birthday: { type: Date, required: false },
  age: { type: Number },
  createdAt: { type: Date, default: Date.now },
  
  // Developer-specific fields, only required if role is 'Developer'
  developerAttributes: {
    portfolioLinks: [{ type: String, required: function() { return this.role === 'Developer'; } }], // Required if role is Developer
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: function() { return this.role === 'Developer'; } }, // Required if role is Developer
    income: { 
      type: Number, 
      default: 0,
      required: function() { return this.role === 'Developer'; } // Ensure this is only for developers
    },
  },

  
});

// No need for a pre-save hook, Mongoose will enforce conditions
export const User = mongoose.model('User', UserSchema);

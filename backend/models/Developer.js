import mongoose from 'mongoose';

const DeveloperSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  portfolioLinks: [{ type: String, required: true }], // Array of portfolio links
  birthday: { type: Date, required: false }, // Optional birthday field
  profilePic: { type: String }, // URL for profile picture
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: 'Developer' },
});

// Create the Developer model from the schema
const Developer = mongoose.model('Developer', DeveloperSchema);

export default Developer;

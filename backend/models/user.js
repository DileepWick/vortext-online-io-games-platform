// user.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    unique: true,
  },
  lastname: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic: {
    type: String,
    default: "https://res.cloudinary.com/dhcawltsr/image/upload/v1719572309/user_swzm7h.webp",
  },
  birthday: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
  },
  playerType: {
    type: String,
    enum: ["Kid", "Teenager", "Adult"],
  },
});

export const User = mongoose.model("User", UserSchema);

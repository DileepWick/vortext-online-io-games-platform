import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const DirectContactUs = mongoose.model("DirectContactUs", MessageSchema);

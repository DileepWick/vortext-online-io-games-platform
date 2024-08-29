import mongoose from "mongoose";
const { Schema } = mongoose;

const ContactUs = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
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

export const ContactUsSchema = mongoose.model("ContactUsSchema", ContactUs);

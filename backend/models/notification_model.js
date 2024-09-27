import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  type: {
    type: String,
    enum: ["contact_reply", "other"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  contactId: {
    type: Schema.Types.ObjectId,
    ref: "ContactUsSchema",
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.model("Notification", NotificationSchema);

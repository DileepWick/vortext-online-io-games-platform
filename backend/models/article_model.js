import mongoose from "mongoose";
const { Schema } = mongoose;

const articleSchema = new Schema({
  heading: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  articleBody: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

export const Article = mongoose.model("Article", articleSchema);
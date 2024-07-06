import mongoose from "mongoose";

const { Schema } = mongoose;

const communityPostSchema = new Schema({
      image: {
        type: String,
      },
      content: {
        type: String,
        required: true,
      },
      TaggedGames: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
      }],
      uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
});

export const CommunityPost = mongoose.model("CommunityPost",communityPostSchema)
// Model
import { CommunityPost } from "../models/communityPost.js";
import mongoose from "mongoose";

// Util
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// Create New Post
export const createPost = async (req, res) => {
  try {
    let imageUrl = null;

    if (!req.body.uploader) {
      return res.json({
        message: "Uploader is not provided",
      });
    }

    // Check if an image is provided and upload it to Cloudinary
    if (req.files && req.files.image && req.files.image.length > 0) {
      const imageResult = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: "article images",
          resource_type: "image",
        }
      );

      if (!imageResult || !imageResult.secure_url) {
        return res.status(500).json({
          message: "Could not upload the image",
        });
      }

      imageUrl = imageResult.secure_url;

      // Remove uploaded file from server
      fs.unlinkSync(req.files.image[0].path);
    }

    // Create new post object
    const newPost = new CommunityPost({
      uploader: req.body.uploader,
      content: req.body.content,
      image: imageUrl,
      TaggedGames: req.body.TaggedGames || [],
    });

    // Save the post in the database
    const createdPost = await newPost.save();

    // Send success message if post created
    if (createdPost) {
      return res.status(201).json({
        message: "Post uploaded successfully",
        post: createdPost,
      });
    } else {
      return res.status(500).json({
        message: "Failed to create post",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

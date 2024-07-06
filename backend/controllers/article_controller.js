//Model
import { Article } from "../models/article_model.js";

import mongoose from "mongoose";

//Util
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// Create new article
export const createArticle = async (req, res) => {
  try {
    // Check the inputs
    if (!req.body.heading || !req.body.articleBody || !req.body.uploader) {
      return res.status(400).json({
        message: "Uploader Heading and Body are required",
      });
    }

    // Upload image to Cloudinary
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

    // Create new article object
    const newArticle = new Article({
      uploader: req.body.uploader,
      heading: req.body.heading,
      articleBody: req.body.articleBody,
      image: imageResult.secure_url,
    });

    // Save the article in the database
    const createdArticle = await newArticle.save();

    // Send success message if article created
    if (createdArticle) {
      return res.status(201).json({
        message: "Article created successfully",
      });
    }

    // Remove uploaded files from server
    fs.unlinkSync(req.files.image[0].path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

// Increase Like by 1 or Decrease Like by 1 based on toggle
export const toggleLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const index = article.likedBy.indexOf(userId);

    if (index === -1) {
      // User has not liked the article, increase likes
      article.likes += 1;
      article.likedBy.push(userId);
    } else {
      // User has liked the article, decrease likes
      article.likes -= 1;
      article.likedBy.splice(index, 1);
    }

    await article.save();

    res.status(200).json({ message: "Like toggled successfully", likes: article.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

//Get all articles
export const getAllArticles = async (req, res) => {
  try {

    const Articles = await Article.find().populate("uploader");

    if (Articles && Articles.length > 0) {
      return res.json({
        articles: Articles,
      });
    } else {
      return res.json({
        message: "No articles found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get articles uploaded by a blogger
export const getBloggerArticles = async (req, res) => {
  try {
    const { uploaderid } = req.params;

    const bloggerArticles = await Article.find({ uploader: uploaderid }).populate("uploader");

    if (bloggerArticles && bloggerArticles.length > 0) {
      return res.json({
        articles: bloggerArticles,
      });
    } else {
      return res.json({
        message: "No articles found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get articles liked by a user
export const getArticlesLikedByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const articlesLikedByUser = await Article.find({ likedBy: userId }).populate("uploader");

    if (!articlesLikedByUser || articlesLikedByUser.length === 0) {
      return res.status(404).json({ message: "No articles liked by this user" });
    }

    res.status(200).json({ articles: articlesLikedByUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
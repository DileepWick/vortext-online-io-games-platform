//article_controller.js
import { Article } from "../models/article_model.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// Create a new article
export const createArticle = async (req, res) => {
  try {
    if (!req.body.heading || !req.body.articleBody || !req.body.uploader) {
      return res.status(400).json({
        message: "Uploader Heading and Body are required",
      });
    }

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

    const newArticle = new Article({
      uploader: req.body.uploader,
      heading: req.body.heading,
      articleBody: req.body.articleBody,
      image: imageResult.secure_url,
    });

    const createdArticle = await newArticle.save();

    if (createdArticle) {
      return res.status(201).json({
        message: "Article created successfully",
      });
    }

    fs.unlinkSync(req.files.image[0].path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

// Toggle like on an article
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
      article.likes += 1;
      article.likedBy.push(userId);
    } else {
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

// Get all articles
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate("uploader").populate("comments.user");

    if (articles && articles.length > 0) {
      return res.json({
        articles,
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

// Get articles by a specific blogger
export const getBloggerArticles = async (req, res) => {
  try {
    const { uploaderid } = req.params;

    const bloggerArticles = await Article.find({ uploader: uploaderid }).populate("uploader").populate("comments.user");

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

// Add a comment to an article
export const addComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { userId, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.comments.push({ user: userId, text });
    await article.save();

    res.status(201).json({ message: "Comment added successfully", comment: article.comments[article.comments.length - 1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

// Delete an article
export const deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Delete the image from Cloudinary
    const publicId = article.image.split('/').pop().split('.')[0]; // Extract the public ID from the image URL
    await cloudinary.uploader.destroy(publicId);

    // Delete the article from the database
    await Article.findByIdAndDelete(articleId);

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

//update article

export const updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { heading, articleBody } = req.body;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Update text fields
    if (heading) article.heading = heading;
    if (articleBody) article.articleBody = articleBody;

    // Update image if a new one is provided
    if (req.files && req.files.image) {
      // Delete the old image from Cloudinary
      if (article.image) {
        const publicId = article.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload the new image
      const imageResult = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: "article images",
          resource_type: "image",
        }
      );

      if (!imageResult || !imageResult.secure_url) {
        return res.status(500).json({
          message: "Could not upload the new image",
        });
      }

      article.image = imageResult.secure_url;

      // Remove the temporary file
      fs.unlinkSync(req.files.image[0].path);
    }

    // Save the updated article
    const updatedArticle = await article.save();

    res.status(200).json({
      message: "Article updated successfully",
      article: updatedArticle
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while updating the article", error });
  }
};

// Delete a comment from an article
export const deleteComment = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid article ID or comment ID" });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const commentIndex = article.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    article.comments.splice(commentIndex, 1);
    await article.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }

  
};
//report article
export const reportArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (!article.reportedBy.includes(userId)) {
      article.reportedBy.push(userId);
      await article.save();
    }

    res.status(200).json({ message: "Article reported successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error reporting article", error });
  }
};

export const getReportedArticles = async (req, res) => {
  try {
    const reportedArticles = await Article.find({ reportedBy: { $ne: [] } })
      .populate("uploader", "name")
      .populate("reportedBy", "name");

    res.status(200).json({ reportedArticles });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reported articles", error });
  }
};

export const dismissReport = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.reportedBy = [];
    await article.save();

    res.status(200).json({ message: "Report dismissed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error dismissing report", error });
  }
};

// Edit a comment
export const editComment = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const { text, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(articleId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid article ID or comment ID" });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const comment = article.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user trying to edit is the original commenter
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to edit this comment" });
    }

    comment.text = text;
    comment.editedAt = Date.now();

    await article.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while editing the comment", error });
  }
};
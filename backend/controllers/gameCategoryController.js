// controllers/gameCategoryController.js

import { GameCategory } from "../models/gameCategory.js";

// Add new category
export const uploadGameCategory = async (req, res) => {
  try {
    if (!req.body.categoryName) {
      return res.status(400).json({ message: "Category name required" });
    }

    const newCategory = {
      categoryName: req.body.categoryName,
    };

    const newlyAddedCategory = await GameCategory.create(newCategory);

    return res.status(201).json({
      message: "Game Category added successfully!",
      newlyAddedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add game category",
      error: error.message,
    });
  }
};

// Delete game category
export const deleteGameCategory = async (req, res) => {
  try {
    const categoryId = req.params.id.trim(); // Trim whitespace

    const deletedCategory = await GameCategory.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
      deletedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete game category",
      error: error.message,
    });
  }
};

// Update game category
export const updateGameCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name required" });
    }

    const updatedCategory = await GameCategory.findByIdAndUpdate(
      categoryId,
      { categoryName },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update game category",
      error: error.message,
    });
  }
};

// Get all game categories
export const getAllGameCategories = async (req, res) => {
  try {
    const allCategories = await GameCategory.find();

    return res.status(200).json({
      total_categories: allCategories.length,
      allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting game categories",
      error: error.message,
    });
  }
};

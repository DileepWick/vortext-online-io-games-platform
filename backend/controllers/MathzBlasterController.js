// controllers/mathzBlasterScoreController.js
import { MathzBlasterScore } from "../models/MathzBlasterScore.js";
import mongoose, { get } from "mongoose";
import jwt from "jsonwebtoken";

// Middleware to authenticate user
export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
// Save or update game stats
// Save or update game stats
export const saveGameStats = async (req, res) => {
  try {
    const { score = 0, playtime = 0, level = 1, difficulty } = req.body;
    const userId = '686a4659a58b5ac21fe8a311';
    console.log("User ID:", userId);

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }

    // Find the user's score document for the specific difficulty
    let userScore = await MathzBlasterScore.findOne({ userId, difficulty });

    if (!userScore) {
      // If no score exists for this difficulty, create a new one
      userScore = new MathzBlasterScore({ userId, difficulty });
    }

    // Update the stats for the specific difficulty
    userScore.highScore = Math.max(userScore.highScore, score);
    userScore.playtime += Math.max(0, playtime); // Accumulate playtime
    userScore.level = Math.max(userScore.level, level);
    userScore.lastPlayed = new Date();

    const updatedScore = await userScore.save();

    return res.status(200).json({
      message: "Game stats saved successfully",
      score: updatedScore,
    });
  } catch (error) {
    console.error("Error saving game stats: ", error);
    return res.status(500).json({ message: "An error occurred", error });
  }
};

// Get leaderboard
// Get leaderboard for each difficulty level
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const difficulties = ["easy", "medium", "hard"];
    const leaderboards = {};

    for (const difficulty of difficulties) {
      const leaderboard = await MathzBlasterScore.find({ difficulty })
        .sort({ highScore: -1, lastPlayed: 1 }) // Sort by highScore first, then by lastPlayed
        .limit(Number(limit))
        .select("userId highScore level")
        .populate({
          path: "userId",
          select: "username profilePic _id",
        })
        .lean();

      leaderboards[difficulty] = leaderboard.map((entry) => {
        return {
          _id: entry._id,
          highScore: entry.highScore,
          level: entry.level,
          userId: {
            _id: entry.userId._id,
            username: entry.userId.username,
            profilePic:
              entry.userId.profilePic ||
              "https://res.cloudinary.com/dhcawltsr/image/upload/v1719572309/user_swzm7h.webp",
          },
        };
      });
    }

    res.status(200).json({ leaderboards });
  } catch (error) {
    console.error("Error fetching leaderboard: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated user

    const userStats = await MathzBlasterScore.find({ userId });

    if (!userStats) {
      return res.status(404).json({ message: "User stats not found" });
    }

    res.status(200).json({ userStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Update user stats (for admin purposes)
export const updateUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { highScore, playtime, level, difficulty } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stats ID" });
    }

    if (highScore < 0 || playtime < 0 || level < 1) {
      return res.status(400).json({ message: "Invalid data values" });
    }

    const updatedStats = await MathzBlasterScore.findByIdAndUpdate(
      id,
      { highScore, playtime, level, difficulty },
      { new: true }
    );

    if (!updatedStats) {
      return res.status(404).json({ message: "User stats not found" });
    }

    res.status(200).json({
      message: "User stats updated successfully",
      stats: updatedStats,
    });
  } catch (error) {
    console.error("Error updating user stats: ", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const deleteUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stats ID" });
    }

    const deletedStats = await MathzBlasterScore.findByIdAndDelete(id);

    if (!deletedStats) {
      return res.status(404).json({ message: "User stats not found" });
    }

    res.status(200).json({ message: "User stats deleted successfully" });
  } catch (error) {
    console.error("Error deleting user stats: ", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};
export const getAllGameStats = async (req, res) => {
  try {
    // Optional query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Optional query parameters for sorting
    const sortField = req.query.sortField || "highScore";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Optional query parameter for difficulty filtering
    const difficulty = req.query.difficulty;

    // Build the query
    let query = {};
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Execute the query
    const scores = await MathzBlasterScore.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email"); // Assuming you want to include user details

    // Get total count for pagination
    const totalCount = await MathzBlasterScore.countDocuments(query);

    res.status(200).json({
      scores,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching scores", error });
  }
};

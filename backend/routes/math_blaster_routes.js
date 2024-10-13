// routes/mathzBlasterScoreRoutes.js
import express from "express";
import {
  authenticateUser,
  saveGameStats,
  getLeaderboard,
  getUserStats,
  updateUserStats,
  deleteUserStats,
  getAllGameStats,
} from "../controllers/MathzBlasterController.js";

const router = express.Router();

router.post("/save", saveGameStats);
router.get("/leaderboard", getLeaderboard);
router.get("/user", authenticateUser, getUserStats);
router.put("/update/:id", authenticateUser, updateUserStats);
router.delete("/delete/:id", authenticateUser, deleteUserStats);
router.get("/all", getAllGameStats);
router.get("/test", (req, res) => {
  res.send("Test route is working!");
});

export default router;

import { Notification } from "../models/notification_model.js";
import mongoose from "mongoose";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have middleware to extract user from token
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Notification ID" });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

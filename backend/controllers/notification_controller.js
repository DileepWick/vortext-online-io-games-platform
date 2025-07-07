import { Notification } from "../models/notification_model.js";
import mongoose from "mongoose";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params; // Capture userId from the request URL

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch notifications for the user with the provided userId
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    // Check if any notifications were found
    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
export const getAllNotifications = async (req, res) => {
  try {
    // Fetch all notifications from the database
    const notifications = await Notification.find().sort({ createdAt: -1 });

    // Return the notifications in the response
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching notifications" });
  }
};

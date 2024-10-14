import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  getAllNotifications,
} from "../controllers/notification_controller.js";

const messageRouter = express.Router();

messageRouter.get("/getNotification/:userId", getNotifications);
messageRouter.put("/markAsRead/:id", markNotificationAsRead);
messageRouter.get("/getAllNotifications", getAllNotifications);
export default messageRouter;

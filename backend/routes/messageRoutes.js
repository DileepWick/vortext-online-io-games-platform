import express from "express";
import messageController from "../controllers/messageController.js";

const router = express.Router();

router.get("/:recipientId", messageController.getMessages);
router.post("/", messageController.createMessage);
router.get("/unread/:userId", messageController.getUnreadMessageCounts);
router.post("/mark-read", messageController.markMessagesAsRead); // New route

export default router;

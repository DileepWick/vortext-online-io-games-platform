// messageRoutes.js (Add a new route)
import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.get('/:recipientId', messageController.getMessages);
router.post('/', messageController.createMessage);
router.get('/unread/:userId', messageController.getUnreadMessageCounts); // Add this new route

export default router;
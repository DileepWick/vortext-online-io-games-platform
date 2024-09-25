// messageRoutes.js
import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.get('/:userId', messageController.getMessages);
router.get('/user/:userId', messageController.getMessagesByUser); // New route for getting messages by user
router.post('/', messageController.createMessage);

export default router;
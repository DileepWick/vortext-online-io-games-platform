// messageRoutes.js
import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.get('/:recipientId', messageController.getMessages); // Use recipientId in the URL
router.post('/', messageController.createMessage);

export default router;

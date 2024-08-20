import express from 'express';
import { handleChatMessage } from '../controllers/chat_controller.js';

const chatRouter = express.Router();

// Route for handling chatbot messages
chatRouter.post('/chatbot', handleChatMessage);

export default chatRouter;

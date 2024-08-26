import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GPTRouter = express.Router();
const apiKey = "AIzaSyCLVQSKrclvFOZallygxWhw4jsoA4Uzx-M";
const genAI = new GoogleGenerativeAI(apiKey);

// Create the generative model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: [{ codeExecution: {} }],
});

const generationConfig = {
  temperature: 0.1,
  topP: 0.1,
  topK: 10,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const sessions = new Map();

// Route to handle chat queries
GPTRouter.post('/chat', async (req, res) => {
  const { sessionId, prompt } = req.body;

  if (!sessionId || !prompt) {
    return res.status(400).json({ error: 'sessionId and prompt are required' });
  }

  try {
    if (!sessions.has(sessionId)) {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });
      sessions.set(sessionId, chatSession);
    }

    const chatSession = sessions.get(sessionId);

    // Send the prompt to the AI model
    const result = await chatSession.sendMessage(prompt);
    res.status(200).json({ result: result.response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message,
    });
  }
});

export default GPTRouter;

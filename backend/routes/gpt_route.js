import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { Game } from "../models/game.js"

const GPTRouter = express.Router();
const apiKey = "AIzaSyCLVQSKrclvFOZallygxWhw4jsoA4Uzx-M";
const genAI = new GoogleGenerativeAI(apiKey);

// MongoDB connection
mongoose.connect('mongodb+srv://zoro:zoro1234@mytestings.xhyavhm.mongodb.net/users-collection?retryWrites=true&w=majority&appName=MyTestings')
  .then(() => console.log('AI connected to mongo'))
  .catch(err => console.error('MongoDB connection error:', err));

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: [{ codeExecution: {} }],
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const sessions = new Map();

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

    const mongoData = await queryMongoDB(prompt);

    let enhancedPrompt;
    if (Array.isArray(mongoData)) {
      enhancedPrompt = `${prompt}\n\nHere are some games from our database: ${mongoData.map(game => game.title).join(', ')}`;
    } else if (mongoData.title) {
      enhancedPrompt = `${prompt}\n\nHere's information about the game "${mongoData.title}":\n` +
        `Description: ${mongoData.Description}\n` +
        `Genre: ${mongoData.Genre.join(', ')}\n` +
        `Age Group: ${mongoData.AgeGroup}\n` +
        `Average Rating: ${mongoData.averageRating.toFixed(1)} (${mongoData.totalRatings} ratings)`;
    } else {
      enhancedPrompt = `${prompt}\n\nHere's some relevant information from our database: ${JSON.stringify(mongoData)}`;
    }

    const result = await chatSession.sendMessage(enhancedPrompt);
    res.status(200).json({ result: result.response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message,
    });
  }
});

async function queryMongoDB(prompt) {
  try {
    const lowercasePrompt = prompt.toLowerCase();

    if (lowercasePrompt.includes('what are the games') || lowercasePrompt.includes('list of games')) {
      const games = await Game.find({}, 'title').limit(10);
      return games;
    }

    const gameMatch = lowercasePrompt.match(/(?:about|tell me about|describe) ([\w\s]+)/i);
    if (gameMatch) {
      const gameTitle = gameMatch[1].trim();
      const game = await Game.findOne({ title: { $regex: new RegExp(gameTitle, 'i') } });
      if (game) {
        return game;
      } else {
        return { error: 'Game not found' };
      }
    }

    const keywords = lowercasePrompt.split(' ');
    
    const query = {
      $or: keywords.map(keyword => ({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { Description: { $regex: keyword, $options: 'i' } },
          { Genre: { $regex: keyword, $options: 'i' } }
        ]
      }))
    };

    const games = await Game.find(query).limit(5);
    return games;
  } catch (error) {
    console.error('Error querying MongoDB:', error);
    return { error: 'Failed to query database' };
  }
}

export default GPTRouter;
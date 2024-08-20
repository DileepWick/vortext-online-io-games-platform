import { Game } from '../models/game.js';
import nlp from 'compromise';

export const handleChatMessage = async (req, res) => {
  const userMessage = req.body.message.trim();
  console.log('Received message:', userMessage);

  // Use compromise to process the message
  let doc = nlp(userMessage);
  
  // Extract noun phrases which are more likely to contain the game name
  let nounPhrases = doc.nouns().out('array');

  // Filter out common query words and join noun phrases into a single string
  const commonWords = ['do', 'you', 'have', 'can', 'find', 'is', 'there', 'are', 'we', 'a', 'the', 'an', 'in', 'your', 'store', 'our', 'what', 'which', 'called', 'looking', 'for'];
  nounPhrases = nounPhrases.filter(word => !commonWords.includes(word.toLowerCase()));

  // Combine remaining noun phrases into a single string
  let gameName = nounPhrases.join(' ').trim();

  // Further clean up the extracted game name
  gameName = gameName.replace(/[^a-zA-Z0-9\s]/g, '').trim();

  if (!gameName) {
    return res.json({ reply: "Please specify a game name in your query." });
  }

  console.log('Extracted game name:', gameName);

  // Split the game name into individual keywords
  const keywords = gameName.split(/\s+/).map(word => word.toLowerCase());

  try {
    // Fetch all game titles to perform matching
    const games = await Game.find({}, 'title');
    const gameTitles = games.map(game => game.title.toLowerCase()); // Lowercase for case-insensitive comparison

    // Check if any title contains any of the keywords
    const matchedGames = games.filter(game => 
      keywords.some(keyword => game.title.toLowerCase().includes(keyword))
    );

    if (matchedGames.length > 0) {
      // Return the first match found (or all matches if you prefer)
      const firstMatch = matchedGames[0];
      res.json({
        reply: `Yes, we have ${firstMatch.title} available in our store.`
      });
    } else {
      res.json({ reply: "Sorry, we don't have that game in our store." });
    }
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ reply: "An error occurred while processing your request." });
  }
};

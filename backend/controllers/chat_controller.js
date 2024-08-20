import {Game} from '../models/game.js'; // Adjust the path as needed

export const handleChatMessage = async (req, res) => {
  const userMessage = req.body.message.trim();
  console.log('Received message:', userMessage);

  // Extract the game name from the message
  const gameNameMatch = userMessage.match(/(?:Do you have|Can you find|Is there|Are there|Do you sell|Do you carry) (.+?)\?/i);
  const gameName = gameNameMatch ? gameNameMatch[1].trim() : '';

  if (!gameName) {
    return res.json({ reply: "Please specify a game name in your query." });
  }

  console.log('Extracted game name:', gameName);

  // Create regex pattern for case-insensitive search
  const query = new RegExp(gameName, 'i');
  console.log('Search query regex:', query);

  try {
    const game = await Game.findOne({ title: query });
    console.log('Found game:', game);

    if (game) {
      res.json({
        reply: `Yes, we have ${game.title} available in our store.`
      });
    } else {
      res.json({ reply: "Sorry, we don't have that game in our store." });
    }
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ reply: "An error occurred while processing your request." });
  }
};

  

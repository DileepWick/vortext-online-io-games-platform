import { Game } from '../models/game.js';
import nlp from 'compromise';

export const handleChatMessage = async (req, res) => {
  const userMessage = req.body.message.trim();
  console.log('Received message:', userMessage);

  // Use compromise to process the message
  let doc = nlp(userMessage);
  
  // Extract noun phrases and other potential keywords
  let nounPhrases = doc.nouns().out('array');
  let keywords = doc.terms().out('array');

  // Filter out common query words
  const commonWords = ['do', 'you', 'have', 'can', 'find', 'is', 'there', 'are', 'we', 'a', 'the', 'an', 'in', 'your', 'store', 'our', 'what', 'which', 'called', 'looking', 'for'];
  nounPhrases = nounPhrases.filter(word => !commonWords.includes(word.toLowerCase()));

  // Combine remaining noun phrases into a single string
  let gameName = nounPhrases.join(' ').trim();
  gameName = gameName.replace(/[^a-zA-Z0-9\s]/g, '').trim();

  // Determine if the question is about game attributes
  const lowerCaseMessage = userMessage.toLowerCase();
  const isAboutAttributes = lowerCaseMessage.includes('genre') || lowerCaseMessage.includes('platform');

  if (isAboutAttributes) {
    // Extract relevant attribute from the message
    let attribute = '';
    if (lowerCaseMessage.includes('genre')) {
      attribute = 'genre';
    } else if (lowerCaseMessage.includes('platform')) {
      attribute = 'platform';
    }

    // Extract specific value for the attribute
    let attributeValue = doc.match(`${attribute} (.*)`).out('text').replace(`${attribute}`, '').trim();

    if (!attributeValue) {
      return res.json({ reply: `Please specify a ${attribute} to search for.` });
    }

    try {
      // Search for games based on attribute
      const games = await Game.find({ [attribute]: new RegExp(attributeValue, 'i') });
      
      if (games.length > 0) {
        const gameTitles = games.map(game => game.title).join(', ');
        res.json({
          reply: `We have the following games available with ${attribute} '${attributeValue}': ${gameTitles}.`
        });
      } else {
        res.json({ reply: `Sorry, we don't have any games with ${attribute} '${attributeValue}'.` });
      }
    } catch (error) {
      console.error('Error fetching games by attribute:', error);
      res.status(500).json({ reply: "An error occurred while processing your request." });
    }

  } else {
    // Handle game name search as before
    if (!gameName) {
      return res.json({ reply: "Please specify a game name in your query." });
    }

    console.log('Extracted game name:', gameName);

    try {
      // Fetch all game titles to perform matching
      const games = await Game.find({}, 'title');
      const gameTitles = games.map(game => game.title.toLowerCase());

      // Check if any title contains any of the keywords
      const matchedGames = games.filter(game => 
        keywords.some(keyword => game.title.toLowerCase().includes(keyword.toLowerCase()))
      );

      if (matchedGames.length > 0) {
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
  }
};

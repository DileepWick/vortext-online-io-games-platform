import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { Avatar, Button, Textarea } from '@nextui-org/react';

const ChatComponent = ({ game }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const [sessionId] = useState(Date.now().toString()); // Generate a unique session ID for each chat

  // Initialize chat with AI's welcome message
  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const promptWithGame = `You are an expert on the game ${game}. Introduce yourself briefly and confidently, but avoid teaching or explaining anything. If the user asks about irrelevant topics, respond with anger and ignore their questions with very dark funny joke. Act with the confidence and demeanor of a seasoned gamer. Your name is Chad.`;
        const response = await axios.post('http://localhost:8098/api/chat', { sessionId, prompt: promptWithGame });
        const aiMessage = { role: 'ai', text: response.data.result };

        // Add AI's initial message to chat
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (err) {
        console.error('Failed to fetch initial message:', err);
        setError('Failed to load initial message');
      }
    };

    fetchInitialMessage();
  }, [game, sessionId]);

  // Handle input changes
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    // Add user message to chat
    const userMessage = { role: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Add game information to the prompt
      const promptWithGame = `You are an expert on the game "${game}". ${input}`;

      const response = await axios.post('http://localhost:8098/api/chat', { sessionId, prompt: promptWithGame });
      const aiMessage = { role: 'ai', text: response.data.result };

      // Add AI response to chat
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setInput('');
    } catch (err) {
      setError('Failed to get response');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-customDark text-white">
      <h1 className="text-2xl font-primaryRegular text-white">Get Help From Chad</h1>
      <p className='mb-4 text-gray-400'>He is an expert in {game}</p>
      <div className="h-96 overflow-y-auto rounded-lg p-4 bg-customDark mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start mb-2 ${msg.role === 'user' ? 'justify-end self-end' : 'justify-start self-start'}`}
          >
            {msg.role === 'ai' && (
              <div className="flex flex-col items-start bg-customDark p-3 rounded-lg">
                <Avatar
                  src="https://i1.sndcdn.com/artworks-96JSClFLpAx79Njf-Zzf0dA-t500x500.jpg"
                  alt="AI Avatar"
                  size="lg"
                />
                <span className="mt-2 font-primaryRegular text-customPink">Chad</span>
                <div className="mt-1 p-2 bg-customDark rounded-lg text-white  font-primaryRegular">
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="flex flex-row bg-customDark p-3 rounded-lg ">
                <div className="p-2 bg-blue-500 rounded-lg text-white font-primaryRegular text-right">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-gray-300">Chad is typing...</div>}
        {error && <div className="text-red-400">{error}</div>}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about the game ..."
          rows="1"
          className="flex-1 p-2 rounded-l-lg text-white font-primaryRegular"
        />
        <Button
          type="submit"
          color="primary"
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 h-[80px] font-primaryRegular"
          disabled={loading}
        >
          {loading ? 'Asking Garen...' : 'Ask'}
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;

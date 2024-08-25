import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const [sessionId] = useState(Date.now().toString()); // Generate a unique session ID for each chat



  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;
  
    setLoading(true);
    setError(null);
  
    // Add user message to chat
    const userMessage = { role: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
  
    try {
      const response = await axios.post('http://localhost:8098/api/chat', { sessionId, prompt: input });
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
    <div className="w-full max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">Chat with Gemini AI</h1>
      <div className="h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-800 text-right' : 'bg-green-100 text-green-800'}`}>
            <div className={`font-semibold ${msg.role === 'user' ? 'text-blue-700' : 'text-green-700'}`}>
              {msg.role === 'user' ? 'You' : 'AI'}:
            </div>
            <div className={`mt-1 ${msg.role === 'ai' ? 'italic' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500">AI is typing...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your message..."
          rows="3"
          className="flex-1 p-2 border border-gray-300 rounded-l-lg"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;

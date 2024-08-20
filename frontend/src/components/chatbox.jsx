import React from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

const Chatbot = () => {
  const handleNewUserMessage = async (newMessage) => {
    try {
      const response = await fetch('http://localhost:8098/api/chatbot', {  // Ensure this matches your backend route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      addResponseMessage(data.reply);
    } catch (error) {
      addResponseMessage("Sorry, there was an error: " + error.message);
    }
  };

  return <Widget handleNewUserMessage={handleNewUserMessage} />;
};

export default Chatbot;

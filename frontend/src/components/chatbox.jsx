// frontend/src/components/Chatbot.jsx

import React from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

const Chatbot = () => {
  const handleNewUserMessage = (newMessage) => {
    fetch('http://localhost:8098/api/chatbot', {  // Ensure this matches your backend route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => addResponseMessage(data.reply))
      .catch(error => addResponseMessage("Sorry, there was an error: " + error.message));
  };

  return <Widget handleNewUserMessage={handleNewUserMessage} />;
};

export default Chatbot;

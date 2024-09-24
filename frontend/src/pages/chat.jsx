import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/getToken';
import { getUserIdFromToken } from '../utils/user_id_decoder';
import Header from "../components/header";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/messages', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [token]);

  const handleSendMessage = async () => {
    try {
      await axios.post('/api/messages', { content: newMessage, userId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    

    <div>
        <Header />
      <h1>Chat</h1>
      <div>
        {Array.isArray(messages) && messages.map((message) => (
          <div key={message.id}>
            <p>{message.content}</p>
            <p>Sent by: {message.messageUser.name}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/getToken';
import { getUserIdFromToken } from '../utils/user_id_decoder';
import Header from "../components/header";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const token = getToken();
  const currentUserId = getUserIdFromToken(token);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8098/users/allusers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.allUsers && Array.isArray(response.data.allUsers)) {
        setUsers(response.data.allUsers.filter(user => user._id !== currentUserId));
      } else {
        console.error('Unexpected API response structure:', response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchMessages = async () => {
    if (!recipientId) return;
    try {
      const response = await axios.get(`http://localhost:8098/api/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: recipientId, currentUserId: currentUserId }
      });
      console.log('Fetched messages:', response.data);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!recipientId) {
      alert('Please select a recipient');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8098/api/messages', {
        content: newMessage,
        recipientId: recipientId,
        messageUser: currentUserId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Message sent:', response.data);
      setNewMessage('');
      // Update the messages state with the new message
      setMessages(prevMessages => [...prevMessages, response.data]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleUserSelect = (event) => {
    const userId = event.target.value;
    const user = users.find(u => u._id === userId);
    setSelectedUser(user);
    setRecipientId(userId);
    if (userId) {
      fetchMessages();
    }
  };

  return (
    <div style={{ color: 'black' }}>
      <Header />
      <h1>Chat</h1>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%', marginRight: '20px' }}>
          <h2>Select User</h2>
          <select onChange={handleUserSelect} value={recipientId} style={{ color: 'black' }}>
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username || user.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ width: '70%' }}>
          {selectedUser ? (
            <>
              <h2>Chat with {selectedUser.username || selectedUser.name}</h2>
              <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                {messages.map((message) => (
                  <div key={message._id} style={{ marginBottom: '10px', textAlign: message.messageUser === currentUserId ? 'right' : 'left' }}>
                    <p style={{ background: message.messageUser === currentUserId ? '#dcf8c6' : '#f2f2f2', display: 'inline-block', padding: '5px 10px', borderRadius: '10px', color: 'black' }}>
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ width: 'calc(100% - 70px)', marginRight: '10px', color: 'black' }}
              />
              <button onClick={handleSendMessage} style={{ color: 'black' }}>Send</button>
            </>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../utils/getToken';
import { getUserIdFromToken } from '../utils/user_id_decoder';
import Header from "../components/header";
import { User, Input, Button, Card, Spacer, Select, SelectItem } from "@nextui-org/react";

const SendIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1={22} y1={2} x2={11} y2={13} />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const token = getToken();
  const currentUserId = getUserIdFromToken(token);

  // Ref for the message container
  const messageContainerRef = useRef(null);

  const fetchUsers = useCallback(async () => {
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
  }, [token, currentUserId]);

  const fetchMessages = useCallback(async () => {
    if (!recipientId) return;
    try {
      const response = await axios.get(`http://localhost:8098/api/messages/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { currentUserId }
      });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  }, [recipientId, token, currentUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (recipientId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [recipientId, fetchMessages]);

  // Scroll to bottom whenever the messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!recipientId || !newMessage.trim()) return;
    try {
      const response = await axios.post('http://localhost:8098/api/messages', {
        content: newMessage,
        recipientId: recipientId,
        messageUser: currentUserId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewMessage('');
      setMessages(prevMessages => [...prevMessages, response.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUserSelect = (userId) => {
    setMessages([]); // Clear messages immediately
    setNewMessage(''); // Clear the message input
    if (userId === '') {
      setSelectedUser(null);
      setRecipientId('');
    } else {
      const user = users.find(u => u._id === userId);
      setSelectedUser(user);
      setRecipientId(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Messaging Center</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="p-6 w-full md:w-1/3 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact List</h2>
            <Select 
              placeholder="Select a contact"
              onChange={(e) => handleUserSelect(e.target.value)}
              className="w-full"
            >
              <SelectItem key="default" value="">Select a contact</SelectItem>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id} style={{ color: 'black' }}>
                  {user.username || user.name}
                </SelectItem>
              ))}
            </Select>
          </Card>
          <Card className="p-6 w-full md:w-2/3 shadow-md">
            {selectedUser ? (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Conversation with {selectedUser.username || selectedUser.name}</h2>
                <div ref={messageContainerRef} className="h-96 overflow-y-auto mb-4 p-4 bg-white rounded-lg border border-gray-200">
                  {messages.map((message) => (
                    <div key={message._id} className={`mb-4 ${message.messageUser._id === currentUserId ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-3 rounded-lg ${message.messageUser._id === currentUserId ? 'bg-blue-100 text-black' : 'bg-gray-100 text-black'}`}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-grow"
                  />
                  <Button auto onClick={handleSendMessage} icon={<SendIcon />} className="bg-blue-500 text-white">
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-600">Select a contact to start a conversation</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;

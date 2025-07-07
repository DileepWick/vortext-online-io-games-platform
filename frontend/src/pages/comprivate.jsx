import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaPaperPlane } from "react-icons/fa";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { API_BASE_URL } from "../utils/getAPI";

const CompPrivate = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    if (userId) {
      fetchUsers();
      fetchCurrentUser();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      fetchMessages();
    }
  }, [selectedUser, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/allusers`);
      setUsers(response.data.allUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/profile/${userId}`
      );
      setCurrentUser(response.data.profile);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/messages/${currentUser._id}/${selectedUser._id}`
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    try {
      await axios.post(`${API_BASE_URL}/api/messages/send`, {
        senderId: currentUser._id,
        recipientId: selectedUser._id,
        content: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-customDark p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">
        User Messaging System
      </h2>
      <div className="flex">
        <div className="w-1/3 pr-4">
          <h3 className="text-xl font-semibold mb-2 text-white">Users</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedUser && selectedUser._id === user._id
                      ? "bg-blue-600"
                      : "bg-gray-700"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <User
                    name={`${user.firstname} ${user.lastname}`}
                    description={user.email}
                    avatarProps={{
                      src: user.profilePic || "https://via.placeholder.com/150",
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-300">No users found.</p>
            )}
          </div>
        </div>
        <div className="w-2/3 pl-4">
          {selectedUser ? (
            <>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Chat with {selectedUser.firstname} {selectedUser.lastname}
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg h-96 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      message.sender === currentUser._id
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === currentUser._id
                          ? "bg-blue-600"
                          : "bg-gray-700"
                      }`}
                    >
                      {message.content}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-grow mr-2"
                />
                <Button color="primary" onClick={handleSendMessage}>
                  <FaPaperPlane />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-300">Select a user to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompPrivate;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { User } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaPaperPlane } from "react-icons/fa";

const ComPrivate = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8098/users/all");
        console.log("Fetched users:", response.data); // Debug log
        setUsers(response.data.users || []); // Ensure we're setting an array
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Fetch current user
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8098/users/current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchUsers();
    fetchCurrentUser();
  }, []);

  // ... (rest of the useEffect hooks and functions remain the same)

  return (
    <div className="bg-customDark p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Private Community</h2>
      <div className="flex">
        <div className="w-1/3 pr-4">
          <h3 className="text-xl font-semibold mb-2 text-white">Users</h3>
          <div className="space-y-2">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedUser && selectedUser._id === user._id ? "bg-blue-600" : "bg-gray-700"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <User
                    name={user.name}
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
                Chat with {selectedUser.name}
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg h-96 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      message.senderId === currentUser._id ? "text-right" : "text-left"
                    }`}
                  >
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        message.senderId === currentUser._id ? "bg-blue-600" : "bg-gray-700"
                      }`}
                    >
                      {message.content}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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

export default ComPrivate;
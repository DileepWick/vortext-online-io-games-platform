import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import Header from "../components/header";
import { Input, Button, Card } from "@nextui-org/react";
import useAuthCheck from "../utils/authCheck";

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

const UserListItem = ({
  user,
  isSelected,
  onClick,
  unreadCount,
  isOnline,
  isTyping,
}) => (
  <div
    className={`p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
      isSelected
        ? "bg-blue-100 border-l-4 border-blue-500"
        : "hover:bg-gray-50 border-l-4 border-transparent"
    }`}
    onClick={() => onClick(user)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center mr-3">
            <span className="text-gray-600 font-semibold">
              {(user.username || user.name).charAt(0).toUpperCase()}
            </span>
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {user.username || user.name}
          </p>
          {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
          {isTyping && (
            <p className="text-xs text-blue-500 italic">typing...</p>
          )}
        </div>
      </div>
      {unreadCount > 0 && (
        <div className="bg-blue-200 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold">
          {unreadCount}
        </div>
      )}
    </div>
  </div>
);

const Chat = () => {
  useAuthCheck();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const token = getToken();
  const currentUserId = getUserIdFromToken(token);
  const messageContainerRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io("http://localhost:8098", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    // Join with user ID
    socket.emit("join", currentUserId);

    // Listen for new messages
    socket.on("newMessage", (message) => {
      console.log("Received new message:", message);

      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some(
          (msg) => msg._id === message._id
        );

        if (messageExists) {
          console.log("Message already exists, skipping");
          return prevMessages;
        }

        // Only add message if it's part of the current conversation
        const isCurrentConversation =
          (message.messageUser._id === currentUserId &&
            message.recipient === recipientId) ||
          (message.messageUser._id === recipientId &&
            message.recipient === currentUserId);

        if (!isCurrentConversation) {
          console.log("Message not for current conversation");
          return prevMessages;
        }

        console.log("Adding new message to conversation");
        return [...prevMessages, message];
      });

      // Update unread count only if message is not from current conversation sender
      if (
        message.messageUser._id !== currentUserId &&
        message.messageUser._id !== recipientId
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.messageUser._id]: (prev[message.messageUser._id] || 0) + 1,
        }));
      }
    });

    // Listen for message confirmation
    socket.on("messageConfirmed", (message) => {
      console.log("Message confirmed:", message);
      setIsSending(false);
    });

    // Listen for typing indicators
    socket.on("userTyping", ({ userId, isTyping }) => {
      if (userId === currentUserId) return; // Don't show typing for current user

      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    // Listen for online users
    socket.on("userOnline", (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Listen for unread count updates
    socket.on("updateUnreadCount", ({ senderId, increment }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [senderId]: increment
          ? (prev[senderId] || 0) + 1
          : Math.max(0, (prev[senderId] || 0) - 1),
      }));
    });

    // Listen for message read confirmations
    socket.on("messagesRead", ({ readBy }) => {
      console.log(`Messages read by ${readBy}`);
    });

    // Connection events
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, recipientId]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8098/users/allusers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (
        response.data &&
        response.data.allUsers &&
        Array.isArray(response.data.allUsers)
      ) {
        const filteredUserList = response.data.allUsers.filter(
          (user) => user._id !== currentUserId
        );
        setUsers(filteredUserList);
        setFilteredUsers(filteredUserList);
      } else {
        console.error("Unexpected API response structure:", response.data);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    }
  }, [token, currentUserId]);

  const fetchUnreadMessageCounts = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8098/api/messages/unread/${currentUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const counts = {};
      response.data.forEach((item) => {
        counts[item._id] = item.count;
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error fetching unread message counts:", error);
    }
  }, [currentUserId, token]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        (user.username || user.name).toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleUserSelect = async (user) => {
    console.log("Selecting user:", user);
    setMessages([]);
    setNewMessage("");
    setSelectedUser(user);
    setRecipientId(user._id);

    // Clear unread count for the selected user
    setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));

    // Mark messages as read
    try {
      await axios.post(
        "http://localhost:8098/api/messages/mark-read",
        {
          senderId: user._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { currentUserId },
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!recipientId) return;
    try {
      console.log("Fetching messages for recipient:", recipientId);
      const response = await axios.get(
        `http://localhost:8098/api/messages/${recipientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { currentUserId },
        }
      );
      const fetchedMessages = Array.isArray(response.data) ? response.data : [];
      console.log("Fetched messages:", fetchedMessages);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  }, [recipientId, token, currentUserId]);

  useEffect(() => {
    fetchUsers();
    fetchUnreadMessageCounts();
  }, [fetchUsers, fetchUnreadMessageCounts]);

  useEffect(() => {
    if (recipientId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [recipientId, fetchMessages]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!recipientId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately

    // Create temporary message object for immediate display
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: messageContent,
      messageUser: {
        _id: currentUserId,
        username: "You", // This will be populated properly from server
      },
      recipient: recipientId,
      createdAt: new Date().toISOString(),
      isTemporary: true,
    };

    // Add message to UI immediately
    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    const messageData = {
      content: messageContent,
      recipientId: recipientId,
      messageUser: currentUserId,
    };

    try {
      // Send via HTTP API
      const response = await axios.post(
        "http://localhost:8098/api/messages",
        messageData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Message sent successfully:", response.data);

      // Replace temporary message with real message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempMessage._id
            ? { ...response.data, messageUser: response.data.messageUser }
            : msg
        )
      );

      // Emit via socket for real-time updates to recipient
      socketRef.current.emit("sendMessage", {
        ...response.data,
        messageUser: response.data.messageUser,
      });

      // Stop typing indicator
      if (isTyping) {
        socketRef.current.emit("typing", { recipientId, isTyping: false });
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove temporary message on error
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== tempMessage._id)
      );

      // Restore message content
      setNewMessage(messageContent);

      // Show error message (you could add a toast notification here)
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && recipientId) {
      setIsTyping(true);
      socketRef.current.emit("typing", { recipientId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketRef.current.emit("typing", { recipientId, isTyping: false });
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="dark text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-black bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-blue-500 via-orange-500 to-orange-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
          Messaging Center
        </h1>
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="p-6 w-full md:w-1/3 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
              <span className="text-sm text-gray-500">
                {filteredUsers.length} contacts
              </span>
            </div>

            <Input
              className="mb-4"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              clearable
              contentLeft={
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />

            <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    isSelected={selectedUser?._id === user._id}
                    onClick={handleUserSelect}
                    unreadCount={unreadCounts[user._id] || 0}
                    isOnline={onlineUsers.has(user._id)}
                    isTyping={typingUsers.has(user._id)}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {searchQuery
                    ? "No matching contacts found"
                    : "No contacts available"}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 w-full md:w-2/3 shadow-md">
            {selectedUser ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-semibold">
                        {(selectedUser.username || selectedUser.name)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    {onlineUsers.has(selectedUser._id) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedUser.username || selectedUser.name}
                    </h2>
                    {selectedUser.email && (
                      <p className="text-sm text-gray-500">
                        {selectedUser.email}
                      </p>
                    )}
                    {typingUsers.has(selectedUser._id) && (
                      <p className="text-xs text-blue-500 italic">typing...</p>
                    )}
                  </div>
                </div>

                <div
                  ref={messageContainerRef}
                  className="h-[calc(100vh-400px)] overflow-y-auto mb-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`mb-4 ${
                        message.messageUser._id === currentUserId
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message.messageUser._id === currentUserId
                            ? "bg-blue-100 text-black"
                            : "bg-gray-100 text-black"
                        } ${message.isTemporary ? "opacity-70" : ""}`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                          {message.isTemporary && " (sending...)"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    className="flex-grow"
                    disabled={isSending}
                  />
                  <Button
                    auto
                    onClick={handleSendMessage}
                    icon={<SendIcon />}
                    className="bg-blue-500 text-white"
                    disabled={isSending || !newMessage.trim()}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-[calc(100vh-300px)] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="mt-2 text-lg">
                    Select a contact to start a conversation
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;

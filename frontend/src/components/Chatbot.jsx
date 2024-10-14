import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, Send, X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import botTrainingData from "../libs/botTrainigData.json"; // Import training data from JSON
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [message, setMessage] = useState("");
  const [conversationContext, setConversationContext] = useState([]);
  const [userName, setUserName] = useState(""); // Store the user's name
  const [awaitingName, setAwaitingName] = useState(false); // Check if we're waiting for a name
  const [darkMode, setDarkMode] = useState(true);
  const chatboxRef = useRef(null);

  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return "Good morning! I'm Vorty. How can I assist you today?";
    } else if (currentHour < 18) {
      return "Good afternoon! I'm Vorty. How can I assist you today?";
    } else if (currentHour < 22) {
      return "Good evening! I'm Vorty. How can I assist you today?";
    } else {
      return "Happy late night! I'm Vorty. How can I assist you today?";
    }
  };

  const [messages, setMessages] = useState([
    {
      text: getGreeting(), // Dynamically set greeting based on time
      type: "incoming",
    },
  ]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSend = () => {
    if (message.trim()) {
      const outgoingMessage = { text: message, type: "outgoing" };

      setMessages([...messages, outgoingMessage]);
      setConversationContext([...conversationContext, outgoingMessage]);

      // Clear input field
      setMessage("");

      // If we're waiting for the user's name
      if (awaitingName) {
        setUserName(message); // Save the user's name
        setAwaitingName(false); // No longer waiting for a name
        setTimeout(() => {
          const botResponse = `Nice to meet you, ${message}! How can I assist you, ${message}?`;
          const incomingMessage = { text: botResponse, type: "incoming" };

          setMessages((prevMessages) => [...prevMessages, incomingMessage]);
          setConversationContext((prevContext) => [
            ...prevContext,
            incomingMessage,
          ]);
        }, 500);
      } else {
        // Simulate bot response after a short delay
        setTimeout(() => {
          const botResponse = generateBotResponse(message, conversationContext);
          const incomingMessage = { text: botResponse, type: "incoming" };

          setMessages((prevMessages) => [...prevMessages, incomingMessage]);
          setConversationContext((prevContext) => [
            ...prevContext,
            incomingMessage,
          ]);
        }, 500);
      }
    }
  };

  const generateBotResponse = (userMessage, conversationContext) => {
    const lowerCaseMessage = userMessage.toLowerCase();

    // If the bot is waiting for the user's name, don't process other responses
    if (awaitingName) {
      return "I'm waiting for your name!";
    }

    // If the user has already provided their name, use it in responses
    if (lowerCaseMessage.includes("my name") && userName) {
      return `Your name is ${userName}. How can I assist you, ${userName}?`;
    }

    // Check if the user asked "What is my name?" without providing a name
    const namePattern = /what is my name/i;
    if (namePattern.test(lowerCaseMessage) && !userName) {
      setAwaitingName(true); // Set awaiting name flag
      return "You didn't mention your name. What is your name?";
    }

    // Handle predefined responses from botTrainingData
    for (const { pattern, response } of botTrainingData) {
      const regex = new RegExp(`\\b${pattern}\\b`, "i"); // Ensure word boundaries to avoid partial matches

      if (regex.test(lowerCaseMessage)) {
        // If the response contains a link, render a clickable link
        if (typeof response === "object" && response.link) {
          return (
            <span>
              {response.text}{" "}
              <Link to={response.link} className="text-blue-500 underline">
                Show me
              </Link>
            </span>
          );
        }

        // If response is a string, return it directly (normal text)
        if (typeof response === "string") {
          return response;
        }

        // If response is an array (for multiple responses), use the multiple response logic
        if (Array.isArray(response)) {
          if (!conversationContext[pattern]) {
            conversationContext[pattern] = {
              usedResponses: [],
              lastResponseIndex: -1,
            };
          }

          let availableResponses = response.filter(
            (res) =>
              !conversationContext[pattern].usedResponses.includes(res.order)
          );

          // If all responses have been used, reset
          if (availableResponses.length === 0) {
            conversationContext[pattern].usedResponses = [];
            availableResponses = response;
          }

          // Select the response based on the order or randomly if desired
          const randomIndex = Math.floor(
            Math.random() * availableResponses.length
          );
          const selectedResponse = availableResponses[randomIndex];

          // Mark this response as used
          conversationContext[pattern].usedResponses.push(
            selectedResponse.order
          );
          conversationContext[pattern].lastResponseIndex =
            selectedResponse.order;

          return selectedResponse.text; // Return the selected response text
        }
      }
    }

    // Default response if no pattern is matched
    return "I'm sorry, I can only assist with contact and support-related topics. Can you provide more details?";
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${darkMode ? "dark" : ""}`}>
      <motion.button
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 ease-in-out"
        onClick={toggleChatbot}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.3 }}
            >
              <MessageSquare size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="bg-blue-500 dark:bg-blue-600 p-4 flex justify-between items-center">
              <h2 className="text-white font-bold">Contact & Support</h2>
              <motion.button
                onClick={toggleDarkMode}
                className="text-white hover:text-yellow-200 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
            </div>
            <ul ref={chatboxRef} className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${
                    msg.type === "incoming" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.type === "incoming"
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about contact or support..."
                  className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-l-lg focus:outline-none"
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <motion.button
                  onClick={handleSend}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;

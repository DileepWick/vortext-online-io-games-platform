import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, Send, X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Chatbot = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hello! How can I assist you with contact or support today?",
      type: "incoming",
    },
  ]);
  const [darkMode, setDarkMode] = useState(true); // Dark mode by default
  const chatboxRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Scroll to bottom when chatbot is opened
  useEffect(() => {
    if (showChatbot && chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [showChatbot]);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, type: "outgoing" }]);
      setMessage("");

      setTimeout(() => {
        const botResponse = generateBotResponse(message);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botResponse, type: "incoming" },
        ]);
      }, 500);
    }
  };

  const generateBotResponse = (userMessage) => {
    const lowerCaseMessage = userMessage.toLowerCase();

    const responses = {
      hello: "Hi there! How can I assist you with contact or support today?",
      hi: "Hi there! How can I assist you with contact or support today?",
      name: "My name is Vorty. How can I assist you with contact or support today?",
      contact:
        "You can contact us via email at support@example.com or call us at 1-800-123-4567.",
      phone:
        "Our customer support phone number is 1-800-123-4567. We're available Monday to Friday, 9 AM to 5 PM EST.",
      email:
        "You can reach our support team at support@example.com. We typically respond within 24 hours.",
      hours: "Our support hours are Monday to Friday, 9 AM to 5 PM EST.",
      address:
        "Our main office is located at 123 Business St., Suite 456, Techville, CA 90210.",
      problem:
        "I'm sorry to hear you're experiencing an issue. Can you please provide more details about the problem you're facing?",
      refund:
        "For refund requests, please email our billing department at billing@example.com with your order number and reason for the refund.",
      shipment:
        "To check the status of your shipment, please visit our tracking page at example.com/track and enter your order number.",
      password:
        "To reset your password, please visit example.com/reset-password and follow the instructions. If you continue to have issues, let me know.",
      account:
        "For account-related issues, please specify what kind of help you need. Do you need to update your information, change settings, or something else?",
      help: "I'm here to help with contact and support-related questions. What specific information or assistance do you need?",
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerCaseMessage.includes(keyword)) {
        return response;
      }
    }

    return "I'm sorry, but I can only assist with contact and support-related topics. Can you please provide more details about the problem you're facing?";
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
          {showChatbot ? (
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
        {showChatbot && (
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

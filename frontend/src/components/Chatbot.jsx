import React, { useState } from "react";
import "../style/chatbot.css"; // Import your CSS file

const Chatbot = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { text: "HI there! How can I help you today?", type: "incoming" },
  ]);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, type: "outgoing" }]);
      setMessage("");

      setTimeout(() => {
        const botResponse = generateBotResponse(message);
        setMessages([
          ...messages,
          { text: message, type: "outgoing" },
          { text: botResponse, type: "incoming" },
        ]);
      }, 500); // Simulate response delay
    }
  };

  const generateBotResponse = (userMessage) => {
    const responses = {
      hello: "Hi there! How can I assist you?",
      help: "Sure, I'm here to help. What do you need?",
      default: "Sorry, I didn't understand that. Can you please rephrase?",
    };

    const lowerCaseMessage = userMessage.toLowerCase();
    return responses[lowerCaseMessage] || responses.default;
  };

  return (
    <div>
      <button className="chatbot-toggler" onClick={toggleChatbot}>
        <span className="material-symbols-outlined">mode_comment</span>
        <span className="material-symbols-outlined">close</span>
      </button>
      {showChatbot && (
        <div className="chatbot show-chatbot">
          <header>
            <h2>Chatbot</h2>
            <span className="material-symbols-outlined" onClick={toggleChatbot}>
              close
            </span>
          </header>
          <ul className="chatbox">
            {messages.map((msg, index) => (
              <li key={index} className={`chat ${msg.type}`}>
                {msg.type === "incoming" && (
                  <span className="material-symbols-outlined">smart_toy</span>
                )}
                <p>{msg.text}</p>
              </li>
            ))}
          </ul>
          <div className="chat-input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message"
              required
            ></textarea>
            <span
              className="material-symbols-outlined"
              id="send-btn"
              onClick={handleSend}
            >
              send
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

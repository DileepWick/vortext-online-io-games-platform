import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { Avatar, Button, Textarea } from "@nextui-org/react";

// Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";

const ChatComponent = ({ game }) => {
  const token = getToken();
  const userId = getUserIdFromToken(token);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const [sessionId, setSessionId] = useState(Date.now().toString()); // Generate a unique session ID for each chat

  const fetchInitialMessage = async () => {
    try {
      // Fetch user data first
      const userResponse = await axios.get(
        `http://localhost:8098/users/profile/${userId}`
      );
      const { username } = userResponse.data.profile; // Extract the username from the user profile
      const {age} = userResponse.data.profile;// Extract the playerType from the user profile

      // Create a prompt including the username and game name
      const promptWithGame = `Greet "${username}" and say something cool about user's age. User's age is "${age}".Behave according to that age and your responses should be align with that age. You are an expert on the game "${game}". Introduce yourself shortly and ask if the user has any questions about the game. You only talk about "${game}" nothing more. If the user asks about other stuff, be funny and mock them politely. Act like Ezreal from league of legends. Your name is Ezreal.`;

      // Fetch AI response
      const chatResponse = await axios.post("http://localhost:8098/api/chat", {
        sessionId,
        prompt: promptWithGame,
      });
      const aiMessage = { role: "ai", text: chatResponse.data.result };

      // Add AI's initial message to chat
      setMessages([aiMessage]);
    } catch (err) {
      console.error("Failed to fetch initial message:", err);
      setError("Failed to load initial message");
    }
  };

  // Initialize chat when component mounts or game/sessionId changes
  useEffect(() => {
    fetchInitialMessage();
  }, [game, sessionId]);

  // Handle input changes
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    // Add user message to chat
    const userMessage = { role: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const fetchResponse = async (retryCount = 0) => {
      try {
        // Add game information to the prompt
        const promptWithGame = `You are an expert on the game "${game}". ${input}`;

        const response = await axios.post("http://localhost:8098/api/chat", {
          sessionId,
          prompt: promptWithGame,
        });
        const aiMessage = { role: "ai", text: response.data.result };

        // Add AI response to chat
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setInput("");
      } catch (err) {
        if (retryCount < 3) {
          // Retry up to 3 times
          setTimeout(() => fetchResponse(retryCount + 1), 1000); // Retry after 1 second
        } else {
          // Restart chat if failed to get a response
          setMessages([]); // Clear existing messages
          setInput(""); // Clear input
          setSessionId(Date.now().toString()); // Generate a new session ID
          fetchInitialMessage(); // Reinitialize the chat
          setError("Failed to get response. Restarting chat.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-customDark text-white">
      <h1 className="text-2xl font-primaryRegular text-white">
        Get Help From Ezreal
      </h1>
      <p className="mb-4 text-gray-400">He is an expert in {game}</p>{" "}
      {/* Corrected this line */}
      <div className="h-96 overflow-y-auto rounded-lg p-4 bg-customDark mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start mb-2 ${
              msg.role === "user"
                ? "justify-end self-end"
                : "justify-start self-start"
            }`}
          >
            {msg.role === "ai" && (
              <div className="flex flex-col items-start bg-customDark p-3 rounded-lg">
                <Avatar
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjAo0CvRISfNjyX_y1ZxGf59zAOnw0fmLfoQ&s"
                  alt="AI Avatar"
                  size="lg"
                />
                <span className="mt-2 font-primaryRegular text-customPink">
                  Ezreal
                </span>
                <div className="mt-1 p-2 bg-customDark rounded-lg text-white font-primaryRegular">
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="flex flex-row bg-customDark p-3 rounded-lg">
                <div className="p-2 bg-blue-500 rounded-lg text-white font-primaryRegular text-right">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-gray-300">Ezreal is typing...</div>}
        {error && <div className="text-red-400">{error}</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about the game ..."
          rows="1"
          className="flex-1 p-2 rounded-l-lg text-white font-primaryRegular"
        />
        <Button
          type="submit"
          color="primary"
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 h-[80px] font-primaryRegular"
          disabled={loading}
        >
          {loading ? "Asking Chad..." : "Ask"}
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;

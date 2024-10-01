import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Avatar, Button, Textarea, Tooltip } from "@nextui-org/react";
import { MessageCircle, X } from "lucide-react";

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
  const [sessionId, setSessionId] = useState(Date.now().toString());
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchInitialMessage = async () => {
    try {
      const userResponse = await axios.get(
        `http://localhost:8098/users/profile/${userId}`
      );
      const { username, age } = userResponse.data.profile;
      const promptWithGame = `Greet "${username}". You are an expert on the game "${game}". Introduce yourself shortly and ask if the user has any questions about the game. You only talk about "${game}" nothing more. If the user asks about other stuff, be funny and mock them politely. Act Like a cute gamer girl. Your name is Gwen. Give very short and simple answers and use emojis`;

      const chatResponse = await axios.post("http://localhost:8098/api/chat", {
        sessionId,
        prompt: promptWithGame,
      });
      const aiMessage = { role: "ai", text: chatResponse.data.result };

      setMessages([aiMessage]);
    } catch (err) {
      console.error("Failed to fetch initial message:", err);
      setError("Failed to load initial message");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isChatOpen) {
      fetchInitialMessage();
    }
  }, [game, sessionId, isChatOpen]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    const userMessage = { role: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const fetchResponse = async (retryCount = 0) => {
      try {
        const promptWithGame = `You are an expert on the game "${game}". ${input}`;

        const response = await axios.post("http://localhost:8098/api/chat", {
          sessionId,
          prompt: promptWithGame,
        });
        const aiMessage = { role: "ai", text: response.data.result };

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setInput("");
      } catch (err) {
        if (retryCount < 3) {
          setTimeout(() => fetchResponse(retryCount + 1), 1000);
        } else {
          setMessages([]);
          setInput("");
          setSessionId(Date.now().toString());
          fetchInitialMessage();
          setError("Failed to get response. Restarting chat.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {!isChatOpen && (
        <Tooltip showArrow={true} content="Wanna Help With The Game ? Just Ask Me " className="text-black"
        placement="top">
          <button
            onClick={toggleChat}
            className="fixed bottom-4 right-4 w-[120px] h-[120px] rounded-full p-0    z-50 "
          >
            <img
              src="https://res.cloudinary.com/dhcawltsr/image/upload/v1727709362/smart-girl-animation-download--unscreen_icm1qe.gif" // Replace with your image path or URL
              alt="Chat Icon"
              className="w-full h-full rounded-full object-cover"
            />
          </button>
        </Tooltip>
      )}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-full max-w-lg mx-auto p-6 bg-customDark text-white rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-primaryRegular text-white">
              Get Help From Gwen
            </h1>
            <Button
              onClick={toggleChat}
              className="bg-transparent text-white hover:bg-gray-700 rounded-full p-2"
            >
              <X size={24} />
            </Button>
          </div>
          <p className="mb-4 text-gray-400">She is an expert in {game}</p>
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
                  <div
                    className="flex flex-col items-start bg-customDark p-3 rounded-lg comic-speech-bubble-left"
                    style={{ fontSize: "20px" }}
                  >
                    <Avatar
                      src="https://res.cloudinary.com/dhcawltsr/image/upload/v1727709362/smart-girl-animation-download--unscreen_icm1qe.gif"
                      alt="AI Avatar"
                      size="lg"
                    />
                    <div className="mt-1 p-2 bg-customDark text-white font-primaryRegular comic-speech-text">
                      {msg.text}
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="flex flex-row p-3 rounded-lg comic-speech-bubble-right">
                    <div
                      className="p-2 bg-blue-500 rounded-lg text-white font-primaryRegular text-right"
                      style={{ fontSize: "20px" }}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-gray-300">Gwen is typing...</div>}
            {error && <div className="text-red-400">{error}</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about the game ..."
              rows={1}
              className="flex-1 p-2 rounded-l-lg text-white font-primaryRegular"
            />
            <Button
              type="submit"
              color="primary"
              className="bg-blue-500 text-white p-2 mt-4 rounded-r-lg hover:bg-blue-600 h-[70px] font-primaryRegular"
              disabled={loading}
            >
              {loading ? "Asking Gwen..." : "Ask"}
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatComponent;

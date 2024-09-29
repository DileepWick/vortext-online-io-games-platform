import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Avatar, Button, Textarea } from "@nextui-org/react";
import { X } from "lucide-react";

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
  const [birdMood, setBirdMood] = useState("happy");

  const fetchInitialMessage = async () => {
    try {
      const userResponse = await axios.get(
        `http://localhost:8098/users/profile/${userId}`
      );
      const { username, age } = userResponse.data.profile;

      const promptWithGame = `Greet "${username}" in a cute and funny way, like an Angry Bird character would. You're an expert on the game "${game}". Introduce yourself shortly and ask if the user has any questions about the game. You only talk about "${game}" nothing more. If the user asks about other stuff, be funny and mock them politely. Give short and simple answers and use emojis. Your name is Red, and you're always a bit grumpy but cute.`;

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
        const promptWithGame = `You are Red, a cute but grumpy Angry Bird character who's an expert on the game "${game}". ${input}`;

        const response = await axios.post("http://localhost:8098/api/chat", {
          sessionId,
          prompt: promptWithGame,
        });
        const aiMessage = { role: "ai", text: response.data.result };

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setInput("");
        setBirdMood(Math.random() > 0.5 ? "happy" : "angry");
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
    if (!isChatOpen) {
      setBirdMood("happy");
    }
  };

  const getBirdEmoji = () => {
    return birdMood === "happy" ? "😊" : "😠";
  };

  const getRandomChirp = () => {
    const chirps = [
      "Chirp chirp!",
      "Got any eggs?",
      "Wanna play?",
      "I'm watching you!",
      "Squawk!",
    ];
    return chirps[Math.floor(Math.random() * chirps.length)];
  };

  return (
    <>
      {!isChatOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 w-20 h-20 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out z-50 overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl mb-1">{getBirdEmoji()}</span>
            <span className="text-xs font-bold">{getRandomChirp()}</span>
          </div>
        </Button>
      )}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-full max-w-lg mx-auto p-6 bg-red-100 text-red-900 rounded-lg shadow-xl z-50 border-4 border-red-500">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-red-700">
              Chat with Red {getBirdEmoji()}
            </h1>
            <Button
              onClick={toggleChat}
              className="bg-transparent text-red-700 hover:bg-red-200 rounded-full p-2"
            >
              <X size={24} />
            </Button>
          </div>
          <p className="mb-4 text-red-600">I know everything about {game}!</p>
          <div className="h-96 overflow-y-auto rounded-lg p-4 bg-white mb-4">
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
                  <div className="flex flex-col items-start bg-red-200 p-3 rounded-lg max-w-[80%]">
                    <Avatar
                      src="https://static.wikia.nocookie.net/angrybirds/images/f/f7/Red_ab_movie.png"
                      alt="Red Avatar"
                      size="lg"
                    />
                    <span className="mt-2 font-bold text-red-700">Red</span>
                    <div className="mt-1 p-2 bg-red-100 rounded-lg text-red-900">
                      {msg.text}
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="flex flex-row bg-blue-100 p-3 rounded-lg max-w-[80%]">
                    <div className="p-2 bg-blue-200 rounded-lg text-blue-900 text-right">
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-red-500">Red is thinking... {getBirdEmoji()}</div>
            )}
            {error && <div className="text-red-600">{error}</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask Red about the game ..."
              rows={1}
              className="flex-1 p-2 rounded-l-lg text-red-900 font-medium"
            />
            <Button
              type="submit"
              color="danger"
              className="bg-red-500 text-white p-2 mt-4 rounded-r-lg hover:bg-red-600 h-[70px] font-bold"
              disabled={loading}
            >
              {loading ? "Asking Red..." : "Ask"}
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatComponent;
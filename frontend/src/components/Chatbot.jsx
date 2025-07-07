// import React, { useState, useEffect, useRef } from "react";
// import { Moon, Sun, Send, X, MessageSquare } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   GoogleGenerativeAI,
//   HarmBlockThreshold,
//   HarmCategory,
// } from "@google/generative-ai";
// import { API_BASE_URL } from "../utils/getAPI";

// const Chatbot = ({ isOpen, setIsOpen }) => {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [darkMode, setDarkMode] = useState(false); // Default to light mode
//   const chatboxRef = useRef(null);

//   // Initialize Gemini API
//   const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
//   const genAI = new GoogleGenerativeAI(API_KEY);

//   const tools = [
//     {
//       functionDeclarations: [
//         {
//           name: "listAllGames",
//           description:
//             "Lists all available games in the store. Use this when the user asks to see all games or available games.",
//           parameters: {
//             type: "object",
//             properties: {},
//           },
//         },
//         {
//           name: "getGameDetails",
//           description:
//             "Retrieves detailed information about a specific game, including its description, genre, and developer. Requires the game's name.",
//           parameters: {
//             type: "object",
//             properties: {
//               gameName: {
//                 type: "string",
//                 description: "The name of the game to get details for.",
//               },
//             },
//             required: ["gameName"],
//           },
//         },
//         {
//           name: "getGameStock",
//           description:
//             "Retrieves  information for a specific game, including its price, available  for  rental, and any active discounts. Requires the game's name.",
//           parameters: {
//             type: "object",
//             properties: {
//               gameName: {
//                 type: "string",
//                 description: "The name of the game to get stock details for.",
//               },
//             },
//             required: ["gameName"],
//           },
//         },
//       ],
//     },
//   ];

//   const systemInstruction = `You are a friendly and helpful human assistant for a game store named Vortex. Your primary goal is to assist users with their inquiries in a clear,
//   empathetic, and efficient manner. You have access to tools to fetch real-time data about games, their details, and stock information. Always try to use these tools when appropriate
//   to provide accurate information.

//     For common issues like 'invalid password' or 'invalid email', please suggest basic troubleshooting steps such as:
//     - Double-checking the spelling of the email or password.
//     - Ensuring there are no extra spaces.
//     - Suggesting the 'Forgot Password' option if applicable.

//     If a user asks a question that is beyond your capabilities or direct knowledge (e.g., account-specific issues that require personal data access, complex technical support, or issues
//     outside the scope of game store inquiries), please politely state that you cannot directly assist with that specific issue. Instead, offer to guide them to the appropriate resource,
//     such as the support page, FAQ section, or a human support agent, without making up information.

//     Always maintain a helpful and polite tone. If a question is not directly related to games, try to provide a helpful and relevant response if possible, or gently guide the user back to
//     game-related topics.";Do not act like you are an AI model, instead act like a helpful assistant for the store named. If you don't know the answer to a question, it's okay to say that
//     you don't know. You can also ask the user for more information if needed.if users brings a question that is commonly asked answer it direclty,try to fix the issue with your
//      knowledgemif its beyond your understanding tell users to reach customer support`;

//   const model = genAI.getGenerativeModel({
//     model: "gemini-2.0-flash",
//     tools: tools,
//     systemInstruction: systemInstruction,
//     safetySettings: [
//       {
//         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//         threshold: HarmBlockThreshold.BLOCK_NONE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//         threshold: HarmBlockThreshold.BLOCK_NONE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//         threshold: HarmBlockThreshold.BLOCK_NONE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//         threshold: HarmBlockThreshold.BLOCK_NONE,
//       },
//     ],
//   });
//   useEffect(() => {
//     // Initial greeting message
//     setMessages([
//       {
//         text: "Hello! I'm your Game Store assistant. How can I help you with games today?",
//         type: "incoming",
//       },
//     ]);
//   }, []);

//   // Scroll to bottom when new messages are added
//   useEffect(() => {
//     if (chatboxRef.current) {
//       chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const toggleChatbot = () => {
//     setIsOpen(!isOpen);
//   };

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//   };

//   const handleSend = async () => {
//     if (message.trim()) {
//       const outgoingMessage = { text: message, type: "outgoing" };
//       setMessages((prevMessages) => [...prevMessages, outgoingMessage]);
//       setMessage(""); // Clear input field

//       try {
//         const conversationHistory = messages.slice(1).map((msg) => ({
//           role: msg.type === "outgoing" ? "user" : "model",
//           parts: [{ text: msg.text }],
//         }));

//         const chat = model.startChat({
//           history: conversationHistory,
//           generationConfig: {
//             maxOutputTokens: 200,
//           },
//         });

//         let currentMessageContent = message;

//         while (true) {
//           const result = await chat.sendMessage(currentMessageContent);
//           const response = await result.response;

//           const part = response.candidates?.[0]?.content?.parts?.[0];

//           if (!part) {
//             setMessages((prev) => [
//               ...prev,
//               {
//                 text: "Sorry, I didn't get a valid response.",
//                 type: "incoming",
//               },
//             ]);
//             break; // Break if no valid part is found
//           }

//           // Handle text response first
//           if (part.text) {
//             const botResponse = part.text;
//             setMessages((prevMessages) => [
//               ...prevMessages,
//               { text: botResponse, type: "incoming" },
//             ]);
//             // If there's a text response, and no tool call, we can break the loop
//             if (!part.functionCall) {
//               break;
//             }
//           }

//           // Handle tool calls
//           if (part.functionCall) {
//             const functionCall = part.functionCall;

//             let toolOutput;

//             if (functionCall.name === "listAllGames") {
//               try {
//                 const apiResponse = await fetch(
//                   `${API_BASE_URL}/games/allGames`
//                 );
//                 const data = await apiResponse.json();
//                 toolOutput = data;
//               } catch (error) {
//                 console.error("Error fetching games:", error);
//                 toolOutput = JSON.stringify({
//                   error: "Failed to fetch games.",
//                 });
//               }
//             } else if (functionCall.name === "getGameDetails") {
//               try {
//                 const gameName = functionCall.args.gameName;
//                 // First, find the game ID by name
//                 const allGamesResponse = await fetch(
//                   `${API_BASE_URL}/games/allGames`
//                 );
//                 const allGamesData = await allGamesResponse.json();
//                 const game = allGamesData.games.find(
//                   (g) => g.title.toLowerCase() === gameName.toLowerCase()
//                 );

//                 if (game) {
//                   const gameDetailsResponse = await fetch(
//                     `${API_BASE_URL}/games/fetchGame/${game._id}`
//                   );
//                   const gameDetailsData = await gameDetailsResponse.json();
//                   toolOutput = JSON.stringify(gameDetailsData);
//                 } else {
//                   toolOutput = JSON.stringify({
//                     error: `Game '${gameName}' not found.`,
//                   });
//                 }
//               } catch (error) {
//                 console.error("Error fetching game details:", error);
//                 toolOutput = JSON.stringify({
//                   error: "Failed to fetch game details.",
//                 });
//               }
//             } else if (functionCall.name === "getGameStock") {
//               try {
//                 const gameName = functionCall.args.gameName;
//                 console.log("Calling getGameStock for game:", gameName);
//                 // First, find the game ID by name to get assignedGameId
//                 const allGamesResponse = await fetch(
//                   `${API_BASE_URL}/games/allGames`
//                 );
//                 const allGamesData = await allGamesResponse.json();
//                 console.log("Found game for getGameStock:", allGamesData);

//                 const game = allGamesData.games.find(
//                   (g) => g.title.toLowerCase() === gameName.toLowerCase()
//                 );
//                 console.log(game);

//                 if (game) {
//                   const gameStockResponse = await fetch(
//                     `${API_BASE_URL}/gameStocks/getGameStockDetails/${game._id}`
//                   ); // Assuming assignedGameId is the same as game._id
//                   const gameStockData = await gameStockResponse.json();
//                   toolOutput = JSON.stringify(gameStockData);
//                   console.log("getGameStock API response:", gameStockData);
//                   console.log("getGameStock toolOutput:", toolOutput);
//                 } else {
//                   toolOutput = JSON.stringify({
//                     error: `Game '${gameName}' not found.`,
//                   });
//                   console.log("Game not found for getGameStock:", gameName);
//                 }
//               } catch (error) {
//                 console.error("Error fetching game stock:", error);
//                 toolOutput = {
//                   error: "Failed to fetch game stock details.",
//                 };
//                 console.log("getGameStock error toolOutput:", toolOutput);
//               }
//             } else {
//               toolOutput = { error: `Unknown tool: ${functionCall.name}.` };
//             }

//             currentMessageContent = [
//               {
//                 functionResponse: {
//                   name: functionCall.name,
//                   response: toolOutput,
//                 },
//               },
//             ];
//             // Do NOT break here, as the loop needs to continue to send the tool output back to the model
//           } else if (!part.text) {
//             // If neither text nor functionCall is present, then something went wrong or content was blocked
//             setMessages((prevMessages) => [
//               ...prevMessages,
//               {
//                 text: "I'm sorry, I couldn't generate a response.",
//                 type: "incoming",
//               },
//             ]);
//             break; // Exit loop if nothing was handled
//           }
//         }
//       } catch (error) {
//         console.error("Error communicating with Gemini API:", error);
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           {
//             text: "Sorry, I'm having trouble connecting right now. Please try again later.",
//             type: "incoming",
//           },
//         ]);
//       }
//     }
//   };

//   return (
//     <div className={`fixed bottom-4 right-4 z-50 ${darkMode ? "dark" : ""}`}>
//       {/* Floating Action Button */}
//       <motion.button
//         className={`rounded-full p-4 shadow-xl ${
//           darkMode
//             ? "bg-gray-800 hover:bg-gray-700 text-white"
//             : "bg-white hover:bg-gray-50 text-gray-800"
//         } transition-all duration-300 ease-in-out border ${
//           darkMode ? "border-gray-700" : "border-gray-200"
//         }`}
//         onClick={toggleChatbot}
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         <AnimatePresence mode="wait" initial={false}>
//           {isOpen ? (
//             <motion.div
//               key="close"
//               initial={{ opacity: 0, rotate: -180 }}
//               animate={{ opacity: 1, rotate: 0 }}
//               exit={{ opacity: 0, rotate: 180 }}
//               transition={{ duration: 0.3 }}
//             >
//               <X size={24} />
//             </motion.div>
//           ) : (
//             <motion.div
//               key="open"
//               initial={{ opacity: 0, rotate: 180 }}
//               animate={{ opacity: 1, rotate: 0 }}
//               exit={{ opacity: 0, rotate: -180 }}
//               transition={{ duration: 0.3 }}
//             >
//               <MessageSquare size={24} />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.button>

//       {/* Chat Window */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.8, y: 20 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             className={`fixed bottom-20 right-4 w-96 rounded-xl shadow-2xl overflow-hidden border ${
//               darkMode
//                 ? "bg-gray-900 border-gray-700"
//                 : "bg-white border-gray-200"
//             }`}
//           >
//             {/* Header */}
//             <div
//               className={`p-4 flex justify-between items-center ${
//                 darkMode ? "bg-gray-800" : "bg-gray-100"
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <div
//                   className={`w-3 h-3 rounded-full ${
//                     darkMode ? "bg-green-400" : "bg-green-500"
//                   }`}
//                 ></div>
//                 <h2
//                   className={`font-bold ${
//                     darkMode ? "text-white" : "text-gray-800"
//                   }`}
//                 >
//                   Game Store Assistant
//                 </h2>
//               </div>
//               <div className="flex space-x-2">
//                 <motion.button
//                   onClick={toggleDarkMode}
//                   className={`p-1 rounded-full ${
//                     darkMode
//                       ? "text-yellow-300 hover:bg-gray-700"
//                       : "text-gray-600 hover:bg-gray-200"
//                   } transition-colors duration-200`}
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                 >
//                   {darkMode ? <Sun size={18} /> : <Moon size={18} />}
//                 </motion.button>
//                 <motion.button
//                   onClick={toggleChatbot}
//                   className={`p-1 rounded-full ${
//                     darkMode
//                       ? "text-gray-300 hover:bg-gray-700"
//                       : "text-gray-500 hover:bg-gray-200"
//                   } transition-colors duration-200`}
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                 >
//                   <X size={18} />
//                 </motion.button>
//               </div>
//             </div>

//             {/* Chat Messages */}
//             <ul
//               ref={chatboxRef}
//               className={`h-96 overflow-y-auto p-4 space-y-3 ${
//                 darkMode ? "bg-gray-900" : "bg-white"
//               }`}
//             >
//               {messages.map((msg, index) => (
//                 <motion.li
//                   key={index}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className={`flex ${
//                     msg.type === "incoming" ? "justify-start" : "justify-end"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-xs px-4 py-3 rounded-2xl ${
//                       msg.type === "incoming"
//                         ? darkMode
//                           ? "bg-gray-800 text-gray-100"
//                           : "bg-gray-100 text-gray-800"
//                         : darkMode
//                         ? "bg-blue-600 text-white"
//                         : "bg-blue-500 text-white"
//                     } ${
//                       msg.type === "incoming"
//                         ? "rounded-tl-none"
//                         : "rounded-tr-none"
//                     }`}
//                   >
//                     <p className="text-sm">{msg.text}</p>
//                     <div
//                       className={`text-xs mt-1 text-right ${
//                         msg.type === "incoming"
//                           ? darkMode
//                             ? "text-gray-400"
//                             : "text-gray-500"
//                           : "text-blue-100"
//                       }`}
//                     >
//                       {new Date().toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </div>
//                   </div>
//                 </motion.li>
//               ))}
//             </ul>

//             {/* Input Area */}
//             <div
//               className={`p-4 border-t ${
//                 darkMode
//                   ? "border-gray-800 bg-gray-900"
//                   : "border-gray-200 bg-white"
//               }`}
//             >
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   placeholder="Ask about games..."
//                   className={`flex-grow px-4 py-3 rounded-xl text-sm focus:outline-none ${
//                     darkMode
//                       ? "bg-gray-800 text-white placeholder-gray-400"
//                       : "bg-gray-100 text-gray-800 placeholder-gray-500"
//                   }`}
//                   onKeyPress={(e) => e.key === "Enter" && handleSend()}
//                 />
//                 <motion.button
//                   onClick={handleSend}
//                   disabled={!message.trim()}
//                   className={`p-3 rounded-xl ${
//                     message.trim()
//                       ? darkMode
//                         ? "bg-blue-600 hover:bg-blue-700"
//                         : "bg-blue-500 hover:bg-blue-600"
//                       : darkMode
//                       ? "bg-gray-700 text-gray-500"
//                       : "bg-gray-200 text-gray-400"
//                   } text-white transition-colors duration-200`}
//                   whileHover={{ scale: message.trim() ? 1.05 : 1 }}
//                   whileTap={{ scale: message.trim() ? 0.95 : 1 }}
//                 >
//                   <Send size={18} />
//                 </motion.button>
//               </div>
//               <p
//                 className={`text-xs mt-2 text-center ${
//                   darkMode ? "text-gray-500" : "text-gray-400"
//                 }`}
//               >
//                 Powered by Gemini AI
//               </p>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Chatbot;

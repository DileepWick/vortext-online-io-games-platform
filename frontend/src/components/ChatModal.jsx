import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Divider,
} from "@nextui-org/react";
import axios from "axios";
import { API_BASE_URL } from "../utils/getAPI";

const ChatModal = ({ isOpen, onOpenChange, contactId }) => {
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [status, setStatus] = useState("open");
  const [replyingTo, setReplyingTo] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null); // To store the image for the modal

  useEffect(() => {
    if (isOpen && contactId) {
      fetchMessages(contactId);
      const intervalId = setInterval(() => {
        fetchMessages(contactId); // Poll every 5 seconds
      }, 5000); // 5000 milliseconds = 5 seconds

      return () => clearInterval(intervalId); // Clear the interval when the modal is closed
    }
  }, [isOpen, contactId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl); // Set the image to be enlarged in the modal
  };

  const closeImageModal = () => {
    setEnlargedImage(null); // Close the modal by setting the image to null
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/contacts/fetchContactById/${userId}`
      );
      const data = await response.json();
      const formattedMessages = data.contact.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(),
        image: msg.image || null, // Include image field if it exists
      }));

      // Update state only if new messages are fetched
      if (formattedMessages.length !== messages.length) {
        setMessages(formattedMessages);
      }
      setStatus(data.contact.status);
      setUserName(data.contact.username);
      setCreatedAt(data.contact.createdAt);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return; // Prevent sending empty messages

    try {
      const response = await axios.post(
        `${API_BASE_URL}/contacts/reply/${contactId}`,
        { message: replyMessage }
      );

      if (response.status === 200) {
        // Create a new message object with the relevant properties
        const newMessage = {
          content: replyMessage,
          sender: "agent", // assuming the agent is sending the reply
          timestamp: new Date().toISOString(),
        };

        // Update the messages state to include the new message
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setReplyMessage(""); // Clear the input field
        setReplyingTo(null);
        // Keep the modal open after sending a reply
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0"); // Pad with leading zero
    const minutes = date.getMinutes().toString().padStart(2, "0"); // Pad with leading zero
    return `${hours}:${minutes}`; // Return formatted time
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="dark text-foreground bg-background"
      size="3xl"
      backdrop="blur"
      isDismissable={false}
      isKeyboardDismissDisabled={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Chat</ModalHeader>
            <Divider className="my-4" />
            <ModalBody className="flex flex-col">
              <div
                className="flex-grow overflow-y-auto"
                style={{ maxHeight: "70vh" }}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      message.sender === "agent" ? "text-right" : "text-left"
                    }`}
                  >
                    {/* Render text message if present */}
                    {message.content && (
                      <span
                        className={`inline-block p-2 rounded ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white max-w-[70%] text-left"
                            : "bg-green-600 text-white max-w-[70%] text-left"
                        }`}
                        style={{ wordWrap: "break-word" }}
                      >
                        {message.content}
                        <div
                          className="text-xs text-white-400"
                          style={{ textAlign: "right" }}
                        >
                          {formatTimestamp(message.timestamp)}{" "}
                          {/* Use the updated formatTimestamp */}
                        </div>
                      </span>
                    )}
                    {message.image && (
                      <div className="mt-2">
                        {/* Render the image */}
                        <img
                          src={message.image}
                          alt="User uploaded"
                          className={`cursor-pointer rounded ${
                            message.sender === "user"
                              ? "text-left"
                              : "text-right"
                          }`}
                          style={{
                            width: "150px", // Fixed width
                            height: "150px", // Fixed height
                            objectFit: "cover", // Cover to maintain aspect ratio
                            borderRadius: "8px",
                          }}
                          onClick={() => handleImageClick(message.image)} // Handle click to enlarge
                        />

                        {/* Display the timestamp below the image */}
                        <div
                          className="text-xs text-white-400"
                          style={{ textAlign: "right", marginTop: "5px" }} // Margin to separate the time from the image
                        ></div>
                        <div className="text-xs text-white-400">
                          {formatTimestamp(message.timestamp)}{" "}
                          {/* Use formatTimestamp to show time */}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Input
                  placeholder="Type a message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleReply()}
                  isDisabled={status === "closed"}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleReply}
                isDisabled={status === "closed" || !replyMessage.trim()}
              >
                Send
              </Button>
            </ModalFooter>

            {/* Modal to show enlarged image */}
            {enlargedImage && (
              <Modal
                isOpen={!!enlargedImage}
                onClose={closeImageModal}
                size="lg"
              >
                <ModalContent>
                  <img
                    src={enlargedImage}
                    alt="Enlarged view"
                    style={{
                      width: "100%", // Full width in modal
                      height: "auto", // Maintain aspect ratio
                    }}
                  />
                </ModalContent>
              </Modal>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ChatModal;

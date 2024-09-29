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

const ChatModal = ({ isOpen, onOpenChange, contactId }) => {
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8098/contacts/fetchContactById/${userId}`
      );
      const data = await response.json();
      const formattedMessages = data.contact.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));

      // Update state only if new messages are fetched
      if (formattedMessages.length !== messages.length) {
        setMessages(formattedMessages);
      }

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
        `http://localhost:8098/contacts/reply/${contactId}`,
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
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`; // Format as HH:MM
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="dark text-foreground bg-background"
      size="2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="text-small mb-21">Chat with {userName}</div>
              <div className="text-small mb-21">
                Raised at {new Date(createdAt).toLocaleString()}
              </div>
            </ModalHeader>
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
                    <span
                      className={`inline-block p-2 rounded ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white max-w-[70%] text-left"
                          : "bg-green-600 text-white max-w-[70%] text-left"
                      }`}
                      style={{
                        wordWrap: "break-word",
                      }}
                    >
                      {message.content}
                      <div
                        className="text-xs text-white-400"
                        style={{ textAlign: "right" }} // Align timestamp to the right
                      >
                        {formatTimestamp(message.timestamp)}{" "}
                      </div>
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Scroll anchor */}
              </div>
              <div className="mt-4">
                <Input
                  placeholder="Type a message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleReply()}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleReply}>
                Send
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ChatModal;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";

import Header from "../components/header";
import Footer from "../components/footer";

const UserMessages = () => {
  const [userContact, setUserContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const fetchUserContact = async () => {
      if (!userId) {
        setError("User ID not found in token");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:8098/contacts/fetchContactByUserId/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response:", response.data);

        const contact = response.data.contact || null;

        setUserContact(contact);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user contact:", err);
        setError("You have no raised tickets!");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserContact();
    } else {
      setLoading(false);
    }
  }, [userId, token]);

  const handleReplyToAgent = async () => {
    if (!replyMessage.trim() || !userContact) return;

    try {
      const response = await axios.post(
        `http://localhost:8098/contacts/replyToAgent/${userContact._id}`,
        {
          message: replyMessage,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const newMessage = {
          content: replyMessage,
          sender: "user",
          timestamp: new Date().toISOString(),
        };
        setUserContact((prevContact) => ({
          ...prevContact,
          messages: [...(prevContact.messages || []), newMessage],
        }));
        setReplyMessage("");
      }
    } catch (error) {
      setError("Failed to send message. Please try again later.");
    }
  };

  const handleGoBack = () => {
    window.history.back(); // Use built-in JS function to go back
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {error ? (
            <CardBody className="p-4 bg-gray-700 text-red-500 text-center">
              <div>{error}</div>
              <Button onClick={handleGoBack} color="primary" className="mt-4">
                Go Back
              </Button>
            </CardBody>
          ) : !userContact ? (
            <CardBody className="p-4 bg-gray-700 text-white text-center">
              <div>You have no raised tickets</div>
            </CardBody>
          ) : (
            <>
              <CardBody className="p-4 bg-gray-700">
                <h1 className="text-lg font-semibold text-white">
                  Ticket Number: {userContact._id}
                </h1>
                <p className="text-sm text-gray-400">
                  Started: {new Date(userContact.createdAt).toLocaleString()}
                </p>
              </CardBody>
              <CardBody className="p-4 h-[50vh] overflow-y-auto bg-gray-900">
                {userContact.messages && userContact.messages.length > 0 ? (
                  userContact.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        <p className="font-semibold text-sm">
                          {message.sender === "user"
                            ? userContact.username
                            : "Agent"}
                        </p>
                        <p className="mt-1">{message.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white text-center">
                    No messages in this ticket yet
                  </div>
                )}
              </CardBody>
              <CardBody className="p-4 bg-gray-700">
                <Input
                  type="text"
                  label="Reply"
                  placeholder="Type your message here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="mb-2"
                />
                <Button
                  color="primary"
                  auto
                  onClick={handleReplyToAgent}
                  disabled={!replyMessage.trim()}
                >
                  Send Reply
                </Button>
              </CardBody>
            </>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default UserMessages;

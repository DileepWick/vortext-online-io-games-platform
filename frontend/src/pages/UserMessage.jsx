import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Card,
  CardBody,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";

import Header from "../components/header";
import Footer from "../components/footer";

const UserMessages = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const fetchUserTickets = async () => {
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

        let tickets = [];
        if (response.data && Array.isArray(response.data.contact)) {
          tickets = response.data.contact;
        }

        setUserTickets(tickets);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch tickets!");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserTickets();
    } else {
      setLoading(false);
    }
  }, [userId, token]);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleReplyToAgent = async () => {
    if (
      !replyMessage.trim() ||
      !selectedTicket ||
      selectedTicket.status === "closed"
    )
      return;

    try {
      const response = await axios.post(
        `http://localhost:8098/contacts/replyToAgent/${selectedTicket._id}`,
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
        setSelectedTicket((prevTicket) => ({
          ...prevTicket,
          messages: [...(prevTicket.messages || []), newMessage],
        }));
        setReplyMessage("");

        // Update the ticket in the userTickets array
        setUserTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket._id === selectedTicket._id
              ? {
                  ...ticket,
                  messages: [...(ticket.messages || []), newMessage],
                }
              : ticket
          )
        );
      }
    } catch (error) {
      setError("Failed to send message. Please try again later.");
    }
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(timestamp));
  };

  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Header />
      <div className="max-w-4xl mx-auto p-4 flex-grow">
        {error ? (
          <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <CardBody className="p-4 bg-gray-700 text-red-500 text-center">
              <div>{error}</div>
            </CardBody>
          </Card>
        ) : userTickets.length === 0 ? (
          <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-10">
            <CardBody className="p-4 bg-gray-700 text-white text-center">
              <div className="text-lg">You have no raised tickets</div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ticket list */}
            {userTickets.map((ticket) => (
              <Card
                key={ticket._id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer mt-8"
                isPressable
                onPress={() => handleSelectTicket(ticket)}
              >
                <CardBody className="p-4">
                  <h2 className="text-lg font-semibold text-white">
                    Ticket: {ticket._id}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Status: {ticket.status}
                  </p>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Chat History */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="dark text-foreground bg-background"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Chat History
          </ModalHeader>
          <ModalBody>
            {selectedTicket &&
            selectedTicket.messages &&
            selectedTicket.messages.length > 0 ? (
              selectedTicket.messages.map((message, index) => {
                const previousMessage = selectedTicket.messages[index - 1];
                const showDate =
                  !previousMessage ||
                  !isSameDay(message.timestamp, previousMessage.timestamp);

                return (
                  <div key={`${selectedTicket._id}-message-${index}`}>
                    {showDate && (
                      <div className="text-gray-500 text-center my-2">
                        {formatDate(message.timestamp)}
                      </div>
                    )}
                    <div
                      className={`mb-4 flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-green-600 text-white max-w-[70%] text-left"
                            : "bg-blue-500 text-white max-w-[70%] text-left"
                        }`}
                      >
                        <p className="mt-1">{message.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-white text-center">
                No messages in this ticket yet
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-col gap-2 w-full">
            {selectedTicket && selectedTicket.status === "closed" && (
              <div className="text-red-500 mt-4 text-sm text-center">
                This ticket is closed. You cannot reply to it.
              </div>
            )}
            {selectedTicket && selectedTicket.status === "open" && (
              <Input
                aria-label="Reply to Agent"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message..."
                fullWidth
                clearable
                className="bg-gray-800 text-white"
              />
            )}

            <div className="flex justify-end gap-2 mt-2">
              <Button
                color="danger"
                variant="light"
                onPress={() => setIsModalOpen(false)}
              >
                Close
              </Button>

              <Button
                onPress={handleReplyToAgent}
                color="primary"
                disabled={!replyMessage.trim()}
                className="cursor-pointer"
              >
                Send
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Footer />
    </div>
  );
};

export default UserMessages;

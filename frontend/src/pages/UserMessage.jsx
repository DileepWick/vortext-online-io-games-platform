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
import { Helmet } from "react-helmet-async";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";

import Header from "../components/header";
import Footer from "../components/footer";

const UserMessages = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null); // For storing the selected ticket
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
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
    console.log("Ticket clicked:", ticket); // Debug: Check if the function triggers
    setSelectedTicket(ticket); // Set the selected ticket
    setIsModalOpen(true); // Open the modal
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

  if (loading) {
    return <Spinner />;
  }

  console.log("Is modal open?", isModalOpen); // Debug: Check if modal state changes

  return (
    <div className="bg-gray-900 min-h-screen">
      <Helmet>
        <title>My Tickets | Vortex </title>
      </Helmet>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        {error ? (
          <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <CardBody className="p-4 bg-gray-700 text-red-500 text-center">
              <div>{error}</div>
            </CardBody>
          </Card>
        ) : userTickets.length === 0 ? (
          <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <CardBody className="p-4 bg-gray-700 text-white text-center">
              <div>You have no raised tickets</div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ticket list */}
            <div className="space-y-4">
              {userTickets.map((ticket) => (
                <Card
                  key={ticket._id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer"
                  isPressable
                  onPress={() => handleSelectTicket(ticket)} // Open modal on click
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
          </div>
        )}
      </div>

      {/* Modal for Chat History */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Use onClose to handle modal close event
        className="bg-customDark"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Chat History
          </ModalHeader>
          <ModalBody>
            {selectedTicket &&
            selectedTicket.messages &&
            selectedTicket.messages.length > 0 ? (
              selectedTicket.messages.map((message, index) => (
                <div
                  key={`${selectedTicket._id}-message-${index}`}
                  className={`mb-4 flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
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
                        ? selectedTicket.username
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

            {/* Reply input field and button, only if the ticket is open */}
            {selectedTicket && selectedTicket.status === "open" && (
              <div className="mt-4">
                <Input
                  aria-label="Reply to Agent"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message..."
                  fullWidth
                  clearable
                  className="bg-gray-800 text-white"
                />
                <Button
                  color="primary"
                  onPress={handleReplyToAgent}
                  disabled={!replyMessage.trim()}
                  className="mt-2"
                >
                  Send Reply
                </Button>
              </div>
            )}

            {/* Show a message if the ticket is closed */}
            {selectedTicket && selectedTicket.status === "closed" && (
              <div className="text-red-500 mt-4">
                This ticket is closed. You cannot reply to it.
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Footer />
    </div>
  );
};

export default UserMessages;

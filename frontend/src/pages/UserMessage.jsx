import React, { useState, useEffect, useRef } from "react";
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
  Pagination,
} from "@nextui-org/react";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { motion } from "framer-motion";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";

const UserMessages = () => {
  useAuthCheck();
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const TICKETS_PER_PAGE = 6;
  const token = getToken();
  const userId = getUserIdFromToken(token);
  const totalPages = Math.ceil(userTickets.length / TICKETS_PER_PAGE);
  const [scrollBehavior, setScrollBehavior] = React.useState("inside");
  const messagesEndRef = useRef(null);
  const [enlargedImage, setEnlargedImage] = useState(null); // State to manage the enlarged image

  const paginatedTickets = userTickets.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );
  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl); // Set the clicked image URL in state
  };

  useEffect(() => {
    if (isModalOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to bottom smoothly
    }
  }, [isModalOpen, selectedTicket]); // Scroll when modal opens or new messages appear

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
          tickets = response.data.contact.map((ticket) => {
            // Calculate unread messages count
            const unreadMessagesCount = ticket.messages.filter(
              (message) => !message.read && message.sender !== "user" // Only count unread messages not sent by the user
            ).length;

            // Log the unread message count for each ticket
            console.log(
              `Ticket ID: ${ticket._id}, Unread Messages: ${unreadMessagesCount}`
            );

            // Attach unread count to each ticket
            return { ...ticket, unreadMessagesCount };
          });

          // Sort tickets: open tickets first, then by creation date (newest first)
          tickets.sort((a, b) => {
            if (a.status === "open" && b.status !== "open") return -1;
            if (a.status !== "open" && b.status === "open") return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
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

  const handleSelectTicket = async (ticket) => {
    try {
      // Mark the messages as read in the backend
      await axios.put(
        `http://localhost:8098/contacts/markMessagesAsRead/${ticket._id}`,

        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the state locally to mark messages as read
      setUserTickets((prevTickets) =>
        prevTickets.map((t) =>
          t._id === ticket._id
            ? { ...t, unreadMessagesCount: 0 } // Mark all messages as read
            : t
        )
      );

      // Open the modal and set the selected ticket
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to mark messages as read", err);
    }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const cardVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Header />
      <motion.div
        className="max-w-4xl mx-auto p-4 flex-grow"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {error ? (
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <CardBody className="p-4 bg-gray-700 text-red-500 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {error}
                </motion.div>
              </CardBody>
            </Card>
          </motion.div>
        ) : userTickets.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-10">
              <CardBody className="p-4 bg-gray-700 text-white text-center">
                <motion.div
                  className="text-lg"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  You have no raised tickets
                </motion.div>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={containerVariants}
              style={{ minHeight: "450px" }} // Adjust this value based on your card size
            >
              {paginatedTickets.map((ticket) => (
                <motion.div key={ticket._id} variants={itemVariants}>
                  <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Card
                      className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer mt-8 ${
                        ticket.status === "open"
                          ? "border-2 border-green-500"
                          : ""
                      }`}
                      isPressable
                      onPress={() => handleSelectTicket(ticket)}
                    >
                      <CardBody className="p-4 relative">
                        <motion.h2
                          className="text-lg font-semibold text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Ticket: {ticket._id}
                        </motion.h2>

                        <motion.p
                          className={`text-sm ${
                            ticket.status === "open"
                              ? "text-green-400"
                              : "text-gray-400"
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          Status: {ticket.status}
                        </motion.p>
                        <motion.p
                          className="text-sm text-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          Created: {new Date(ticket.createdAt).toLocaleString()}
                        </motion.p>

                        {/* Display unread message count */}
                        {ticket.unreadMessagesCount > 0 && (
                          <div className="absolute top-2 right-2">
                            <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                              {ticket.unreadMessagesCount}
                            </span>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
            <div className="flex justify-center mt-8">
              {totalPages > 1 && (
                <Pagination
                  total={totalPages}
                  initialPage={1}
                  page={currentPage}
                  onChange={setCurrentPage}
                />
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Modal for Chat History */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="dark text-foreground bg-background"
        size="3xl"
        backdrop="blur"
        isDismissable={false}
        isKeyboardDismissDisabled={false}
        scrollBehavior={scrollBehavior}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Chat History
          </ModalHeader>
          <ModalBody>
            {selectedTicket &&
            selectedTicket.messages &&
            selectedTicket.messages.length > 0 ? (
              <>
                {selectedTicket.messages.map((message, index) => {
                  const previousMessage = selectedTicket.messages[index - 1];
                  const showDate =
                    !previousMessage ||
                    !isSameDay(message.timestamp, previousMessage.timestamp);

                  return (
                    <div key={`${selectedTicket._id}-message-${index}`}>
                      {/* Display date if necessary */}
                      {showDate && (
                        <div className="text-gray-500 text-center my-2">
                          {formatDate(message.timestamp)}
                        </div>
                      )}

                      {/* Render the text message separately */}
                      {message.content && (
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
                      )}

                      {/* Render the image message separately */}
                      {message.image && (
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
                            <img
                              src={message.image}
                              alt="User uploaded"
                              className="rounded cursor-pointer"
                              style={{
                                width: "150px", // Fixed width
                                height: "150px", // Fixed height
                                objectFit: "cover", // Ensure aspect ratio is maintained
                              }}
                              onClick={() => handleImageClick(message.image)} // Optional: Enlarge image on click
                            />
                            <p className="text-xs mt-1 opacity-75">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
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
                variant="underlined"
                clearable
                className="text-white"
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
          {enlargedImage && (
            <Modal
              isOpen={!!enlargedImage}
              onClose={() => setEnlargedImage(null)} // Close the modal
              size="lg"
            >
              <ModalContent>
                <img
                  src={enlargedImage}
                  alt="Enlarged view"
                  style={{
                    width: "100%", // Full width in modal
                    height: "auto", // Maintain aspect ratio
                    borderRadius: "8px", // Optional: Rounded corners
                  }}
                />
              </ModalContent>
            </Modal>
          )}
        </ModalContent>
      </Modal>

      <Footer />
    </div>
  );
};

export default UserMessages;

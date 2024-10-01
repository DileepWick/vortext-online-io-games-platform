// src/components/ChatHistory.js
import React from "react";
import { useLocation } from "react-router-dom";
import { Card, CardBody } from "@nextui-org/react";

const ChatHistory = () => {
  const location = useLocation();
  const { ticket } = location.state || {}; // Accessing the ticket passed through state

  if (!ticket) {
    return <div>No ticket found</div>; // Fallback if no ticket is provided
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <CardBody className="p-4 bg-gray-700">
            <h1 className="text-lg font-semibold text-white">
              Ticket Number: {ticket._id}
            </h1>
            <p className="text-sm text-gray-400">Status: {ticket.status}</p>
            <div className="h-[50vh] overflow-y-auto bg-gray-900">
              {ticket.messages && ticket.messages.length > 0 ? (
                ticket.messages.map((message, index) => (
                  <div
                    key={`${ticket._id}-message-${index}`}
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
                        {message.sender === "user" ? ticket.username : "Agent"}
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
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ChatHistory;

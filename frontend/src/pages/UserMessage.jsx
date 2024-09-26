import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";

const UserMessages = () => {
  const [userContact, setUserContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the token and decode the userId
  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const fetchUserContact = async () => {
      console.log(userId);
      if (!userId) {
        setError("User ID not found in token");
        return;
      }
      try {
        setLoading(true);
        setError(null); // Reset error before fetching
        const response = await axios.get(
          `http://localhost:8098/contacts/fetchContactByUserId/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
          }
        );
        console.log(userId);

        const contact = response.data.contact; // Use the correct field from the response
        setUserContact(contact || null);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user contact:", err);
        setError("Failed to load messages. Please try again later.");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserContact(); // Only call API if userId is present
    }
  }, [userId, token]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  if (!userContact) {
    return <p>No messages found for this user.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">
          Message Thread for {userContact.username}
        </h3>
        <p className="text-sm text-gray-500">
          Started: {new Date(userContact.createdAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardBody>
        {userContact.messages.map((message) => (
          <div
            key={message._id}
            className="mb-4 p-2 rounded"
            style={{
              backgroundColor:
                message.sender === "user" ? "#f0f0f0" : "#e6f7ff",
            }}
          >
            <p className="font-semibold">
              {message.sender === "user" ? userContact.username : "Agent"}
            </p>
            <p>{message.content}</p>
            <small className="text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </small>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};

export default UserMessages;

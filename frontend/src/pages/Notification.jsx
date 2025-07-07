import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { MdError, MdCheckCircle } from "react-icons/md"; // Import the necessary icons
import { API_BASE_URL } from "../utils/getAPI";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      setError("Invalid token. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/getNotification/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(response.data.notifications);
      setError(null);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Unauthorized access. Please log in again.");
        } else {
          setError(
            `Error fetching notifications: ${
              err.response.data.message || err.message
            }`
          );
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(`Error: ${err.message}`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = getToken();
      await axios.put(
        `${API_BASE_URL}/notifications/markAsRead/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read", err);
      setError("Failed to mark notification as read. Please try again.");
    }
  };

  if (loading)
    return <div className="text-center">Loading notifications...</div>;

  return (
    <div className="max-w-lg mx-auto p-4 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Your Notifications</h2>
      {error && (
        <div className="mb-4 flex items-start bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          <MdError className="mr-2 text-xl" />
          <div>
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications available.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-3 rounded-md ${
                notification.read
                  ? "bg-gray-200"
                  : "bg-white border border-gray-300"
              }`}
            >
              <p className="font-medium">{notification.content}</p>
              <small className="text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </small>
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <MdCheckCircle className="inline-block mr-1" />
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;

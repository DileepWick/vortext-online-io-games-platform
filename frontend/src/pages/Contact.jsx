import React, { useEffect, useState } from "react";
import "../style/contact.css";
import { motion } from "framer-motion";
import { Input, Textarea } from "@nextui-org/input";
import { toast, Flip } from "react-toastify";
import { Button, Select, SelectItem } from "@nextui-org/react";
import Header from "../components/header";
import Footer from "../components/footer";
import ScrollToTop from "../components/ScrollToTop";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import CustomToast from "../components/CustomToast";
import { AlertCircle } from "lucide-react";
import { Upload } from "lucide-react";
const Contact = () => {
  useAuthCheck();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [hasOpenTicket, setHasOpenTicket] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const token = getToken();
  const userId = getUserIdFromToken(token);
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false); // For drag-over state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/users/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData({
          username: response.data.profile.username,
          email: response.data.profile.email,
        });

        // Check if user has any tickets and if there is an open ticket
        const ticketResponse = await axios.get(
          `http://localhost:8098/contacts/fetchContactByUserId/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const tickets = ticketResponse.data.contact || [];

        // Check if any ticket exists and is not closed
        const hasOpen = tickets.some((ticket) => ticket.status !== "closed");

        setHasOpenTicket(hasOpen);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // toast.error("Failed to fetch user data");
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0]; // Get the selected file
    const maxFileSizeMB = 10; // Set the maximum file size
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024; // Convert MB to bytes

    if (selectedFile) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];

      // Validate file type
      if (!validImageTypes.includes(selectedFile.type)) {
        CustomToast({
          message:
            "Invalid file type. Please upload a valid image (JPG, PNG, GIF, SVG).",
          type: "error",
        });
        return;
      }

      // Validate file size
      if (selectedFile.size > maxFileSizeBytes) {
        CustomToast({
          message: `File size exceeds the limit of ${maxFileSizeMB} MB. Please upload a smaller file.`,
          type: "error",
        });
        return;
      }

      setImage(selectedFile); // Store the file in the state if it's valid
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false); // Reset dragging state
    const selectedFile = e.dataTransfer.files[0]; // Get the dropped file
    if (selectedFile) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (validImageTypes.includes(selectedFile.type)) {
        setImage(selectedFile); // Store the file in the state
      } else {
        CustomToast({
          message:
            "Invalid file type. Please upload a valid image (JPG, PNG, GIF, SVG).",
          type: "error",
        });
      }
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    setIsDragging(true); // Set dragging state
  };

  const handleDragLeave = () => {
    setIsDragging(false); // Reset dragging state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    const userId = getUserIdFromToken(token);

    if (!userId) {
      CustomToast({
        message: "Unable to retrieve user ID. Please login.",
        type: "error",
      });
      return;
    }

    // Create FormData and append necessary fields
    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("message", message);
    formData.append("userId", userId);

    if (image) {
      formData.append("image", image); // Append the image file to FormData
      console.log("Appended image:", image); // Log the image file
    } else {
      console.log("No image selected.");
    }

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      // Send the request to the server
      const response = await axios.post(
        "http://localhost:8098/contacts/submitContactForm",
        formData,
        { headers }
      );

      if (response.status === 201) {
        CustomToast({
          message: "Message sent successfully",
          type: "success",
        });
        // Reset the form
        setMessage("");
        setImage(null);
        setHasOpenTicket(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      CustomToast({
        message: "Failed to send message",
        type: "error",
      });
    }
  };

  return (
    <>
      <Header />
      <ScrollToTop />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="raise-ticket-container font-primaryRegular bg-gray-900 min-h-screen flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl"
        >
          <h1 className="text-3xl font-bold text-white mb-6">Raise a Ticket</h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gray-700 p-4 rounded-md mb-6"
          >
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
              <AlertCircle className="mr-2" size={20} />
              Before You Submit
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>
                Check our FAQ section for quick answers to common questions.
              </li>
              <li>Provide as much detail as possible about your issue.</li>
              <li>Include any error messages or screenshots if applicable.</li>
              <li>
                Select the appropriate category and priority for faster
                resolution.
              </li>
            </ul>
          </motion.div>

          {hasOpenTicket ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-center"
            >
              <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-200 p-4 mb-4 rounded">
                <p className="font-medium text-lg">
                  You have an open ticket. Please wait for a response or check
                  your existing ticket.
                </p>
              </div>
              <Button
                className="mx-auto block"
                onClick={() => navigate("/UserMessage")}
                color="primary"
              >
                View Existing Ticket
              </Button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full space-y-4"
              onSubmit={handleSubmit}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Input
                  label="Your Name"
                  size="lg"
                  type="text"
                  labelPlacement="inside"
                  value={userData.username}
                  readOnly
                  className="text-white"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Input
                  label="Your Email"
                  size="lg"
                  type="email"
                  labelPlacement="inside"
                  value={userData.email}
                  readOnly
                  className="text-white"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Textarea
                  label="Describe your issue"
                  labelPlacement="inside"
                  size="lg"
                  value={message}
                  isRequired={true}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      // Limit to 300 characters
                      setMessage(e.target.value);
                    }
                  }}
                  className="text-white"
                  minRows={4}
                />
                <div className="text-right text-sm text-gray-400 mt-1">
                  {message.length}/500 characters
                </div>
              </motion.div>

              {/* Add image upload input field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                    isDragging
                      ? "border-blue-500 bg-gray-600"
                      : "border-gray-300 bg-gray-700"
                  } border-dashed rounded-lg cursor-pointer transition-colors duration-300`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      SVG, PNG, JPG or GIF (MAX 10MB)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Feedback section: display selected image file with remove option */}
                {image && (
                  <div className="mt-4 text-gray-300 flex items-center justify-between">
                    <p>
                      Selected file:{" "}
                      <span className="font-semibold">{image.name}</span>
                    </p>
                    <button
                      onClick={() => setImage(null)}
                      className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition-colors duration-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Submit Ticket
                </Button>
              </motion.div>
            </motion.form>
          )}
        </motion.div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Contact;

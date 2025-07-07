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
import {
  AlertCircle,
  Upload,
  X,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const selectedFile = e.target.files[0];
    const maxFileSizeMB = 10;
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

    if (selectedFile) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];

      if (!validImageTypes.includes(selectedFile.type)) {
        CustomToast({
          message:
            "Invalid file type. Please upload a valid image (JPG, PNG, GIF, SVG).",
          type: "error",
        });
        return;
      }

      if (selectedFile.size > maxFileSizeBytes) {
        CustomToast({
          message: `File size exceeds the limit of ${maxFileSizeMB} MB. Please upload a smaller file.`,
          type: "error",
        });
        return;
      }

      setImage(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (validImageTypes.includes(selectedFile.type)) {
        setImage(selectedFile);
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
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = getToken();
    const userId = getUserIdFromToken(token);

    if (!userId) {
      CustomToast({
        message: "Unable to retrieve user ID. Please login.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("message", message);
    formData.append("userId", userId);

    if (image) {
      formData.append("image", image);
      console.log("Appended image:", image);
    } else {
      console.log("No image selected.");
    }

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-black text-white py-20 px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center mb-6"
            >
              <MessageSquare className="w-8 h-8 mr-3" />
              <h1 className="text-4xl md:text-5xl font-light tracking-wide">
                Get in Touch
              </h1>
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Have a question or need assistance? We're here to help you with
              any issues or inquiries.
            </motion.p>
          </div>
        </motion.section>

        {/* Main Content */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="py-20 px-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Info Section */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-2xl font-light text-black mb-6 flex items-center">
                    <AlertCircle className="w-6 h-6 mr-3 text-gray-600" />
                    Before You Submit
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-black rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <p>
                        Check our FAQ section for quick answers to common
                        questions.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-black rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <p>
                        Provide as much detail as possible about your issue.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-black rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <p>
                        Include any error messages or screenshots if applicable.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-black rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <p>
                        Select the appropriate category and priority for faster
                        resolution.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-black text-white rounded-lg">
                    <div className="text-2xl font-light mb-2">24/7</div>
                    <div className="text-sm text-gray-300">Support</div>
                  </div>
                  <div className="text-center p-6 bg-gray-900 text-white rounded-lg">
                    <div className="text-2xl font-light mb-2">&lt;2h</div>
                    <div className="text-sm text-gray-300">Response Time</div>
                  </div>
                </div>
              </motion.div>

              {/* Form Section */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm"
              >
                {hasOpenTicket ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-light text-black">
                        Ticket Active
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        You have an open ticket. Please wait for a response or
                        check your existing ticket.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/UserMessage")}
                      className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:bg-gray-800"
                    >
                      View Existing Ticket
                    </motion.button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={userData.username}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Email
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Describe your issue *
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) {
                              setMessage(e.target.value);
                            }
                          }}
                          required
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 resize-none"
                          placeholder="Please describe your issue in detail..."
                        />
                        <div className="text-right text-sm text-gray-500 mt-2">
                          {message.length}/500 characters
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attach Screenshot (Optional)
                        </label>
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                            isDragging
                              ? "border-black bg-gray-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-gray-600 font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          </div>
                        </div>

                        {image && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-700 font-medium">
                                {image.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setImage(null)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                            >
                              <X className="w-4 h-4 text-gray-600" />
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black text-white py-4 px-6 rounded-lg font-medium transition-all duration-300 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        "Submit Ticket"
                      )}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </>
  );
};

export default Contact;

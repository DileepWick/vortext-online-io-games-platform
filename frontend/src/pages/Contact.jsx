import React, { useEffect, useState } from "react";
import "../style/contact.css";
import { Input, Textarea } from "@nextui-org/input";
import { toast, Flip } from "react-toastify";
import { Button } from "@nextui-org/button";
import Header from "../components/header";
import Footer from "../components/footer";
import axios from "axios";

import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";

const Contact = () => {
  useAuthCheck();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [message, setMessage] = useState("");

  const token = getToken();
  const userId = getUserIdFromToken(token);

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
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim() === "") {
      toast.error("Message cannot be empty", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        progressBarClassName: "bg-gray-800",
        style: { fontFamily: "Rubik" },
      });
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      await axios.post(
        "http://localhost:8098/contacts/submitContactForm",
        {
          username: userData.username,
          email: userData.email,
          message,
        },
        { headers }
      );

      toast.success("Message Sent", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        progressBarClassName: "bg-gray-800",
        style: { fontFamily: "Rubik" },
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response?.status === 429) {
        const { hours, minutes } = error.response.data.timeRemaining;
        const timeMessage = `You can send another message in ${hours} hours and ${minutes} minutes.`;
        toast.error(`${error.response.data.message} ${timeMessage}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          progressBarClassName: "bg-gray-800",
          style: { fontFamily: "Rubik" },
        });
      } else {
        toast.error(
          `Failed to send message: ${
            error.response?.data?.message || error.message
          }`,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Flip,
            progressBarClassName: "bg-gray-800",
            style: { fontFamily: "Rubik" },
          }
        );
      }
    }
  };

  return (
    <>
      <Header />
      <div className="contact-container font-primaryRegular">
        <div className="image_container">
          <img
            src="https://res.cloudinary.com/dhcawltsr/image/upload/v1719572048/wallpaperflare.com_wallpaper_3_gpe852.jpg"
            alt="Contact Us"
          />
        </div>
        <div className="contact_us_container">
          <div className="w-full flex flex-col gap-8">
            <h1 className="text-3xl">Contact Us:</h1>
            <form className="w-full" onSubmit={handleSubmit}>
              <Input
                label="Name"
                size="lg"
                type="text"
                labelPlacement="inside"
                value={userData.username}
                readOnly
              />
              <Input
                label="Email"
                className="mt-5"
                size="lg"
                type="email"
                labelPlacement="inside"
                value={userData.email}
                readOnly
              />
              <Textarea
                label="Message"
                labelPlacement="inside"
                className="mt-5"
                size="lg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                type="submit"
                radius="sm"
                size="md"
                className="bg-black text-white font-bold mt-14"
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Avatar } from "@nextui-org/react";
import { toast, Flip } from 'react-toastify';
import Header from "../components/header";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import { FaGamepad, FaTrophy, FaUserNinja } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [existingProfilePic, setExistingProfilePic] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/login");
          return;
        }
        const userId = getUserIdFromToken(token);

        const response = await axios.get(
          `http://localhost:8098/users/profile/${userId}`
        );
        const { profile } = response.data;
        setUser(profile);
        setUsername(profile.username);
        setEmail(profile.email);
        setExistingProfilePic(profile.profilePic);
      } catch (error) {
        console.error("Error fetching user:", error);
      }

    };

    fetchUser();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }
      const userId = getUserIdFromToken(token);
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (profilePic) {
        formData.append("image", profilePic);
      }
      const response = await axios.put(
        `http://localhost:8098/users/profile/update/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser(response.data);
      if (!profilePic) {
        setExistingProfilePic(response.data.profilePic);
      }
      toast.success('Profile Leveled Up!', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: 'Rubik' }
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-purple-500">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-white text-center z-10 relative">
              Player Profile
            </h2>
            <FaGamepad className="text-6xl text-white opacity-20 absolute top-2 left-2 animate-pulse" />
            <FaTrophy className="text-6xl text-white opacity-20 absolute bottom-2 right-2 animate-bounce" />
          </div>
          <div className="p-6 relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Avatar
                    isBordered
                    color="secondary"
                    src={profilePic ? URL.createObjectURL(profilePic) : existingProfilePic}
                    className="w-32 h-32 text-large border-4 border-purple-500"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 animate-ping">
                    <FaUserNinja className="text-gray-900" />
                  </div>
                </div>
              </div>
              {user ? (
                <form onSubmit={handleUpdate} encType="multipart/form-data">
                  <div className="space-y-4">
                    <Input
                      label="User name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
                      size="lg"
                      bordered
                      color="secondary"
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      size="lg"
                      bordered
                      color="secondary"
                    />
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-purple-400 animate-bounce"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-purple-300">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-purple-300">PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    >
                      Level Up Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes gridMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          animation: gridMove 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Profile;
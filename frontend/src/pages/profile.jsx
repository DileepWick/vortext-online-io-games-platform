import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Avatar } from "@nextui-org/react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { toast, Flip } from 'react-toastify';
import Header from "../components/header";
import Footer from "../components/footer";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import { FaGamepad, FaTrophy, FaUserNinja } from 'react-icons/fa';
import { TracingBeam } from "../components/ui/TracingBeam";
import { BackgroundBeams } from "../components/ui/BackgroundBeams";
import { BackgroundGradient } from "../components/ui/BackgroundGradient";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [existingProfilePic, setExistingProfilePic] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // New state for current password
  const [newPassword, setNewPassword] = useState("");         // New state for new password
  const [showChangePassword, setShowChangePassword] = useState(false); // Show change password section
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
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
        setFirstname(profile.firstname);
        setLastname(profile.lastname);
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
      formData.append("firstname", firstname);
      formData.append("lastname", lastname);
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

      toast.success('Profile Leveled Up!', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: 'Rubik' }
      });

      window.location.reload();

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      toast.error("New password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }
      const userId = getUserIdFromToken(token);

      const response = await axios.put(
        `http://localhost:8098/users/profile/change-password/${userId}`,
        { currentPassword, newPassword },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Password changed successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: 'Rubik' }
      });

      // Clear the fields
      setCurrentPassword("");
      setNewPassword("");
      setShowChangePassword(false);

    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please check your current password.");
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }
      const userId = getUserIdFromToken(token);
  
      await axios.delete(
        `http://localhost:8098/users/delete/${userId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      toast.success('Account deleted successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: 'Rubik' }
      });
  
      localStorage.removeItem('token');
      navigate("/");
  
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };
  
  
  

  return (
    <div className="bg-[#0a0b14] min-h-screen text-white">
      <Header />
      
      <div className="rounded-[5px] container mx-auto px-4 py-8 w-[700px]">
      <BackgroundGradient className="rounded-[5px]  bg-zinc-900 transition-transform duration-300 transform hover:scale-10">
        <div className="max-w-2xl mx-auto bg-[#13141f] rounded-[10px] shadow-lg overflow-hidden border-2 border-[#6366f1]">
        
          <div className="bg-gradient-to-r from-[#3730a3] to-[#6366f1] p-6 relative overflow-hidden">
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
                    className="w-32 h-32 text-large border-4 border-[#6366f1]"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#6366f1] rounded-full p-2 animate-ping">
                    <FaUserNinja className="text-[#13141f]" />
                  </div>
                </div>
              </div>
              {user ? (
                <form onSubmit={handleUpdate} encType="multipart/form-data">
                  <div className="space-y-4">
                    <Input
                      label="First Name"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      fullWidth
                      size="lg"
                      bordered
                      color="secondary"
                      style={{ backgroundColor: '#1c1d2b', color: '#060c2c' }}
                    />
                    <Input
                      label="Last Name"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      fullWidth
                      size="lg"
                      bordered
                      color="secondary"
                      style={{ backgroundColor: '#1c1d2b', color: '#060c2c' }}
                    />
                    <Input
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
                      size="lg"
                      bordered
                      color="secondary"
                      style={{ backgroundColor: '#1c1d2b', color: '#060c2c' }}
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
                      style={{ backgroundColor: '#1c1d2b', color: '#060c2c' }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="w-full bg-[#4f46e5] text-white py-3 rounded-md hover:bg-[#4338ca] transition duration-300"
                    >
                      {showChangePassword ? "Cancel Change Password" : "Change Password"}
                    </button>

                    {showChangePassword && (
                      <div className="space-y-4 mt-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          fullWidth
                          size="lg"
                          bordered
                          color="secondary"
                          className="bg-[#1c1d2b] text-white"
                        />
                        <Input
                          label="New Password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          fullWidth
                          size="lg"
                          bordered
                          color="secondary"
                          className="bg-[#1c1d2b] text-white"
                        />
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          className="w-full bg-gradient-to-r from-[#3730a3] to-[#6366f1] text-white py-3 px-4 rounded-md hover:from-[#312e81] hover:to-[#4f46e5] transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-50"
                        >
                          Update Password
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#6366f1] border-dashed rounded-lg cursor-pointer bg-[#1c1d2b] hover:bg-[#2e3149] transition-all duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-[#6366f1] animate-bounce"
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
                          <p className="mb-2 text-sm text-[#a5b4fc]">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-[#a5b4fc]">PNG, JPG or GIF (MAX. 800x400px)</p>
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
                      className="w-full bg-gradient-to-r from-[#3730a3] to-[#6366f1] text-white py-3 px-4 rounded-md hover:from-[#312e81] hover:to-[#4f46e5] transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-50"
                    >
                      Level Up Profile
                    </button>
                  </div>
                  <Button
        onClick={() => setDeleteModalOpen(true)} // Open delete modal
        style={{ backgroundColor: '#e63946', color: '#fff' }} // Red delete button
        auto
        bordered
        fullWidth
        className="w-full mt-4"
      >
        Delete Account
      </Button>{/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="text-black">
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalBody>
            Are you sure you want to delete your account? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
          <Button
        style={{ backgroundColor: '#6366f1', color: '#fff' }} // Blue cancel button
        flat
        onClick={() => setDeleteModalOpen(false)} // Close modal
      >
        Cancel
      </Button>
      <Button
        style={{ backgroundColor: '#e63946', color: '#fff' }} // Red confirm button
        onClick={handleDeleteAccount}
      >
        Confirm
      </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



                </form>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#6366f1]"></div>
                </div>
              )}
            </div>
          </div>
          
        </div>
        </BackgroundGradient>
        <BackgroundBeams/>
        
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
      <Footer />
    </div>
  );
};

export default Profile;
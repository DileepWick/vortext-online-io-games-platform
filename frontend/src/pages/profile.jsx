import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Next UI
import { Input, Avatar } from "@nextui-org/react";

//Toast
import { toast ,Flip} from 'react-toastify';

// Components
import Header from "../components/header";

// Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";

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
          // If token doesn't exist, redirect to login page
          navigate("/login");
          return;
        }

        // Decode The Id
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

  //Handle user profile update
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const userId = getUserIdFromToken(token);

      // Create a new FormData instance
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
      
      // Update existingProfilePic only if profilePic is not updated
      if (!profilePic) {
        setExistingProfilePic(response.data.profilePic);
      }
      
      toast.success('Profile Updated Successfully!', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style:{fontFamily:'Rubik'}
        });


      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 flex justify-center items-center font-primaryRegular">
        <div className="bg-white p-8 shadow-md rounded-md w-96">
          <h2 className="text-2xl font-semibold mb-6 text-center">Profile</h2>
          <Avatar
            isBordered
            color="default"
            src={profilePic ? URL.createObjectURL(profilePic) : existingProfilePic}
            className="w-80 h-80"
          />
          {user ? (
            <form onSubmit={handleUpdate} encType="multipart/form-data">
              <div className="mb-4">
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-4"
                />
              </div>

              <div className="mb-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Update Profile
              </button>
            </form>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

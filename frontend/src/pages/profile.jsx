import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Input, 
  Button, 
  Avatar, 
  Card, 
  CardHeader, 
  CardBody, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Divider
} from "@nextui-org/react";
import { toast, Flip } from 'react-toastify';
import Header from "../components/header";
import Footer from "../components/footer";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import { User, Lock, Upload, Trash2 } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [existingProfilePic, setExistingProfilePic] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();
  
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const handleUpdate = async () => {
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

  const handleChangePassword = async () => {
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
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Mobile-responsive container with proper padding */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="bg-white text-black">
          <CardHeader className="flex flex-col gap-3 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-xl sm:text-2xl font-bold font-primaryRegular">Profile Settings</h1>
            </div>
            <Divider className="bg-gray-300" />
          </CardHeader>
          
          <CardBody className="gap-4 sm:gap-6 px-4 sm:px-6">
            {user ? (
              <>
                {/* Profile Picture Section - Mobile optimized */}
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <Avatar
                    src={profilePic ? URL.createObjectURL(profilePic) : existingProfilePic}
                    className="w-24 h-24 sm:w-32 sm:h-32 text-large border-4 border-gray-300"
                  />
                  
                  <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="profile-pic-input"
                    />
                    <Button
                      variant="bordered"
                      startContent={<Upload className="w-4 h-4" />}
                      onPress={() => document.getElementById('profile-pic-input').click()}
                      className="border-gray-300 text-black hover:bg-gray-50 font-primaryRegular text-sm sm:text-base w-full"
                    >
                      Update Profile Picture
                    </Button>
                  </div>
                </div>

                <Divider className="bg-gray-300" />

                {/* Profile Form - Mobile responsive grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Input
                      label="First Name"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      variant="bordered"
                      className="text-black"
                      size="sm"
                    />
                    <Input
                      label="Last Name"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      variant="bordered"
                      className="text-black"
                      size="sm"
                    />
                  </div>
                  
                  <Input
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    variant="bordered"
                    className="text-black"
                    size="sm"
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="bordered"
                    className="text-black"
                    size="sm"
                  />

                  <Button
                    onPress={handleUpdate}
                    className="w-full bg-black text-white hover:bg-gray-800 font-primaryRegular text-sm sm:text-base py-2 sm:py-3"
                    size="lg"
                  >
                    Update Profile
                  </Button>
                </div>

                <Divider className="bg-gray-300" />

                {/* Password Section - Mobile optimized */}
                <div className="space-y-3">
                  <Button
                    variant="bordered"
                    startContent={<Lock className="w-4 h-4" />}
                    onPress={() => setShowChangePassword(!showChangePassword)}
                    className="w-full bg-black text-white hover:bg-gray-800 font-primaryRegular text-sm sm:text-base py-2 sm:py-3"
                    size="lg"
                  >
                    {showChangePassword ? "Cancel Password Change" : "Change Password"}
                  </Button>

                  {showChangePassword && (
                    <Card className="bg-gray-50 border border-gray-200">
                      <CardBody className="gap-3 p-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          variant="bordered"
                          className="text-black"
                          size="sm"
                        />
                        <Input
                          label="New Password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          variant="bordered"
                          className="text-black"
                          size="sm"
                        />
                        <Button
                          onPress={handleChangePassword}
                          className="w-full bg-black text-white hover:bg-gray-800 font-primaryRegular text-sm sm:text-base py-2"
                          size="md"
                        >
                          Update Password
                        </Button>
                      </CardBody>
                    </Card>
                  )}
                </div>

                <Divider className="bg-gray-300" />

                {/* Danger Zone - Mobile optimized */}
                <div className="space-y-2">
                  <Button
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={onOpen}
                    className="w-full bg-red-600 text-white hover:bg-red-700 font-primaryRegular text-sm sm:text-base py-2 sm:py-3"
                    size="lg"
                  >
                    Delete Account
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-black text-base sm:text-lg">Loading Profile...</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Delete Confirmation Modal - Mobile responsive */}
        <Modal 
          isOpen={isOpen} 
          onClose={onClose}
          size="sm"
          placement="center"
          className="mx-4"
        >
          <ModalContent>
            <ModalHeader className="pb-2">
              <h3 className="text-lg font-semibold text-black">Delete Account</h3>
            </ModalHeader>
            <ModalBody className="py-4">
              <p className="text-black text-sm sm:text-base">
                Are you sure you want to delete your account ? This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter className="pt-2 gap-2">
              <Button
                variant="light"
                onPress={onClose}
                className="text-black flex-1 sm:flex-none"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleDeleteAccount}
                className="flex-1 sm:flex-none"
                size="sm"
              >
                Delete Account
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
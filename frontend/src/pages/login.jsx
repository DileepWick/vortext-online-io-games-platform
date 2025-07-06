import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Flip } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

// Next UI
import {
  Tooltip,
  Input,
  Button,
  Tabs,
  Tab,
  Link,
  Card,
  CardBody,
} from "@nextui-org/react";

// Components
import Header from "../components/header";
import Footer from "../components/footer";

// Utils
import { getUserRoleFromToken } from "../utils/user_role_decoder"; // Role decoder

const Login = () => {
  const [selectedTab, setSelectedTab] = useState("login");
  const [selectedRole, setSelectedRole] = useState("User"); // New state for role selection
  const [portfolioLink, setPortfolioLinks] = useState(""); // Initialize with one empty input
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  //Check the user is developer or not
  //if user is a developer check account status
  //if account status is approved then navigate to developer dashboard
  //if account status is pending then navigate to developer login page

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    email: "",
    birthday: "",
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Filter out non-letter characters for firstname and lastname
  const filterLettersOnly = (value) => value.replace(/[^a-zA-Z]/g, "");

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        name === "firstname" || name === "lastname"
          ? filterLettersOnly(value)
          : value,
    }));
  };

  // Add input fields for developer portfolio links
  // Handle portfolio link input change and enforce www.linkedin.com/ format
  const handlePortfolioLinkChange = (e) => {
    let value = e.target.value;

    // Automatically add "www.linkedin.com/" if it doesn't start with it
    if (!value.startsWith("www.linkedin.com/")) {
      value = "www.linkedin.com/";
    }

    setPortfolioLinks(value); // Set the modified value
  };

  // Handle login submission
  const handleLogin = async () => {
    try {
      const { username, password } = formData;
      const response = await axios.post("http://localhost:8098/users/login", {
        username,
        password,
      });

      const token = response.data.token;

      if (token) {
        Cookies.set("token", token, { expires: 1 });

        const params = new URLSearchParams(location.search);
        const redirectTo = params.get("redirect");

        const userRole = getUserRoleFromToken(token);

        navigate(
          userRole === "admin"
            ? "/"
            : redirectTo
            ? decodeURIComponent(redirectTo)
            : "/"
        );
      } else {
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.warning(error.response.data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } finally {
      // Clear password field after attempt
      setFormData({ ...formData, password: "" });
    }
  };

  // Handle sign-up submission
  const handleSignUp = async () => {
    try {
      const { firstname, lastname, username, email, password, birthday } =
        formData;

      // Calculate age
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Determine player category
      const playerCategory =
        age <= 12 ? "Kid" : age <= 18 ? "Teenager" : "Adult";

      const data = {
        firstname,
        lastname,
        username,
        email,
        password,
        birthday,
        age,
        playerCategory,
        role: selectedRole,
        portfolioLink: selectedRole === "Developer" ? portfolioLink : undefined,
      };

      // Add developer-specific fields if selectedRole is Developer
      if (selectedRole === "Developer") {
        data.portfolioLink = portfolioLink; // Single portfolio link
      }

      // Make the signup API request
      const response = await axios.post(
        "http://localhost:8098/users/register",
        data
      );

      if (response.data.message) {
        setAlertMessage("Registration successful! Please log in.");
        setSelectedTab("login"); // Switch to login tab
        // Optionally, clear the form data
        setFormData({
          firstname: "",
          lastname: "",
          username: "",
          password: "",
          email: "",
          birthday: "",
        });
        setPortfolioLinks(""); // Reset portfolio links

        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } else {
        toast.success("User Account created successfully !", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.warning(error.response.data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    }
  };

  // Get today's date and calculate the max date for the birthday input
  const today = new Date();
  const maxDate = new Date(today.setFullYear(today.getFullYear() - 5))
    .toISOString()
    .split("T")[0];

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputClassName = "max-w-full text-sm";
  return (
    <div>
      <Header />
      <div className="min-h-screen flex">
        {/* Left side - Image */}
        <div
          className="hidden lg:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://cdn.dribbble.com/users/1646023/screenshots/6625629/gamer_800x600.gif)",
          }}
        >
          {/* Replace the placeholder URL with your actual image URL */}
        </div>

        {/* Right side - Login/Signup form */}
        <div className="font-primaryRegular w-full lg:w-1/2 bg-gradient-to-r from-[#060c2c] to-[#7F60D9] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardBody className="overflow-hidden p-3">
              <h1 className="text-xl font-bold text-center mb-3">
                Welcome to Vortex Gaming
              </h1>
              <Tabs
                fullWidth
                size="md"
                aria-label="Login/Signup Tabs"
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
                className="mb-2"
              >
                <Tab key="login" title="Login">
                  <form className="space-y-3">
                    <Input
                      isRequired
                      label="Username"
                      placeholder="Enter your username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="max-w-full"
                    />
                    <Input
                      isRequired
                      label="Password"
                      placeholder="Enter your password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="max-w-full"
                    />
                    <p className="text-center text-sm">
                      Need to create an account?{" "}
                      <Link size="sm" onPress={() => setSelectedTab("sign-up")}>
                        Sign up
                      </Link>
                    </p>
                    <Button
                      fullWidth
                      color="primary"
                      onClick={handleLogin}
                      className="font-primaryRegular w-full bg-gradient-to-r from-[#060c2c] to-[#6366f1] text-white py-3 px-4 rounded-md hover:from-[#312e81] hover:to-[#4f46e5] transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-50"
                    >
                      Login
                    </Button>
                  </form>
                </Tab>
                <Tab key="sign-up" title="Sign up">
                  <Tabs
                    fullWidth
                    size="md"
                    aria-label="Signup Tabs"
                    selectedKey={selectedRole}
                    onSelectionChange={setSelectedRole}
                    className="mb-1"
                  >
                    <Tab key="user" title="User">
                      <form className="space-y-3">
                        <div className="flex space-x-2">
                          <Tooltip
                            content={
                              <span style={{ color: "black" }}>
                                Firstname must contain only letters
                              </span>
                            }
                            placement="bottom"
                          >
                            <Input
                              isRequired
                              label="First Name"
                              placeholder="Enter your first name"
                              name="firstname"
                              value={formData.firstname}
                              onChange={handleInputChange}
                              color={
                                validationErrors.firstname ? "error" : "default"
                              }
                              className="max-w-full  flex-1"
                            />
                          </Tooltip>
                          <Tooltip
                            content={
                              <span style={{ color: "black" }}>
                                Lastname must contain only letters
                              </span>
                            }
                            placement="bottom"
                          >
                            <Input
                              isRequired
                              label="Last Name"
                              placeholder="Enter your last name"
                              name="lastname"
                              value={formData.lastname}
                              onChange={handleInputChange}
                              color={
                                validationErrors.lastname ? "error" : "default"
                              }
                              className="max-w-full  flex-1"
                            />
                          </Tooltip>
                        </div>
                        <Input
                          isRequired
                          label="Username"
                          placeholder="Choose a username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="max-w-full "
                        />
                        <Tooltip
                          content={
                            <span style={{ color: "black" }}>
                              {validationErrors.email}
                            </span>
                          }
                          isOpen={!!validationErrors.email}
                          color="error"
                        >
                          <Input
                            isRequired
                            label="Email"
                            placeholder="Enter your email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            color={validationErrors.email ? "error" : "default"}
                            className="max-w-full "
                          />
                        </Tooltip>
                        <Input
                          isRequired
                          label="Birthday"
                          placeholder="Enter your birthday"
                          name="birthday"
                          type="date"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          max={maxDate}
                          className="max-w-full "
                        />
                        <Tooltip
                          content={
                            <span style={{ color: "black" }}>
                              {validationErrors.password}
                            </span>
                          }
                          isOpen={!!validationErrors.password}
                          color="error"
                        >
                          <Input
                            isRequired
                            label="Password"
                            placeholder="Create a password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            color={
                              validationErrors.password ? "error" : "default"
                            }
                            className="max-w-full "
                          />
                        </Tooltip>
                        <Button
                          fullWidth
                          color="primary"
                          onClick={handleSignUp}
                          className="font-primaryRegular w-full bg-gradient-to-r from-[#060c2c] to-[#6366f1] text-white py-3 px-4 rounded-md hover:from-[#312e81] hover:to-[#4f46e5] transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-50"
                        >
                          Sign up as User
                        </Button>
                      </form>
                    </Tab>
                    <Tab key="developer" title="Developer">
                      <form className="space-y-3">
                        <div className="flex space-x-2">
                          <Tooltip
                            content={
                              <span style={{ color: "black" }}>
                                Firstname must contain only letters
                              </span>
                            }
                            placement="bottom"
                          >
                            <Input
                              isRequired
                              label="First Name"
                              placeholder="Enter your first name"
                              name="firstname"
                              value={formData.firstname}
                              onChange={handleInputChange}
                              color={
                                validationErrors.firstname ? "error" : "default"
                              }
                              className="max-w-full text-sm flex-1"
                              size="sm"
                            />
                          </Tooltip>
                          <Tooltip
                            content={
                              <span style={{ color: "black" }}>
                                Lastname must contain only letters
                              </span>
                            }
                            placement="bottom"
                          >
                            <Input
                              isRequired
                              label="Last Name"
                              placeholder="Enter your last name"
                              name="lastname"
                              value={formData.lastname}
                              onChange={handleInputChange}
                              color={
                                validationErrors.lastname ? "error" : "default"
                              }
                              className="max-w-full text-sm flex-1"
                              size="sm"
                            />
                          </Tooltip>
                        </div>
                        <Input
                          isRequired
                          label="Username"
                          placeholder="Choose a username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="max-w-full "
                        />
                        <Tooltip
                          content={
                            <span style={{ color: "black" }}>
                              {validationErrors.email}
                            </span>
                          }
                          isOpen={!!validationErrors.email}
                          color="error"
                        >
                          <Input
                            isRequired
                            label="Email"
                            placeholder="Enter your email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            color={validationErrors.email ? "error" : "default"}
                            className="max-w-full "
                          />
                        </Tooltip>
                        <Input
                          isRequired
                          label="Birthday"
                          placeholder="Enter your birthday"
                          name="birthday"
                          type="date"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          max={maxDate}
                          className="max-w-full "
                        />
                        <Tooltip
                          content={
                            <span style={{ color: "black" }}>
                              {validationErrors.password}
                            </span>
                          }
                          isOpen={!!validationErrors.password}
                          color="error"
                        >
                          <Input
                            isRequired
                            label="Password"
                            placeholder="Create a password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            color={
                              validationErrors.password ? "error" : "default"
                            }
                            className="max-w-full "
                          />
                        </Tooltip>
                        <Tooltip
                          content={
                            <span style={{ color: "black" }}>
                              LinkedIn link should start with www.linkedin.com/
                            </span>
                          }
                          placement="bottom"
                        >
                          <Input
                            label="LinkedIn Link"
                            placeholder="Enter your LinkedIn URL (www.linkedin.com/)"
                            value={portfolioLink}
                            onChange={handlePortfolioLinkChange}
                            className="max-w-full "
                          />
                        </Tooltip>
                        <Button
                          fullWidth
                          color="secondary"
                          onClick={handleSignUp}
                          className="font-primaryRegular w-full bg-gradient-to-r from-[#6366f1] to-[#060c2c] text-white py-3 px-4 rounded-md hover:from-[#312e81] hover:to-[#4f46e5] transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-50"
                        >
                          Sign up as Developer
                        </Button>
                      </form>
                    </Tab>
                  </Tabs>
                </Tab>
              </Tabs>
              {alertMessage && (
                <div className="mt-3 text-center text-red-500 text-sm">
                  {alertMessage}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;

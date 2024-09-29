import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

// Next UI
import { Input, Button, Tabs, Tab, Link, Card, CardBody } from "@nextui-org/react";

// Components
import Header from "../components/header";
import Footer from "../components/footer";

// Utils
import { getUserRoleFromToken } from "../utils/user_role_decoder"; // Role decoder

const DeveloperLogin = () => {
  const [selectedTab, setSelectedTab] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    portfolioLinks: "",
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Filter out non-letter characters for firstName and lastName
  const filterLettersOnly = (value) => value.replace(/[^a-zA-Z]/g, "");

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "firstName" || name === "lastName"
        ? filterLettersOnly(value)
        : value,
    }));
  };

  // Validation functions
  const validateFirstName = (firstName) => /^[a-zA-Z]+$/.test(firstName);
  const validateLastName = (lastName) => /^[a-zA-Z]+$/.test(lastName);
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const validateForm = () => {
    const errors = {};

    if (!validateFirstName(formData.firstName)) {
      errors.firstName = "First name must contain only letters.";
    }
    if (!validateLastName(formData.lastName)) {
      errors.lastName = "Last name must contain only letters.";
    }
    if (!validateEmail(formData.email)) {
      errors.email = "Invalid email format.";
    }
    if (!validatePassword(formData.password)) {
      errors.password =
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle login submission
  const handleLogin = async () => {
    try {
      const { username, password } = formData;
      const response = await axios.post("http://localhost:8098/developers/login", {
        username,
        password,
      });
  
      const token = response.data.token;
  
      if (token) {
        console.log("Login successful, token received");
        Cookies.set("token", token, { expires: 1 });
  
        // Decode the token to get user information
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);
  
        // Check if the user is a developer
        if (decodedToken.role === "Developer") {
          console.log("User is a developer, navigating to game developer dashboard");
          navigate("/gamedeveloperdashboard");
        } else {
          console.log("User is not a developer, role:", decodedToken.role);
          // You can add different navigation logic here based on other roles if needed
          navigate("/");
        }
      } else {
        console.log("No token received in response");
        setAlertMessage(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertMessage("Login failed. Please check your credentials and try again.");
    } finally {
      setFormData({ ...formData, password: "" });
    }
  };
  // Handle sign-up submission
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const { firstName, lastName, username, email, password, portfolioLinks } = formData;

      const response = await axios.post("http://localhost:8098/developers/register", {
        firstName,
        lastName,
        username,
        email,
        password,
        portfolioLinks: portfolioLinks.split(',').map(link => link.trim()),
      });

      if (response.data.success) {
        setAlertMessage("Registration successful! Please log in.");
        setSelectedTab("login");
      } else {
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAlertMessage("Registration failed");
    }
  };

  return (
    <div>
      
      <div className="flex items-center justify-center min-h-screen bg-gray-20">
        <Card className="w-[340px] h-[650px]">
          <CardBody className="overflow-hidden">
            <Tabs
              fullWidth
              size="lg"
              aria-label="Tabs form"
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
            >
              <Tab key="login" title="Developer Login">
                <form className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Username"
                    placeholder="Enter your username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  <Input
                    isRequired
                    label="Password"
                    placeholder="Enter your password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <p className="text-center text-small">
                    Need to create an account?{" "}
                    <Link size="sm" onPress={() => setSelectedTab("sign-up")}>
                      Sign up
                    </Link>
                  </p>
                  {alertMessage && (
                    <div className="mt-4 text-center text-red-500">
                      {alertMessage}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button fullWidth color="primary" onClick={handleLogin}>
                      Login
                    </Button>
                  </div>
                </form>
              </Tab>
              <Tab key="sign-up" title="Developer Sign up">
                <form className="flex flex-col gap-4 h-[400px]">
                  <Input
                    isRequired
                    label="First Name"
                    placeholder="Enter your first name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    color={validationErrors.firstName ? "error" : "default"}
                  />
                  {validationErrors.firstName && (
                    <div className="text-red-500">{validationErrors.firstName}</div>
                  )}
                  <Input
                    isRequired
                    label="Last Name"
                    placeholder="Enter your last name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    color={validationErrors.lastName ? "error" : "default"}
                  />
                  {validationErrors.lastName && (
                    <div className="text-red-500">{validationErrors.lastName}</div>
                  )}
                  <Input
                    isRequired
                    label="Username"
                    placeholder="Enter your username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  <Input
                    isRequired
                    label="Email"
                    placeholder="Enter your email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    color={validationErrors.email ? "error" : "default"}
                  />
                  {validationErrors.email && (
                    <div className="text-red-500">{validationErrors.email}</div>
                  )}
                  <Input
                    isRequired
                    label="Password"
                    placeholder="Enter your password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    color={validationErrors.password ? "error" : "default"}
                  />
                  {validationErrors.password && (
                    <div className="text-red-500">{validationErrors.password}</div>
                  )}
                  <Input
                    label="Portfolio Links"
                    placeholder="Enter portfolio links (comma separated)"
                    name="portfolioLinks"
                    type="text"
                    value={formData.portfolioLinks}
                    onChange={handleInputChange}
                  />
                  <p className="text-center text-small">
                    Already have an account?{" "}
                    <Link size="sm" onPress={() => setSelectedTab("login")}>
                      Login
                    </Link>
                  </p>
                  {alertMessage && (
                    <div className="mt-4 text-center text-red-500">
                      {alertMessage}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button fullWidth color="primary" onClick={handleSignUp}>
                      Sign up
                    </Button>
                  </div>
                </form>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DeveloperLogin;
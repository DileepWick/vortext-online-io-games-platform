import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Flip } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

// Next UI
import {
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
  // Validation functions
  const validateFirstname = (firstname) => /^[a-zA-Z]+$/.test(firstname);
  const validateLastname = (lastname) => /^[a-zA-Z]+$/.test(lastname);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
    return emailRegex.test(email);
  };
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  const validateForm = () => {
    const errors = {};

    if (!validateFirstname(formData.firstname)) {
      errors.firstname = "Firstname must contain only letters.";
    }
    if (!validateLastname(formData.lastname)) {
      errors.lastname = "Lastname must contain only letters.";
    }
    if (!validateEmail(formData.email)) {
      errors.email = "Invalid email format.";
    }
    if (!validateEmail(formData.email)) {
      errors.email =
        "Invalid email format. Email must contain '@' and end with '.com'.";
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
    if (!validateForm()) {
      return; // Prevent signup if validation fails
    }

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
      setAlertMessage("Registration failed. Please try again.");
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

  return (
    <div><Header/>
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
      <div className="w-full lg:w-1/2 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardBody className="overflow-hidden">
            <h1 className="text-2xl font-bold text-center mb-6">
              Welcome to Vortex Gaming
            </h1>
            <Tabs
              fullWidth
              size="lg"
              aria-label="Login/Signup Tabs"
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
              className="mb-4"
            >
              <Tab key="login" title="Login">
                <form className="space-y-4">
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
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
                  className="mb-4"
                >
                  <Tab key="user" title="User">
                    <form className="space-y-3">
                      <Input
                        isRequired
                        label="First Name"
                        placeholder="Enter your first name"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        color={validationErrors.firstname ? "error" : "default"}
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Last Name"
                        placeholder="Enter your last name"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        color={validationErrors.lastname ? "error" : "default"}
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Username"
                        placeholder="Choose a username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="max-w-full"
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
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Birthday"
                        placeholder="Enter your birthday"
                        name="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        max={maxDate}
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Password"
                        placeholder="Create a password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        color={validationErrors.password ? "error" : "default"}
                        className="max-w-full"
                      />
                      <Button
                        fullWidth
                        color="primary"
                        onClick={handleSignUp}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        Sign up as User
                      </Button>
                    </form>
                  </Tab>
                  <Tab key="developer" title="Developer">
                    <form className="space-y-3">
                      <Input
                        isRequired
                        label="First Name"
                        placeholder="Enter your first name"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        color={validationErrors.firstname ? "error" : "default"}
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Last Name"
                        placeholder="Enter your last name"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        color={validationErrors.lastname ? "error" : "default"}
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Username"
                        placeholder="Choose a username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="max-w-full"
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
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Birthday"
                        placeholder="Enter your birthday"
                        name="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        max={maxDate}
                        className="max-w-full"
                      />
                      <Input
                        isRequired
                        label="Password"
                        placeholder="Create a password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        color={validationErrors.password ? "error" : "default"}
                        className="max-w-full"
                      />
                      <Input
  label="LinkedIn Link"
  placeholder="Enter your LinkedIn URL (www.linkedin.com/)"
  value={portfolioLink}
  onChange={handlePortfolioLinkChange}
  className="max-w-full"
/>
                      <Button
                        fullWidth
                        color="secondary"
                        onClick={handleSignUp}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Sign up as Developer
                      </Button>
                    </form>
                  </Tab>
                </Tabs>
              </Tab>
            </Tabs>
            {alertMessage && (
              <div className="mt-4 text-center text-red-500">
                {alertMessage}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
    <Footer/>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";


// Next UI
import { Input, Button, Tabs, Tab, Link, Card, CardBody } from "@nextui-org/react";

// Components
import Header from "../components/header";
import Footer from "../components/footer";

// Utils
import { getUserRoleFromToken } from "../utils/user_role_decoder"; // Role decoder

const Login = () => {
  const [selectedTab, setSelectedTab] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();

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
      [name]: name === "firstname" || name === "lastname"
        ? filterLettersOnly(value)
        : value,
    }));
  };

  // Validation functions
  const validateFirstname = (firstname) => /^[a-zA-Z]+$/.test(firstname);
  const validateLastname = (lastname) => /^[a-zA-Z]+$/.test(lastname);
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

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

        navigate(userRole === "admin" ? "/" : redirectTo ? decodeURIComponent(redirectTo) : "/");
      } else {
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertMessage("Login failed");
    } finally {
      // Clear password field after attempt
      setFormData({ ...formData, password: "" });
    }
  };

  // Handle sign-up submission
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const { firstname, lastname, username, email, password, birthday } = formData;

      // Calculate age
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Determine player category
      const playerCategory = age <= 12 ? "Kid" : age <= 18 ? "Teenager" : "Adult";

      const response = await axios.post("http://localhost:8098/users/register", {
        firstname,
        lastname,
        username,
        email,
        password,
        birthday,
        age,
        playerCategory,
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

  // Get today's date and calculate the max date for the birthday input
  const today = new Date();
  const maxDate = new Date(today.setFullYear(today.getFullYear() - 5)).toISOString().split('T')[0];

  return (
    <div>
      <Header />
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
              <Tab key="login" title="Login">
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
              <Tab key="sign-up" title="Sign up">
                <form className="flex flex-col gap-4 h-[400px]">
                  <Input
                    isRequired
                    label="Firstname"
                    placeholder="Enter your first name"
                    name="firstname"
                    type="text"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    color={validationErrors.firstname ? "error" : "default"}
                  />
                  {validationErrors.firstname && (
                    <div className="text-red-500">{validationErrors.firstname}</div>
                  )}
                  <Input
                    isRequired
                    label="Lastname"
                    placeholder="Enter your lastname"
                    name="lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    color={validationErrors.lastname ? "error" : "default"}
                  />
                  {validationErrors.lastname && (
                    <div className="text-red-500">{validationErrors.lastname}</div>
                  )}
                  <Input
                    isRequired
                    label="Username"
                    placeholder="Enter your username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    // Removed validation-related props for username
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
                    label="Birthday"
                    placeholder="Enter your birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    max={maxDate} // Set max date to 5 years before today
                  />
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

export default Login;

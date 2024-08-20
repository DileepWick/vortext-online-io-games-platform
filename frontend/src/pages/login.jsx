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
    username: "",
    password: "",
    email: "",
    birthday: "", // Added birthday to form data
  });

  const [alertMessage, setAlertMessage] = useState("");

  // Handle form data changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    try {
      const { username, email, password, birthday } = formData;

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

  return (
    <div>
      <Header />
      <div className="flex flex-col w-full font-primaryRegular justify-center">
        <Card className="max-w-full w-[340px] h-[450px]">
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
                <form className="flex flex-col gap-4 h-[350px]">
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
                  />
                  <Input
                    isRequired
                    label="Birthday"
                    placeholder="Enter your birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
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

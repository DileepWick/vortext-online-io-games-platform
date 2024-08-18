import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";

//Next UI
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Tabs, Tab, Link, Card, CardBody } from "@nextui-org/react";

//Components
import Header from "../components/header";
import Footer from "../components/footer";

//Utils
import { getUserRoleFromToken } from "../utils/user_role_decoder"; //Role decoder

const Login = () => {
  const [selected, setSelected] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState(""); // New state for birthday
  const [alertMessage, setAlertMessage] = useState("");

  const handleLogin = async () => {
    try {
      const loggedUser = { username, password };
      const response = await axios.post(
        "http://localhost:8098/users/login",
        loggedUser
      );

      const token = response.data.token;

      if (token) {
        Cookies.set("token", token, { expires: 1 });

        const params = new URLSearchParams(location.search);
        const redirectTo = params.get("redirect");

        const userRole = getUserRoleFromToken(token);

        if (userRole === "admin") {
          navigate("/");
        } else {
          navigate(redirectTo ? decodeURIComponent(redirectTo) : "/");
        }
      } else {
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertMessage("Login failed");
      setUsername("");
      setPassword("");
    }
  };

  const handleSignUp = async () => {
    try {
      // Calculate age based on birthday
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Determine player category
      let playerCategory = "";
      if (age <= 12) {
        playerCategory = "Kid";
      } else if (age <= 18) {
        playerCategory = "Teenager";
      } else {
        playerCategory = "Adult";
      }

      const newUser = {
        username,
        email,
        password,
        birthday,
        age,
        playerCategory, // Send player category
      };

      const response = await axios.post(
        "http://localhost:8098/users/register",
        newUser
      );

      if (response.data.success) {
        setAlertMessage("Registration successful! Please log in.");
        setSelected("login");
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
              selectedKey={selected}
              onSelectionChange={setSelected}
            >
              <Tab key="login" title="Login">
                <form className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Username"
                    placeholder="Enter your username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    isRequired
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-center text-small">
                    Need to create an account?{" "}
                    <Link size="sm" onPress={() => setSelected("sign-up")}>
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
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    isRequired
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    isRequired
                    label="Birthday"
                    placeholder="Enter your birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                  <Input
                    isRequired
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  
                  <p className="text-center text-small">
                    Already have an account?{" "}
                    <Link size="sm" onPress={() => setSelected("login")}>
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

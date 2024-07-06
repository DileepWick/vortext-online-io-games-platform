import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";

//Next UI
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Tabs, Tab, Link, Card, CardBody, CardHeader } from "@nextui-org/react";


//Components
import Header from "../components/header";
import Footer from "../components/footer";

//Utils
import { getUserRoleFromToken } from "../utils/user_role_decoder"; //Role decoder

const Login = () => {
  //Next Ui
  const [selected, setSelected] = useState("login");

  const navigate = useNavigate();
  const location = useLocation();

  //Use states for username and password to handle form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //State for alert message
  const [alertMessage, setAlertMessage] = useState("");

  const handleLogin = async () => {
    try {
      //Get the username and password from states
      const loggedUser = { username, password };

      //Call the login backend
      const response = await axios.post(
        "http://localhost:8098/users/login",
        loggedUser
      );

      //Backend will send token related to the logged user
      const token = response.data.token;

      //If token successfully sent
      if (token) {
        // Save token in a cookie
        Cookies.set("token", token, { expires: 1 });

        const params = new URLSearchParams(location.search);
        const redirectTo = params.get("redirect");

        //Get user role from token using user_role_decoder util
        const userRole = getUserRoleFromToken(token);

        //Navigate the user according to role
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

  return (
    <div>
      <Header />
      <div className="flex flex-col w-full font-primaryRegular justify-center">
        <Card className="max-w-full w-[340px] h-[400px]">
          <CardBody className="overflow-hidden">
            <Tabs
              fullWidth
              size="lg"
              aria-label="Tabs form"
              selectedKey={selected}
              onSelectionChange={setSelected}
              
            >
              <Tab key="login" title="Login" >
                <form className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Username"
                    placeholder="Enter your username"
                    type="username"
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
                <form className="flex flex-col gap-4 h-[300px]">
                  <Input
                    isRequired
                    label="Name"
                    placeholder="Enter your name"
                    type="password"
                  />
                  <Input
                    isRequired
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Input
                    isRequired
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                  />
                  <p className="text-center text-small">
                    Already have an account?{" "}
                    <Link size="sm" onPress={() => setSelected("login")}>
                      Login
                    </Link>
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button fullWidth color="primary">
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

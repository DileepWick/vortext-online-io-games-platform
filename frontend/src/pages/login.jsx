import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Flip } from "react-toastify";

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

import { User, Mail, Lock, Calendar, Eye, EyeOff } from "lucide-react";

// Components
import Header from "../components/header";
import Footer from "../components/footer";

// Utils
import { getUserRoleFromToken } from "../utils/user_role_decoder";

const Login = () => {
  const [selectedTab, setSelectedTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      Cookies.set("token", token, { expires: 1 });
      navigate("/");
    }
  }, [location, navigate]);

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

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8098/auth/google";
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
        role: "User",
      };

      const response = await axios.post(
        "http://localhost:8098/users/register",
        data
      );

      if (response.data.message) {
        setAlertMessage("Registration successful! Please log in.");
        setSelectedTab("login");
        setFormData({
          firstname: "",
          lastname: "",
          username: "",
          password: "",
          email: "",
          birthday: "",
        });

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
        toast.success("User Account created successfully!", {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="min-h-screen flex">
        {/* Left side - Image */}
        <div
          className="hidden lg:block w-1/2 bg-cover bg-center "
          style={{
            backgroundImage:
              "url(https://cdn.dribbble.com/users/1646023/screenshots/6625629/gamer_800x600.gif)",
          }}
        >
          <div className="w-full h-full bg-black/20"></div>
        </div>

        {/* Right side - Login/Signup form */}
        <div className="font-primaryRegular w-full lg:w-1/2 bg-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-gray-200 shadow-xl">
            <CardBody className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-black mb-2">
                  Welcome to Vortex Gaming
                </h1>
                <p className="text-gray-600 text-sm">
                  Join the ultimate gaming experience
                </p>
              </div>

              <Tabs
                fullWidth
                size="md"
                aria-label="Login/Signup Tabs"
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
                className="mb-6"
                classNames={{
                  tabList: "bg-gray-100 rounded-lg p-1",
                  tab: "text-gray-600 data-[selected=true]:text-black data-[selected=true]:bg-white",
                  cursor: "bg-white shadow-sm",
                }}
              >
                <Tab key="login" title="Login">
                  <div className="space-y-4">
                    <Input
                      isRequired
                      label="Username"
                      placeholder="Enter your username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="max-w-full"
                      classNames={{
                        input: "bg-white text-black placeholder-gray-400",
                        inputWrapper:
                          "bg-white border-gray-300 hover:border-black focus-within:border-black",
                        label: "text-gray-700",
                      }}
                      startContent={<User className="text-gray-400 w-4 h-4" />}
                    />

                    <Input
                      isRequired
                      label="Password"
                      placeholder="Enter your password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="max-w-full"
                      classNames={{
                        input: "bg-white text-black placeholder-gray-400",
                        inputWrapper:
                          "bg-white border-gray-300 hover:border-black focus-within:border-black",
                        label: "text-gray-700",
                      }}
                      startContent={<Lock className="text-gray-400 w-4 h-4" />}
                      endContent={
                        <button
                          className="focus:outline-none text-gray-400 hover:text-black"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                    />

                    <div className="text-center">
                      <span className="text-gray-400 text-sm">or</span>
                    </div>

                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-gray-50 hover:bg-gray-100 text-black border border-gray-300 py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <p className="text-center text-sm text-gray-600">
                      Need to create an account?{" "}
                      <Link
                        size="sm"
                        onPress={() => setSelectedTab("sign-up")}
                        className="text-black hover:text-gray-700"
                      >
                        Sign up
                      </Link>
                    </p>

                    <Button
                      fullWidth
                      onClick={handleLogin}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      Login
                    </Button>
                  </div>
                </Tab>

                <Tab key="sign-up" title="Sign up">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Tooltip
                        content={
                          <span className="text-black">
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
                            validationErrors.firstname ? "danger" : "default"
                          }
                          className="max-w-full flex-1"
                          classNames={{
                            input: "bg-white text-black placeholder-gray-400",
                            inputWrapper:
                              "bg-white border-gray-300 hover:border-black focus-within:border-black",
                            label: "text-gray-700",
                          }}
                          startContent={
                            <User className="text-gray-400 w-4 h-4" />
                          }
                        />
                      </Tooltip>
                      <Tooltip
                        content={
                          <span className="text-black">
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
                            validationErrors.lastname ? "danger" : "default"
                          }
                          className="max-w-full flex-1"
                          classNames={{
                            input: "bg-white text-black placeholder-gray-400",
                            inputWrapper:
                              "bg-white border-gray-300 hover:border-black focus-within:border-black",
                            label: "text-gray-700",
                          }}
                          startContent={
                            <User className="text-gray-400 w-4 h-4" />
                          }
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
                      className="max-w-full"
                      classNames={{
                        input: "bg-white text-black placeholder-gray-400",
                        inputWrapper:
                          "bg-white border-gray-300 hover:border-black focus-within:border-black",
                        label: "text-gray-700",
                      }}
                      startContent={<User className="text-gray-400 w-4 h-4" />}
                    />

                    <Tooltip
                      content={
                        <span className="text-black">
                          {validationErrors.email}
                        </span>
                      }
                      isOpen={!!validationErrors.email}
                      color="danger"
                    >
                      <Input
                        isRequired
                        label="Email"
                        placeholder="Enter your email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        color={validationErrors.email ? "danger" : "default"}
                        className="max-w-full"
                        classNames={{
                          input: "bg-white text-black placeholder-gray-400",
                          inputWrapper:
                            "bg-white border-gray-300 hover:border-black focus-within:border-black",
                          label: "text-gray-700",
                        }}
                        startContent={
                          <Mail className="text-gray-400 w-4 h-4" />
                        }
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
                      className="max-w-full"
                      classNames={{
                        input: "bg-white text-black placeholder-gray-400",
                        inputWrapper:
                          "bg-white border-gray-300 hover:border-black focus-within:border-black",
                        label: "text-gray-700",
                      }}
                      startContent={
                        <Calendar className="text-gray-400 w-4 h-4" />
                      }
                    />

                    <Tooltip
                      content={
                        <span className="text-black">
                          {validationErrors.password}
                        </span>
                      }
                      isOpen={!!validationErrors.password}
                      color="danger"
                    >
                      <Input
                        isRequired
                        label="Password"
                        placeholder="Create a password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        color={validationErrors.password ? "danger" : "default"}
                        className="max-w-full"
                        classNames={{
                          input: "bg-white text-black placeholder-gray-400",
                          inputWrapper:
                            "bg-white border-gray-300 hover:border-black focus-within:border-black",
                          label: "text-gray-700",
                        }}
                        startContent={
                          <Lock className="text-gray-400 w-4 h-4" />
                        }
                        endContent={
                          <button
                            className="focus:outline-none text-gray-400 hover:text-black"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        }
                      />
                    </Tooltip>

                    <Button
                      fullWidth
                      onClick={handleSignUp}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      Sign up
                    </Button>
                  </div>
                </Tab>
              </Tabs>

              {alertMessage && (
                <div className="mt-4 text-center text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
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

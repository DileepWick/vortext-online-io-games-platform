import Cookies from "js-cookie";

export const Logout = (token) => {
  // Clear token from cookies
  Cookies.remove("token");

  // Redirect to login page or any other page after logout
  navigate("/");
};

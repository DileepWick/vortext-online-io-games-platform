import Cookies from "js-cookie";

export const getToken = (token) => {
  // Inside your component or function
  const loggedUserToken = Cookies.get("token");
  return loggedUserToken;
};

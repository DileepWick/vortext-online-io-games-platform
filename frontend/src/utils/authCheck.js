import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken } from "./getToken";

const useAuthCheck = (direction) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    //Get the token fron local storage
    const token = getToken();

    //If token is not found redirect to login
    if (!token) {
      const currentPath = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${currentPath}`);
    } else if (direction) { //Else give access to the section that user tried to access 
      navigate(direction);
    }
  }, [navigate, location, direction]);
};
export default useAuthCheck;


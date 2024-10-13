import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserRoleFromToken } from "./user_role_decoder";
import { getToken } from "./getToken";
import { jwtDecode } from "jwt-decode";

const useAuthCheck = (requiredRole) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isChecked = useRef(false);

  useEffect(() => {
    if (isChecked.current) return;
    isChecked.current = true;

    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        const currentPath = encodeURIComponent(
          location.pathname + location.search
        );
        navigate(`/login?redirect=${currentPath}`, { replace: true });
        return;
      }

      try {
        let userRole = getUserRoleFromToken(token);

        if (!userRole) {
          const decodedToken = jwtDecode(token);
          userRole = decodedToken.role;
        }

        if (!userRole) {
          throw new Error("Unable to determine user role");
        }

        if (requiredRole && userRole !== requiredRole) {
          navigate("/unauthorized", { replace: true });
        }
        // We're not forcing navigation to any specific route if the role check passes
      } catch (error) {
        console.error("Token decoding failed", error);
        navigate(`/login`, { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location, requiredRole]);
};

export default useAuthCheck;

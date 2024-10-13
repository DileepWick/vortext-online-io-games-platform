import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const usePreventNavigation = (shouldPrevent) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldPrevent) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = (e) => {
      if (shouldPrevent) {
        e.preventDefault();
        if (
          window.confirm(
            "Are you sure you want to leave? Your progress may be lost."
          )
        ) {
          navigate(-1);
        } else {
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push a new state to the history to ensure we can catch the back navigation
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldPrevent, navigate]);
};
export default usePreventNavigation;

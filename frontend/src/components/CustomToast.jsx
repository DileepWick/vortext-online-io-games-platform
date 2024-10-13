// CustomToast.js
import React from "react";
import { toast } from "react-toastify";
import { Flip } from "react-toastify";

// Custom toast component
const CustomToast = ({ message, type }) => {
  const commonOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Flip,
    progressBarClassName: "bg-gray-800",
    style: { fontFamily: "Rubik" },
  };

  // Show the toast based on the type
  switch (type) {
    case "success":
      toast.success(message, commonOptions);
      break;
    case "error":
      toast.error(message, commonOptions);
      break;
    default:
      toast(message, commonOptions);
  }
};

export default CustomToast;

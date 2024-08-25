import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast, Flip } from "react-toastify";
import Hangman from "../components/Games/Hangaman";
import Chatbot from "../components/chatbox";

const Home = () => {
  const notify = () => {
    toast.success("🦄 Wow so easy!", {
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
    });
  };

  const propFunction = () => {
    alert("Hello");
  };

  return (
    <div className="font-primaryRegular bg-white">
      <Header />
      <Footer />
    </div>
  );
};

export default Home;

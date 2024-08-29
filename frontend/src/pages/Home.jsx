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
    <div className="font-primaryRegular bg-customDark flex flex-col min-h-screen">
      <Header />
        <h1 className="text-5xl text-white mt-[100px]">Vortex Gaming Home</h1>
      <Footer />
    </div>
  );
};

export default Home;

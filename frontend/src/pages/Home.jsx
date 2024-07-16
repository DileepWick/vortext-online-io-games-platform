import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast, Flip } from "react-toastify";
import SayMyName from "../components/SayMyName";

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

  const propFunction =()=>{
      alert("Hello");
  }

  return (
    <div className="font-primaryRegular">
      <Header />
      <button onClick={notify}>Notify</button>
      <h1>Home </h1>
      <h1>Dileep Dilshan</h1>
      <h1>NimsaraThhenuka</h1>

      <Footer />
    </div>
  );
};

export default Home;

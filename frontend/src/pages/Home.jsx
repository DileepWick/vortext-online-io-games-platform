import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast, Flip } from "react-toastify";
import GameEmbed from "./GameEmbed";

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

  const questions = [
    { word: 'REACT', hint: 'A JavaScript library for building user interfaces.' },
    { word: 'JAVASCRIPT', hint: 'A programming language commonly used in web development.' },
    { word: 'HANGMAN', hint: 'A word guessing game.' },
    { word: 'DEVELOPER', hint: 'A person who writes computer software.' }
  ];

  return (
    <div className="font-primaryRegular">
      <Header />
      <button onClick={notify}>Notify</button>
      <h1>Home </h1>
      <h1>Dasun Dushmantha</h1>
      <h1>Dileep Dilshan</h1>
      <h1>Dulshan</h1>
      <h1>NimsaraThhenuka</h1>
      <h1>Bandara Ranasinghe</h1>
      <h1>Tharindu Ariyawansha</h1>
      <GameEmbed src={'https://www.modd.io/play/A4T8MHYD4/'} title={'BOPZ'} />

    
       


      <Footer />
    </div>
  );
};

export default Home;

import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast, Flip } from "react-toastify";
import Hangman from "../components/Games/Hangaman";

const Home = () => {
  const questions = [
    {
      question: "A type of fruit",
      answer: "Apple",
      hint: "Keeps the doctor away",
    },
    {
      question: "A programming language",
      answer: "JavaScript",
      hint: "The language of the web",
    },
    { question: "A color", answer: "Yellow", hint: "The color of the sun" },
  ];

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

      <Hangman questions={questions} />

      <Footer />
    </div>
  );
};

export default Home;

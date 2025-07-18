import React, { useState, useEffect, useRef } from "react";
import { Button } from "@nextui-org/react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/getAPI";

// Import your images for each stage
import stage0 from "../../assets/icons/st1.gif";
import stage1 from "../../assets/icons/st2.gif";
import stage2 from "../../assets/icons/st3.gif";
import stage3 from "../../assets/icons/st4.gif";
import stage4 from "../../assets/icons/st5.gif";
import stage5 from "../../assets/icons/st53.gif";
import stage6 from "../../assets/icons/st6.gif";
import happyGirlJumping from "../../assets/icons/win.gif";

// Import your audio files
import winAudio from "../../assets/won.mp3";
import loseAudio from "../../assets/over.mp3";

// Background image
import loadingGif from "../../assets/ghost.gif";

// Import add new edition
import EditionSelector from "./Edition_selector";
import Header from "../header";
import Footer from "../footer";

import useAuthCheck from "../../utils/authCheck";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";

// Default Questions
const defaultQuestions = [
  {
    question: "What is the capital of France?",
    answer: "Paris",
    hint: "City of Light",
  },
  {
    question: "A large mammal known for its trunk.",
    answer: "Elephant",
    hint: "Author's name",
  },
  {
    question: "The main character in the TV series Breaking Bad.",
    answer: "Walter",
    hint: "The bald guy.",
  },
];

const Hangman = () => {
  useAuthCheck();
  //States
  const maxWrongGuesses = 6;
  const [questions, setQuestions] = useState(defaultQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [warning, setWarning] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedEditionId, setSelectedEditionId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [selectedEditionName, setSelectedEditionName] = useState("");
  const currentQuestion = questions[currentQuestionIndex];
  const word = currentQuestion?.answer.toUpperCase() || "";
  const hint = currentQuestion?.hint || "";
  const isGameWon = !word
    .split("")
    .some((letter) => !correctLetters.includes(letter));
  const isGameOver = wrongGuesses >= maxWrongGuesses;
  const remainingChances = maxWrongGuesses - wrongGuesses;
  const winAudioRef = useRef(new Audio(winAudio));
  const loseAudioRef = useRef(new Audio(loseAudio));

  //Compute warning messages
  useEffect(() => {
    if (gameStarted && !isGameWon && !isGameOver) {
      const warnings = [
        "With each wrong answer, the sky darkens, and a menacing red moon rises, casting an eerie glow over the land.",
        " A creeping shadow rolls across the ground, hinting at the witches gathering their dark powers.",
        "The witches light a bonfire, dancing around it as they chant incantations to strengthen their magic.",
        "The first witch steps forward, her eyes gleaming with malice as she prepares to unleash her curse.",
        " The second witch joins, weaving spells in the air, her laughter echoing ominously in the night.",
        "The third witch appears, and together they begin their powerful spell, the air crackling with dark energy.",
        "As the final spell completes, a horde of bats is summoned from the shadows, signaling the end of the game and your defeat.",
      ];
      setWarning(warnings[wrongGuesses]);
    } else {
      setWarning("");
    }

    if (isGameWon) {
      winAudioRef.current.play();
    } else if (isGameOver) {
      loseAudioRef.current.play();
    }
  }, [wrongGuesses, gameStarted, isGameWon, isGameOver]);

  //Fetch edition's questions
  useEffect(() => {
    if (selectedEditionId) {
      const fetchQuestions = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/spookeyEditons/${selectedEditionId}`
          );

          if (response.data && response.data.length > 0) {
            console.log("Questions fetched:", response.data);
            setQuestions(response.data); // Set the questions directly
            setCurrentQuestionIndex(0);
            setWrongGuesses(0);
            setCorrectLetters([]);
            setGuessedLetters([]);
            setGameStarted(true);
            setShowAlert(false); // Reset alert on new edition
          } else {
            console.error("No questions found in the response.");
          }
        } catch (err) {
          console.error(
            "Failed to load questions for the selected edition.",
            err
          );
        }
      };

      fetchQuestions();
    }
  }, [selectedEditionId]);

  //Handle chracter guessing
  const handleGuess = (letter) => {
    if (isGameOver) return; // Disable input if the game is over

    const upperLetter = letter.toUpperCase();
    if (guessedLetters.includes(upperLetter)) return;

    setGuessedLetters([...guessedLetters, upperLetter]);

    if (word.includes(upperLetter)) {
      setCorrectLetters([...correctLetters, upperLetter]);
    } else {
      setWrongGuesses(wrongGuesses + 1);
    }
  };

  //Render Word
  const renderWord = () =>
    word.split("").map((letter, index) => (
      <span
        key={index}
        className={`text-4xl font-primaryRegular mx-2 ${
          correctLetters.includes(letter) ? "text-black" : "text-gray-600"
        }`}
      >
        {correctLetters.includes(letter) ? letter : "_"}
      </span>
    ));

  //Render alphabet
  const renderAlphabet = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet.split("").map((letter, index) => (
      <Button
        key={index}
        size="lg"
        variant="ghost"
        onClick={() => handleGuess(letter)}
        disabled={guessedLetters.includes(letter)}
        className={`bg-white hover:bg-black-400 text-black font-primaryRegular text-2xl py-2 px-4 rounded m-1 transition-colors duration-300 ${
          guessedLetters.includes(letter) ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {letter}
      </Button>
    ));
  };

  //Render game over image
  const renderHangmanImage = () => {
    const stages = [stage0, stage1, stage2, stage3, stage4, stage5, stage6];
    return (
      <img
        src={stages[wrongGuesses]}
        alt={`Hangman Stage ${wrongGuesses}`}
        className="w-[500px] h-[500px] mx-auto opacity-100 transition-opacity duration-500 ease-in-out border-4 border-red shadow-lg rounded-lg"
      />
    );
  };

  //Render Happy Image
  const renderHappyImage = () => (
    <img
      src={happyGirlJumping}
      alt="Happy Jumping Girl"
      className="w-[500px] h-[500px] mx-auto opacity-100 transition-opacity duration-500 ease-in-out border-4 border-customPink shadow-lg rounded-lg"
    />
  );

  //Render Warning
  const renderWarning = () => (
    <p
      style={{ color: "red" }}
      className={`font-primaryRegular  text-xl mb-6 transition-opacity duration-500 ease-in-out ${
        warning ? "opacity-100" : "opacity-0"
      }`}
    >
      {warning}
    </p>
  );

  //Show correct answer if round lost
  const renderCorrectAnswer = () => (
    <>
      <p
        className="font-primaryRegular text-red text-5xl mb-4 "
        style={{ textAlign: "center", color: "red" }}
      >
        Game Over... Bats Have Summoned . . .
      </p>
      <p className="text-black font-primaryRegular text-xl">
        The correct answer was: <strong>{word}</strong>
      </p>
    </>
  );

  //Show happy message
  const renderWinMessage = () => (
    <>
      <p
        className="font-primaryRegular text-5xl mb-4 text-black"
        style={{ textAlign: "center" }}
      >
        Great job! You're one step closer to defeating the witches. Get ready
        for the next question!
      </p>
    </>
  );

  // Increment correct answers count on game win
  useEffect(() => {
    if (isGameWon) {
      setCorrectAnswersCount(correctAnswersCount + 1);
    }
  }, [isGameWon]);

  //Show question and hint
  const renderQuestionAndHint = () => (
    <div className="text-xl font-primaryRegular mb-4 text-black">
      <p className="mb-2 text-4xl">{currentQuestion.question}</p>
      <p className="italic text-[18px] mt-8">Hint: {currentQuestion.hint}</p>
    </div>
  );

  useEffect(() => {
    if (selectedEditionId) {
      const fetchTitle = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/spookeyEditons/getEditionTitle/${selectedEditionId}`
          );

          if (response.data) {
            setSelectedEditionName(response.data); // Update edition title
          } else {
            console.error("No title found in the response.");
          }
        } catch (err) {
          console.error("Failed to load edition title.", err);
        }
      };
      fetchTitle();
    }
  }, [selectedEditionId]);

  // Handle start game with an edition or default questions
  const handleStartGame = (editionId) => {
    console.log(`Starting game with edition ID: ${editionId}`);

    if (editionId) {
      // Set the selected edition ID
      setSelectedEditionId(editionId);
      // Fetch questions for the selected edition (already handled by useEffect)
    } else {
      // Start with default questions
      setQuestions(defaultQuestions);
      setCurrentQuestionIndex(0);
      setWrongGuesses(0);
      setCorrectLetters([]);
      setGuessedLetters([]);
      setGameStarted(true);
      setShowAlert(false); // Reset alert on new game start
      setSelectedEditionName(""); // Reset edition name
    }
  };

  //Handle next questions
  const handleNextQuestion = () => {
    winAudioRef.current.pause();
    loseAudioRef.current.pause();

    winAudioRef.current.currentTime = 0;
    loseAudioRef.current.currentTime = 0;

    if (currentQuestionIndex >= questions.length - 1) {
      setShowAlert(true); // Show alert if all questions are done
    } else {
      setCurrentQuestionIndex((currentQuestionIndex + 1) % questions.length);
      setWrongGuesses(0);
      setCorrectLetters([]);
      setGuessedLetters([]);
      setGameStarted(true);
      setShowAlert(false); // Reset alert on new question
    }
  };

  //Handle alert
  const handleAlertClose = () => {
    window.location.reload(); // Refresh the page when "OK" is clicked
  };

  return (
    <div className="bg-customDark">
      <Header />
      <div
        style={{ backgroundImage: `url(${loadingGif})` }}
        className="w-[1500px] h-[800px] mx-auto mt-12 p-8 border-2 border-gray-300 shadow-lg rounded-lg flex bg-conatin bg-center"
      >
        {/* Render happy image if game win*/}
        <div className="w-[1200px] h-[200px]">
          {isGameWon ? renderHappyImage() : renderHangmanImage()}
        </div>

        {/* Render next question button after round win or loose*/}
        <div className="w-full flex flex-col items-center justify-center ml-8">
          {gameStarted ? (
            <>
              {isGameWon || isGameOver ? (
                <>
                  {isGameWon && renderWinMessage()}
                  {isGameOver && !isGameWon && renderCorrectAnswer()}

                  <Button
                    size="lg"
                    variant="ghost"
                    color="danger"
                    className="w-[300px] mt-4 text-xl "
                    onClick={handleNextQuestion}
                  >
                    Next Question
                  </Button>
                </>
              ) : (
                <>
                  {/* Display selected edition name */}
                  <p
                    className="text-5xl font-primaryRegular mb-8 "
                    style={{ color: "red" }}
                  >
                    {selectedEditionName || "Demo Edition"}
                  </p>
                  {renderQuestionAndHint()}{" "}
                  {/* Display the question and hint */}
                  <div className="mb-4">{renderWord()}</div>
                  {renderWarning()}
                  <div className="grid grid-cols-8 gap-2">
                    {renderAlphabet()}
                  </div>
                  <p
                    className="text-2xl font-primaryRegular mb-4"
                    style={{ color: "red" }}
                  >
                    Wrong guesses: {wrongGuesses} / {maxWrongGuesses}
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <h1
                className=" text-5xl font-primaryRegular mb-8"
                style={{ color: "red" }}
              >
                The Witch's Enigma
              </h1>
              <p className="mb-8 text-2xl text-black">
                Stop the witches from summoning evil bats by guessing the right
                answers to their tricky questions. Time is running out, and
                every wrong guess brings the bats closer to chaos. Can you solve
                the riddles and save the day?
              </p>
              <Button
                className="bg-black text-white font-primaryRegular w-[400px] h-[100px] text-5xl mb-8"
                onClick={() => handleStartGame()}
              >
                Play Demo
              </Button>
              {/* Edition selction*/}
              <EditionSelector onSelectEdition={handleStartGame} />
            </>
          )}
          {showAlert && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowAlert(false)}
            >
              <div
                className="bg-white p-8 rounded shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-primaryRegular mb-4 text-black">
                  All Questions Done
                </h2>
                <p className="mb-4 text-black">
                  You answered {correctAnswersCount} questions correctly.
                </p>
                <Button
                  onClick={handleAlertClose}
                  className="text-xl"
                  color="danger"
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Hangman;

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';

// Import your images for each stage
import stage0 from '../../assets/icons/st1.gif'; 
import stage1 from '../../assets/icons/st2.gif'; 
import stage2 from '../../assets/icons/st3.gif'; 
import stage3 from '../../assets/icons/st4.gif'; 
import stage4 from '../../assets/icons/st5.gif'; 
import stage5 from '../../assets/icons/st53.gif'; 
import stage6 from '../../assets/icons/st6.gif'; 
import happyGirlJumping from '../../assets/icons/win.gif'; 

// Import your audio files
import winAudio from '../../assets/won.mp3'; 
import loseAudio from '../../assets/over.mp3'; 

//Background image
import loadingGif from '../../assets/ghost.gif';

const Hangman = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [warning, setWarning] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const maxWrongGuesses = 6;
  const currentQuestion = questions[currentQuestionIndex];
  const word = currentQuestion.answer.toUpperCase();

  const isGameWon = !word.split('').some(letter => !correctLetters.includes(letter));
  const isGameOver = wrongGuesses >= maxWrongGuesses;

  const winAudioRef = useRef(new Audio(winAudio));
  const loseAudioRef = useRef(new Audio(loseAudio));

  useEffect(() => {
    if (gameStarted && !isGameWon && !isGameOver) {
      const warnings = [
        "The room is empty. The silence is deafening.",
        "Spooky shadows flicker around. The atmosphere is tense.",
        "The windows start shaking. Something is outside.",
        "A larger window appears, and strange noises are coming from it.",
        "The scared girl appears, trembling in fear.",
        "Ghostly figures start appearing around her, intensifying the fear.",
        "The ghosts surround the girl, making her terror palpable."
      ];
      setWarning(warnings[wrongGuesses]);
    } else {
      setWarning('');
    }

    if (isGameWon) {
      winAudioRef.current.play();
    } else if (isGameOver) {
      loseAudioRef.current.play();
    }
  }, [wrongGuesses, gameStarted, isGameWon, isGameOver]);

  const handleGuess = (letter) => {
    const upperLetter = letter.toUpperCase();
    if (guessedLetters.includes(upperLetter)) return;

    setGuessedLetters([...guessedLetters, upperLetter]);

    if (word.includes(upperLetter)) {
      setCorrectLetters([...correctLetters, upperLetter]);
    } else {
      setWrongGuesses(wrongGuesses + 1);
    }
  };

  const renderWord = () => (
    word.split('').map((letter, index) => (
      <span
        key={index}
        className={`text-4xl font-bold mx-2 ${correctLetters.includes(letter) ? 'text-black' : 'text-gray-600'}`}
      >
        {correctLetters.includes(letter) ? letter : '_'}
      </span>
    ))
  );

  const renderAlphabet = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet.split('').map((letter, index) => (
      <Button
        key={index}
        size='lg'
        variant='ghost'
        onClick={() => handleGuess(letter)}
        disabled={guessedLetters.includes(letter)}
        className={`bg-white hover:bg-black-400 text-black font-scary2 text-2xl py-2 px-4 rounded m-1 transition-colors duration-300 ${guessedLetters.includes(letter) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {letter}
      </Button>
    ));
  };

  const renderHangmanImage = () => {
    const stages = [stage0, stage1, stage2, stage3, stage4, stage5, stage6];
    return (
      <img
        src={stages[wrongGuesses]}
        alt={`Hangman Stage ${wrongGuesses}`}
        className="w-[500px] h-[500px] mx-auto opacity-100 transition-opacity duration-500 ease-in-out border-4 border-customPink shadow-lg rounded-lg"
      />
    );
  };

  const renderHappyImage = () => (
    <img
      src={happyGirlJumping}
      alt="Happy Jumping Girl"
      className="w-[500px] h-[500px] mx-auto opacity-100 transition-opacity duration-500 ease-in-out border-4 border-customPink shadow-lg rounded-lg"
    />
  );

  const renderWarning = () => (
    <p
      className={`font-scary2 text-xl mb-6 text-customPink transition-opacity duration-500 ease-in-out ${warning ? 'opacity-100' : 'opacity-0'}`}
    >
      {warning}
    </p>
  );

  const handleStartGame = () => {
    setGameStarted(true);
    setWrongGuesses(0);
    setCorrectLetters([]);
    setGuessedLetters([]);
  };

  const handleNextQuestion = () => {
    // Pause any playing audio when moving to the next question
    winAudioRef.current.pause();
    loseAudioRef.current.pause();
    
    // Reset the audio to the start
    winAudioRef.current.currentTime = 0;
    loseAudioRef.current.currentTime = 0;
    
    setCurrentQuestionIndex((currentQuestionIndex + 1) % questions.length);
    setWrongGuesses(0);
    setCorrectLetters([]);
    setGuessedLetters([]);
    setGameStarted(true);
  };
  

  return (
<div
  style={{ backgroundImage: `url(${loadingGif})` }}
  className="w-[1200px] mx-auto mt-12 p-8  border-2 border-gray-300 shadow-lg rounded-lg flex bg-conatin bg-center"
>
      <div className="w-[500px] h-[500px] mr-8">
        {isGameWon ? renderHappyImage() : renderHangmanImage()}
      </div>
      <div className="flex-1">
        {!gameStarted ? (
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 font-scary2">Spooky Guesses</h1>
            <p className="text-3xl mb-8 font-scary2">
            Spooky Guesses is a thrilling, haunted twist on classic Hangman where players guess letters to uncover a hidden word. As they make incorrect guesses, the game intensifies with eerie visuals, from shaking windows to ghostly figures. Successfully reveal the word to win and see a celebratory animation, or face a chilling loss scene if wrong guesses exceed the limit. With haunting atmospheres, interactive gameplay, and spine-tingling warnings, Spooky Guesses delivers an engaging and spooky guessing experience.
            </p>
            <Button
              onClick={handleStartGame}
              color="danger"
              size='2xl'
              className="font-scary2 text-3xl"
            >
              Start Game
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-scary2 mb-6">{currentQuestion.question}</h2>
            <p className="text-lg mb-6 font-scary2"><strong>Hint:</strong> {currentQuestion.hint}</p>
            {!isGameWon && !isGameOver && renderWarning()}
            <div className="text-center my-6">
              <div className="mb-6">{renderWord()}</div>
              {!isGameWon && !isGameOver && (
                <div className="flex flex-wrap justify-center">{renderAlphabet()}</div>
              )}
            </div>
            <div className="text-center mt-6">
              {isGameWon && <p className="text-green-600 text-3xl font-bold">Congratulations! You've won!</p>}
              {isGameOver && <p className="text-customPink text-5xl  font-scary2">Game Over<br></br><span className="font-primaryRegular text-black text-lg"> Word was <strong>{word}</strong></span></p>}
            </div>
            <Button
              className="mt-6 font-scary2 text-2xl"
              color='danger'
              size='lg'
              radius='none'
              
              onClick={() => {
                if (isGameWon || isGameOver) {
                  handleNextQuestion();
                } else {
                  setWrongGuesses(0);
                  setCorrectLetters([]);
                  setGuessedLetters([]);
                }
              }}
            >
              {isGameWon || isGameOver ? 'Next Question' : 'Restart'}
            </Button>
            <p className=" mb-8 text-2xl text-customPink bg-white w-[300px] p-4">Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Hangman;

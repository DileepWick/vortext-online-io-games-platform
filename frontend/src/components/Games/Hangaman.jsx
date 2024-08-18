import React, { useState } from 'react';

const Hangman = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [guessedLetters, setGuessedLetters] = useState([]);

  const maxWrongGuesses = 6;
  const currentQuestion = questions[currentQuestionIndex];
  const word = currentQuestion.answer.toUpperCase();

  const handleGuess = (letter) => {
    const upperLetter = letter.toUpperCase();

    if (guessedLetters.includes(upperLetter)) {
      return;
    }

    setGuessedLetters([...guessedLetters, upperLetter]);

    if (word.includes(upperLetter)) {
      setCorrectLetters([...correctLetters, upperLetter]);
    } else {
      setWrongGuesses(wrongGuesses + 1);
    }
  };

  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <span
        key={index}
        className={`text-3xl font-bold mx-1 ${correctLetters.includes(letter) ? 'text-black' : 'text-gray-600'}`}
      >
        {correctLetters.includes(letter) ? letter : '_'}
      </span>
    ));
  };

  const renderAlphabet = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet.split('').map((letter, index) => (
      <button
        key={index}
        onClick={() => handleGuess(letter)}
        disabled={guessedLetters.includes(letter)}
        className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded m-1 transition-colors duration-300"
      >
        {letter}
      </button>
    ));
  };

  const renderHangman = () => {
    // SVG illustrations for hangman stages
    const stages = [
      <svg key="0" className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="3" />
      </svg>,
      <svg key="1" className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="10" stroke="black" strokeWidth="3" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="black" strokeWidth="3" />
        <line x1="40" y1="50" x2="60" y2="50" stroke="black" strokeWidth="3" />
      </svg>,
      <svg key="2" className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="10" stroke="black" strokeWidth="3" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="black" strokeWidth="3" />
        <line x1="40" y1="50" x2="60" y2="50" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="40" y2="80" stroke="black" strokeWidth="3" />
      </svg>,
      <svg key="3" className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="10" stroke="black" strokeWidth="3" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="black" strokeWidth="3" />
        <line x1="40" y1="50" x2="60" y2="50" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="40" y2="80" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="60" y2="80" stroke="black" strokeWidth="3" />
      </svg>,
      <svg key="4" className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="10" stroke="black" strokeWidth="3" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="black" strokeWidth="3" />
        <line x1="40" y1="50" x2="60" y2="50" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="40" y2="80" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="60" y2="80" stroke="black" strokeWidth="3" />
        <line x1="40" y1="30" x2="40" y2="20" stroke="black" strokeWidth="3" />
      </svg>,
      <svg key="5" className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="10" stroke="black" strokeWidth="3" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="black" strokeWidth="3" />
        <line x1="40" y1="50" x2="60" y2="50" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="40" y2="80" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="60" y2="80" stroke="black" strokeWidth="3" />
        <line x1="40" y1="30" x2="40" y2="20" stroke="black" strokeWidth="3" />
        <line x1="60" y1="30" x2="60" y2="20" stroke="black" strokeWidth="3" />
      </svg>,
      <svg key="6" className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="10" stroke="black" strokeWidth="3" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="black" strokeWidth="3" />
        <line x1="40" y1="50" x2="60" y2="50" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="40" y2="80" stroke="black" strokeWidth="3" />
        <line x1="50" y1="60" x2="60" y2="80" stroke="black" strokeWidth="3" />
        <line x1="40" y1="30" x2="40" y2="20" stroke="black" strokeWidth="3" />
        <line x1="60" y1="30" x2="60" y2="20" stroke="black" strokeWidth="3" />
        <line x1="50" y1="20" x2="50" y2="10" stroke="black" strokeWidth="3" />
      </svg>,
    ];

    return (
      <div className="hangman-illustration text-2xl text-center mb-4">
        {stages[wrongGuesses]}
      </div>
    );
  };

  const resetGame = () => {
    setWrongGuesses(0);
    setCorrectLetters([]);
    setGuessedLetters([]);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const isGameWon = word.split('').every((letter) => correctLetters.includes(letter));
  const isGameOver = wrongGuesses >= maxWrongGuesses;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
      <p className="text-lg mb-4"><strong>Hint:</strong> {currentQuestion.hint}</p>
      {renderHangman()}
      <div className="text-center my-4">
        <div className="mb-4">{renderWord()}</div>
        <div className="flex flex-wrap justify-center">{renderAlphabet()}</div>
      </div>
      <div className="text-center mt-4">
        {isGameWon && <p className="text-green-600 text-xl font-bold">Congratulations! You've won!</p>}
        {isGameOver && <p className="text-red-600 text-xl font-bold">Game Over! The word was <span className="font-bold">{word}</span></p>}
      </div>
      <button
        onClick={resetGame}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
      >
        {isGameWon || isGameOver ? 'Next Question' : 'Restart'}
      </button>
      <p className="text-center mt-2">Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}</p>
    </div>
  );
};

export default Hangman;

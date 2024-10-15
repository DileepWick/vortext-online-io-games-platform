import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import ScrollToTop from "../ScrollToTop";
import Header from "../header";
import Footer from "../footer";
import useAuthCheck from "../../utils/authCheck";

// Define constants for the game
const GRID_SIZE = 15;

const ALL_WORDS = {
  animals: ['DOG', 'CAT', 'ELEPHANT', 'GIRAFFE', 'LION', 'TIGER', 'ZEBRA', 'MONKEY', 'PANDA', 'KOALA'],
  vehicles: ['CAR', 'TRUCK', 'BUS', 'MOTORCYCLE', 'BICYCLE', 'TRAIN', 'AIRPLANE', 'BOAT', 'SCOOTER', 'HELICOPTER'],
  foods: ['RICE', 'WHEAT', 'CORN', 'BARLEY', 'OATS', 'MILLET', 'SORGHUM', 'QUINOA', 'AMARANTH', 'BUCKWHEAT'],
  computerParts: ['CPU', 'RAM', 'GPU', 'SSD', 'HDD', 'MOTHERBOARD', 'KEYBOARD', 'MOUSE', 'MONITOR', 'SPEAKER'],
  programmingLanguages: ['PYTHON', 'JAVA', 'JAVASCRIPT', 'CSHARP', 'RUBY', 'PHP', 'SWIFT', 'KOTLIN', 'RUST', 'GOLANG']
};

// Define difficulty levels with corresponding word lists and time limits
const DIFFICULTY_LEVELS = {
  1: { name: 'Animals', words: ALL_WORDS.animals, timeLimit: 1200 },
  2: { name: 'Vehicles', words: ALL_WORDS.vehicles, timeLimit: 900 },
  3: { name: 'Foods', words: ALL_WORDS.foods, timeLimit: 600 },
  4: { name: 'Computer Parts', words: ALL_WORDS.computerParts, timeLimit: 300 },
  5: { name: 'Programming Languages', words: ALL_WORDS.programmingLanguages, timeLimit: 180 }
};

const MAX_WRONG_SELECTIONS = 10;

// Function to generate the word search grid
const generateGrid = (words) => {
  const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''));
  const directions = [
    [0, 1], [1, 0], [1, 1], [-1, -1], [-1, 0], [0, -1], [1, -1], [-1, 1]
  ];

// Function to place a word on the grid
  const placeWord = (word) => {
    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
    let row, col;

// Find a valid starting position for the word
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    } while (!canPlaceWord(word, row, col, dx, dy));

// Place the word letter by letter in the chosen direction
    for (let i = 0; i < word.length; i++) {
      grid[row + i * dx][col + i * dy] = word[i];
    }
    return { word, start: [row, col], direction: [dx, dy] };
  };

  const canPlaceWord = (word, row, col, dx, dy) => {
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
        return false;
      }
      if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  const placedWords = words.map(placeWord);

// Fill remaining empty spaces with random letters
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, placedWords };
};

const WordSearch = () => {
  useAuthCheck();
  const [grid, setGrid] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [gameWords, setGameWords] = useState([]);
  const [level, setLevel] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [message, setMessage] = useState('');
  const [wrongSelections, setWrongSelections] = useState(0);

// Effect to initialize the game when a level is selected  
  useEffect(() => {
    if (level) {
      const words = DIFFICULTY_LEVELS[level].words;
      setGameWords(words);
      const { grid, placedWords } = generateGrid(words);
      setGrid(grid);
      setPlacedWords(placedWords);
      setGameStarted(true);
      setFoundWords([]);
      setSelectedLetters([]);
      setTimeLeft(DIFFICULTY_LEVELS[level].timeLimit);
      setGameOver(false);
      setScore(0);
      setHints(3);
      setMessage('');
      setWrongSelections(0);
    }
  }, [level]);

// Effect to handle the game timer  
  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0 && !gameOver) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      setMessage('Time\'s up! Game over.');
    }
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft, gameOver]);

// Effect to check if all words are found  
  useEffect(() => {
    if (foundWords.length === gameWords.length && !gameOver) {
      setGameOver(true);
      const timeBonus = timeLeft * 10;
      const newScore = score + timeBonus;
      setScore(newScore);
      setMessage(`Congratulations! You've found all words. Your final score is ${newScore}`);
    }
  }, [foundWords, gameWords, gameOver, score, timeLeft]);

// Function to handle letter clicks  
  const handleLetterClick = (row, col) => {
    if (gameOver) return;

    const newSelection = [...selectedLetters, { row, col, letter: grid[row][col] }];
    setSelectedLetters(newSelection);

    const selectedWord = newSelection.map(pos => pos.letter).join('');
    const foundWord = placedWords.find(({ word }) => word === selectedWord);

    if (foundWord && !foundWords.includes(foundWord.word)) {
      setFoundWords([...foundWords, foundWord.word]);
      setSelectedLetters([]);
      const wordScore = foundWord.word.length * 10;
      setScore(prevScore => prevScore + wordScore);
    } else if (newSelection.length >= Math.max(...placedWords.map(pw => pw.word.length))) {
      setSelectedLetters([]);
      setWrongSelections(prev => {
        const newWrongSelections = prev + 1;
        if (newWrongSelections >= MAX_WRONG_SELECTIONS) {
          setGameOver(true);
          setMessage('Game over! You\'ve reached the maximum number of wrong selections.');
        }
        return newWrongSelections;
      });
    }
  };

// Function to handle level selection  
  const handleLevelSelect = (selectedLevel) => {
    setLevel(selectedLevel);
  };

  const handleHomeClick = () => {
    setGameStarted(false);
    setLevel(null);
    setFoundWords([]);
    setSelectedLetters([]);
    setGameOver(false);
    setScore(0);
    setHints(3);
    setMessage('');
    setWrongSelections(0);
  };

// Function to handle hint usage  
  const handleHintClick = () => {
    if (hints > 0 && !gameOver) {
      const unFoundWords = gameWords.filter(word => !foundWords.includes(word));
      if (unFoundWords.length > 0) {
        const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
        const placedWord = placedWords.find(pw => pw.word === randomWord);
        const { start } = placedWord;
        setHints(prevHints => prevHints - 1);
        setMessage(`Hint: The word "${randomWord}" starts at row ${start[0] + 1}, column ${start[1] + 1}`);
      }
    }
  };

 // Function to check if a letter is part of a found word  
  const isLetterHighlighted = (row, col) => {
    return foundWords.some(word => {
      const placedWord = placedWords.find(pw => pw.word === word);
      if (placedWord) {
        const { start, direction } = placedWord;
        for (let i = 0; i < word.length; i++) {
          if (start[0] + i * direction[0] === row && start[1] + i * direction[1] === col) {
            return true;
          }
        }
      }
      return false;
    });
  };

// Function to check if a letter is currently selected  
  const isLetterSelected = (row, col) => {
    return selectedLetters.some(pos => pos.row === row && pos.col === col);
  };

// Function to render the home button  
  const renderHomeButton = () => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleHomeClick}
      className="absolute top-2 right-2 px-4 py-2 text-sm bg-purple-600 text-white border-none rounded-full cursor-pointer shadow-md transition-all duration-300 ease-in-out hover:bg-purple-700"
    >
      Home
    </motion.button>
  );

// Render the level selection screen if the game hasn't started
  if (!gameStarted) {
    return (
      <div className="bg-gradient-to-b from-purple-900 to-indigo-900 min-h-screen w-full flex flex-col">
        <ScrollToTop />
        <Header className="bg-transparent" />
        <div className="flex-grow flex flex-col items-center justify-center py-12 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 py-4">
              Word Search Challenge
            </h1>
          </div>
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 text-2xl sm:text-4xl font-bold text-center">
                <TextGenerateEffect words="Unravel the Hidden Words!" />
              </div>
            </div>
          </div>
           {/* Level selection buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
              <motion.button
                key={key}
                className="relative overflow-hidden rounded-xl shadow-lg"
                onClick={() => handleLevelSelect(parseInt(key))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 opacity-75" />
                <div className="relative px-6 py-4 bg-opacity-20 bg-black backdrop-filter backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-1">{`Level ${key}`}</h3>
                  <p className="text-yellow-200">{value.name}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        <Footer className="bg-transparent" />
      </div>
    );
  }

  return (
    <div className="font-sans bg-gradient-to-br from-purple-900 to-indigo-900 min-h-screen w-full flex flex-col">
      <div className="flex-grow flex flex-col p-4">
        {renderHomeButton()}
        {/* Game title */}
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-pink-300 mb-4"
        >
          Word Search: {DIFFICULTY_LEVELS[level].name}
        </motion.h1>
        <div className="flex flex-col md:flex-row justify-between flex-grow overflow-hidden">
           {/* Word list and game info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 bg-gray-800 rounded-lg p-4 shadow-md mb-4 md:mb-0 md:mr-4 overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-cyan-300 mb-3">Words to Find:</h3>
            {/* Render each word in the list */}
            {gameWords.map((word, index) => (
              <motion.div 
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`m-1 p-2 rounded-md text-center font-bold shadow-sm transition-all duration-300 text-sm ${
                  foundWords.includes(word)
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-green-100'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-blue-100'
                }`}
              >
                {word}
              </motion.div>
            ))}
            {/* Game information */}
            <div className="mt-6 text-sm">
              <p className="font-semibold text-pink-300">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
              <p className="font-semibold text-pink-300">Score: {score}</p>
              <p className="font-semibold text-pink-300">Hints Left: {hints}</p>
              <p className="font-semibold text-pink-300">Wrong Selections: {wrongSelections} / {MAX_WRONG_SELECTIONS}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHintClick}
                disabled={hints === 0 || gameOver}
                className={`px-4 py-2 mt-3 rounded-full text-white ${
                  hints > 0 && !gameOver ? 'bg-violet-600 hover:bg-violet-700' : 'bg-gray-600 cursor-not-allowed'
                } transition-all duration-300`}
              >
                Use Hint
              </motion.button>
            </div>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-teal-800 rounded-md text-teal-200 shadow-sm text-sm"
              >
                {message}
              </motion.div>
            )}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-grow bg-gray-800 rounded-lg p-4 shadow-md flex justify-center items-center overflow-y-auto"
          >
            <div>
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center">
                  {row.map((cell, colIndex) => (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLetterClick(rowIndex, colIndex)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-purple-500 m-px cursor-pointer font-bold text-xs rounded transition-all duration-300 ${
                        isLetterHighlighted(rowIndex, colIndex) 
                          ? 'bg-emerald-600 text-emerald-100' 
                          : isLetterSelected(rowIndex, colIndex)
                            ? 'bg-pink-600 text-pink-100'
                            : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {cell}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      {/* Game over modal */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
        >
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-white text-center">
            {/* Victory or defeat message */}
            <motion.h2 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
              className="text-4xl sm:text-6xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400"
            >
              {foundWords.length === gameWords.length ? "VICTORY!" : "DEFEAT!"}
            </motion.h2>
            {/* Animated congratulatory or encouragement message */}
            <TextGenerateEffect 
              words={foundWords.length === gameWords.length 
                ? "Congratulations! You've found all the words!" 
                : "Better luck next time!"}
              className="text-xl sm:text-2xl mb-6 text-gray-300"
            />
            <p className="mb-2 text-lg sm:text-xl">Your score: {score}</p>
            <p className="mb-6 text-lg sm:text-xl">Words found: {foundWords.length} / {gameWords.length}</p>
             {/* Play again button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLevelSelect(level)}
              className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 mb-4 text-lg"
            >
              Play Again
            </motion.button>
             {/* Change difficulty button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHomeClick}
              className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 text-lg"
            >
              Change Difficulty
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WordSearch;
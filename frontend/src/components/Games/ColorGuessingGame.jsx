import React, { useState, useEffect, useCallback } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import Header from "../header";
import Footer from "../footer";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import ScrollToTop from "../ScrollToTop";

const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXPERT: "expert",
};

const easyColors = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
];

const mediumColors = [
  ...easyColors,
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Cyan', hex: '#00FFFF' },
];

const hardColors = [
  ...mediumColors,
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Olive', hex: '#808000' },
];

const expertColorCombinations = [
  { components: ['Red', 'Blue'], result: 'Purple' },
  { components: ['Red', 'Yellow'], result: 'Orange' },
  { components: ['Blue', 'Yellow'], result: 'Green' },
  { components: ['Red', 'White'], result: 'Pink' },
  { components: ['Blue', 'Green'], result: 'Cyan' },
  { components: ['Red', 'Blue', 'Yellow'], result: 'Brown' },
];

const words = "Can You Master the Art of Color?";

const ColorGuessingGame = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [currentColor, setCurrentColor] = useState(null);
  const [options, setOptions] = useState([]);
  const [health, setHealth] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [transform, setTransform] = useState("translate(0, 0)");
  const navigate = useNavigate();

  const generateQuestion = useCallback(() => {
    let colorSet, questionType;

    switch (difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        colorSet = easyColors;
        questionType = 'single';
        break;
      case DIFFICULTY_LEVELS.MEDIUM:
        colorSet = mediumColors;
        questionType = 'single';
        break;
      case DIFFICULTY_LEVELS.HARD:
        colorSet = hardColors;
        questionType = 'single';
        break;
      case DIFFICULTY_LEVELS.EXPERT:
        questionType = 'combine';
        break;
      default:
        colorSet = easyColors;
        questionType = 'single';
    }

    if (questionType === 'single') {
      const correctColor = colorSet[Math.floor(Math.random() * colorSet.length)];
      const incorrectColors = colorSet.filter(color => color !== correctColor);
      const shuffledOptions = [
        correctColor,
        ...incorrectColors.sort(() => 0.5 - Math.random()).slice(0, 2)
      ].sort(() => 0.5 - Math.random());
      setCurrentColor(correctColor);
      setOptions(shuffledOptions);
    } else {
      const combination = expertColorCombinations[Math.floor(Math.random() * expertColorCombinations.length)];
      setCurrentColor(combination);
      setOptions([
        { name: combination.result },
        ...hardColors
          .filter(color => color.name !== combination.result)
          .sort(() => 0.5 - Math.random())
          .slice(0, 2)
      ].sort(() => 0.5 - Math.random()));
    }
  }, [difficulty]);

  useEffect(() => {
    if (difficulty) {
      generateQuestion();
      setStartTime(Date.now());
    }
  }, [difficulty, generateQuestion]);

  const handleAnswer = useCallback((selectedColor) => {
    const isCorrect = difficulty === DIFFICULTY_LEVELS.EXPERT
      ? selectedColor.name === currentColor.result
      : selectedColor.name === currentColor.name;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      setMessage('Correct! Well done!');
      generateQuestion();
    } else {
      setHealth(prevHealth => Math.max(prevHealth - 1, 0));
      setMessage(`Oops! That's not correct. ${
        difficulty === DIFFICULTY_LEVELS.EXPERT
          ? `The correct answer was ${currentColor.result}.`
          : `The color was ${currentColor.name}.`
      }`);
      if (health <= 1) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
        }
      } else {
        generateQuestion();
      }
    }
  }, [currentColor, difficulty, generateQuestion, health, highScore, score]);

  const startGame = useCallback((selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setGameOver(false);
    setHealth(3);
    setMessage('');
    setStartTime(Date.now());
    generateQuestion();
  }, [generateQuestion]);

  const restartGame = useCallback(() => {
    startGame(difficulty);
  }, [difficulty, startGame]);

  const handleMouseEnter = (e) => {
    const { clientX, clientY, target } = e;
    const { left, top, width, height } = target.getBoundingClientRect();

    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    if (Math.abs(x) > Math.abs(y)) {
      if (x > 0) {
        setTransform("translate(-10px, 0)");
      } else {
        setTransform("translate(10px, 0)");
      }
    } else {
      if (y > 0) {
        setTransform("translate(0, -10px)");
      } else {
        setTransform("translate(0, 10px)");
      }
    }
  };

  const handleMouseLeave = () => {
    setTransform("translate(0, 0)");
  };

  const handleLeaderboardClick = () => {
    navigate("/leaderboard", { state: { currentUser: "userId" } });
  };

  if (!difficulty) {
    return (
      <div className="bg-foreground">
        <ScrollToTop />
        <Header />
        
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="mb-8 text-center">
              <h1 className="text-7xl font-bold text-black bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-green-500 via-red-500 to-blue-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
                Color Guessing Game
              </h1>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text text-4xl font-bold text-center">
                  <TextGenerateEffect words={words} />
                </div>
              </div>
            </div>

            <div className="items-center space-y-4">
              {Object.values(DIFFICULTY_LEVELS).map((level) => (
                <button
                  key={level}
                  className="p-[3px] relative m-2"
                  onClick={() => startGame(level)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg" />
                  <div className="px-6 py-3 bg-black rounded-[6px] relative group transition duration-200 text-white text-xl hover:bg-transparent">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                </button>
              ))}
            </div>
            {/* <button
              className="shadow-[0_0_0_3px_#000000_inset] px-6 py-4 bg-black border border-black dark:border-white dark:text-white text-white text-sm rounded-lg font-bold transform transition duration-400 mt-4 hover:bg-transparent flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleLeaderboardClick}
            >
              <span>Leaderboard</span>
            </button> */}
          </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 min-h-screen flex flex-col">
      <Header />
      <GameHeader
        difficulty={difficulty}
        score={score}
        health={health}
      />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-gray-200 rounded-lg shadow-lg p-8 max-w-md w-full">
          {currentColor && (
            difficulty === DIFFICULTY_LEVELS.EXPERT ? (
              <div className="text-center mb-6">
                <p className="text-xl mb-2 text-black">What color do you get when you combine:</p>
                <p className="text-2xl font-bold text-black">{currentColor.components?.join(' + ') || 'Loading...'}</p>
              </div>
            ) : (
              <div 
                className="w-32 h-32 rounded-full mx-auto mb-6"
                style={{ backgroundColor: currentColor.hex }}
              ></div>
            )
          )}
          <p className="text-xl text-center mb-4 text-black">What color is this?</p>
          <div className="space-y-3">
            {options.map((color) => (
              <button 
                key={color.name} 
                onClick={() => handleAnswer(color)}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
              >
                {color.name}
              </button>
            ))}
          </div>
          {message && (
            <div className="mt-6 p-4 bg-gray-400 rounded-lg">
              <h3 className="font-bold mb-2 text-black">Result</h3>
              <p className={`text-black`}>
                {message}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      {gameOver && (
        <GameOverModal
          score={score}
          highScore={highScore}
          onRestart={restartGame}
          onChangeDifficulty={() => setDifficulty(null)}
        />
      )}
    </div>
  );
};


const GameHeader = ({ difficulty, score, health }) => {
  return (
    <div className="bg-gray-700 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <span className="text-lg font-bold">Health: {renderHearts(health)}</span>
      </div>
      <div className="text-lg font-bold">Difficulty: {difficulty}</div>
      <div className="text-lg font-bold">Score: {score}</div>
    </div>
  );
};


const GameOverModal = ({ score, highScore, onRestart, onChangeDifficulty }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-black">Game Over!</h2>
        <p className="mb-2 text-black">Your score: {score}</p>
        <p className="mb-4 text-black">High score: {highScore}</p>
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Play Again
          </button>
          <button
            onClick={onChangeDifficulty}
            className="w-full p-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            Change Difficulty
          </button>
        </div>
      </div>
    </div>
  );
};

const renderHearts = (health) => {
  return (
    <div className="flex">
      {[...Array(3)].map((_, i) => (
        i < health ? (
          <FaHeart key={i} className="text-red-500 mr-1" />
        ) : (
          <FaRegHeart key={i} className="text-red-500 mr-1" />
        )
      ))}
    </div>
  );
};

export default ColorGuessingGame;
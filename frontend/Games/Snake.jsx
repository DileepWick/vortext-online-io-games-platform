import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import useAuthCheck from "../src/utils/authCheck";


const GRID_SIZE = 30;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 15, y: 15 },
  { x: 14, y: 15 },
  { x: 13, y: 15 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const generateMathQuestion = () => {
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let a, b, answer;

  switch (operation) {
    case "+":
      a = Math.floor(Math.random() * 20);
      b = Math.floor(Math.random() * 20);
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 20) + 20;
      b = Math.floor(Math.random() * 20);
      answer = a - b;
      break;
    case "*":
      a = Math.floor(Math.random() * 10);
      b = Math.floor(Math.random() * 10);
      answer = a * b;
      break;
  }

  return { question: `${a} ${operation} ${b}`, answer };
};

const generateAnswerOptions = (correctAnswer) => {
  const options = [correctAnswer];
  while (options.length < 4) {
    const wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
    if (!options.includes(wrongAnswer) && wrongAnswer >= 0) {
      options.push(wrongAnswer);
    }
  }
  return options
    .sort(() => Math.random() - 0.5)
    .map((value, index) => ({
      value,
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }));
};

const Snake = () => {
  useAuthCheck();
  const [gameMode, setGameMode] = useState(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [mathQuestion, setMathQuestion] = useState(generateMathQuestion());
  const [answerOptions, setAnswerOptions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameContainerRef = useRef(null);
  const directionQueue = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    setAnswerOptions(generateAnswerOptions(mathQuestion.answer));
  }, [mathQuestion]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    let newDirection = direction;
    if (directionQueue.current.length > 0) {
      newDirection = directionQueue.current.shift();
    }

    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += newDirection.x;
    head.y += newDirection.y;

    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    if (
      newSnake.some(
        (segment, index) =>
          index !== 0 && segment.x === head.x && segment.y === head.y
      )
    ) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    const eatenAnswerIndex = answerOptions.findIndex(
      (option) => option.x === head.x && option.y === head.y
    );

    if (eatenAnswerIndex !== -1) {
      if (answerOptions[eatenAnswerIndex].value === mathQuestion.answer) {
        setScore((prevScore) => prevScore + 1);
      } else {
        newSnake.pop();
        newSnake.pop();
        if (newSnake.length < 1) {
          setGameOver(true);
          return;
        }
      }
      setMathQuestion(generateMathQuestion());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    setDirection(newDirection);
  }, [snake, direction, mathQuestion, answerOptions, gameOver]);

  useEffect(() => {
    const intervalId = setInterval(moveSnake, 200);
    return () => clearInterval(intervalId);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;

      let newDirection;
      switch (e.key) {
        case "ArrowUp":
          newDirection = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          newDirection = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          newDirection = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          newDirection = { x: 1, y: 0 };
          break;
        default:
          return;
      }

      const lastDirection = directionQueue.current.length > 0
        ? directionQueue.current[directionQueue.current.length - 1]
        : direction;

      if (
        (newDirection.x !== -lastDirection.x || newDirection.y !== -lastDirection.y) &&
        (newDirection.x !== lastDirection.x || newDirection.y !== lastDirection.y)
      ) {
        directionQueue.current.push(newDirection);
        if (directionQueue.current.length > 3) {
          directionQueue.current.shift();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setMathQuestion(generateMathQuestion());
    setGameOver(false);
    setScore(0);
    directionQueue.current = [];
  };

  const toggleFullScreen = () => {
    const elem = gameContainerRef.current;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const selectGameMode = (mode) => {
    if (mode === '1player') {
      setGameMode('1player');
      restartGame();
    } else if (mode === '2player') {
      navigate("/Snakegame2player");
    }
  };

  const backToMenu = () => {
    setGameMode(null);
    setGameOver(false);
    setScore(0);
    directionQueue.current = [];
  };

  if (!gameMode) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center" style={{ backgroundColor: "#1a202c" }}>
          <div className="bg-gray-800 rounded-lg shadow-lg text-white p-8" style={{ backgroundColor: "#2d3748" }}>
            <h2 className="text-3xl font-bold mb-6 text-center">Select Game Mode</h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => selectGameMode('1player')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg"
                style={{ backgroundColor: "#4299e1", color: "#ffffff" }}
              >
                1 Player
              </button>
              <button
                onClick={() => selectGameMode('2player')}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-lg"
                style={{ backgroundColor: "#48bb78", color: "#ffffff" }}
              >
                2 Players
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div
        className="min-h-screen bg-gray-900 text-white flex items-center justify-center"
        style={{ backgroundColor: "#1a202c" }}
      >
        <div
          ref={gameContainerRef}
          className="bg-gray-800 rounded-lg shadow-lg text-white p-4"
          style={{ backgroundColor: "#2d3748" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold" style={{ color: "#ffffff" }}>
              Score: {score} | High Score: {highScore}
            </h3>
            <button
              onClick={backToMenu}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              style={{ backgroundColor: "#f56565", color: "#ffffff" }}
            >
              Back to Menu
            </button>
          </div>

          <div className="text-center mb-4">
            <button
              onClick={toggleFullScreen}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              style={{ backgroundColor: "#48bb78", color: "#ffffff" }}
            >
              Toggle Full Screen
            </button>
          </div>

          <div
            className="text-center mb-4 p-2 bg-blue-500 rounded"
            style={{ backgroundColor: "#4299e1" }}
          >
            <span className="text-2xl font-bold" style={{ color: "#ffffff" }}>
              Question: {mathQuestion.question}
            </span>
          </div>

          <div
            className="grid bg-gray-200 border-2 border-gray-300 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              width: `${GRID_SIZE * CELL_SIZE}px`,
              height: `${GRID_SIZE * CELL_SIZE}px`,
              backgroundColor: "#edf2f7",
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake = snake.some(
                (segment) => segment.x === x && segment.y === y
              );
              const answerOption = answerOptions.find(
                (option) => option.x === x && option.y === y
              );
              return (
                <div
                  key={index}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: isSnake
                      ? "#000000"
                      : answerOption
                      ? "#4299e1"
                      : "transparent",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: isSnake ? "#ffffff" : "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {answerOption && answerOption.value}
                </div>
              );
            })}
          </div>
          {gameOver && (
            <div className="mt-4 text-center">
              <h4
                className="mb-2 text-lg font-bold"
                style={{ color: "#ffffff" }}
              >
                Game Over!
              </h4>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={restartGame}
                style={{ backgroundColor: "#4299e1", color: "#ffffff" }}
              >
                Restart Game
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                onClick={backToMenu}
                style={{ backgroundColor: "#ecc94b", color: "#ffffff" }}
              >
                Back to Menu
              </button>
            </div>
          )}
          <p className="mt-4 text-center text-sm" style={{ color: "#a0aec0" }}>
            Use arrow keys to control the snake. Eat correct answers to grow,
            wrong answers make you smaller!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Snake;
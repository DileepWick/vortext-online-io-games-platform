import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../src/components/header";
import Footer from "../src/components/footer";

const GRID_SIZE = 30;
const CELL_SIZE = 20;
const INITIAL_SNAKE1 = [
  { x: 5, y: 15 },
  { x: 4, y: 15 },
  { x: 3, y: 15 },
];
const INITIAL_SNAKE2 = [
  { x: 25, y: 15 },
  { x: 26, y: 15 },
  { x: 27, y: 15 },
];
const INITIAL_DIRECTION1 = { x: 1, y: 0 };
const INITIAL_DIRECTION2 = { x: -1, y: 0 };

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
    default:
      throw new Error("Invalid operation");
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
    .map((value) => ({
      value,
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }));
};

const Snake2player = () => {
  const [snake1, setSnake1] = useState(INITIAL_SNAKE1);
  const [snake2, setSnake2] = useState(INITIAL_SNAKE2);
  const [direction1, setDirection1] = useState(INITIAL_DIRECTION1);
  const [direction2, setDirection2] = useState(INITIAL_DIRECTION2);
  const [mathQuestion, setMathQuestion] = useState(generateMathQuestion());
  const [answerOptions, setAnswerOptions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [winner, setWinner] = useState(null);
  const gameContainerRef = useRef(null);
  const directionQueue1 = useRef([]);
  const directionQueue2 = useRef([]);
  const gameLoopRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAnswerOptions(generateAnswerOptions(mathQuestion.answer));
  }, [mathQuestion]);

  const endGame = useCallback((winningSnake) => {
    setWinner(winningSnake);
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake1((prevSnake1) => {
      let newDirection1 = direction1;
      if (directionQueue1.current.length > 0) {
        newDirection1 = directionQueue1.current.shift();
        setDirection1(newDirection1);
      }
      const head1 = { x: prevSnake1[0].x + newDirection1.x, y: prevSnake1[0].y + newDirection1.y };
      return [head1, ...prevSnake1.slice(0, -1)];
    });

    setSnake2((prevSnake2) => {
      let newDirection2 = direction2;
      if (directionQueue2.current.length > 0) {
        newDirection2 = directionQueue2.current.shift();
        setDirection2(newDirection2);
      }
      const head2 = { x: prevSnake2[0].x + newDirection2.x, y: prevSnake2[0].y + newDirection2.y };
      return [head2, ...prevSnake2.slice(0, -1)];
    });
  }, [direction1, direction2, gameOver]);

  useEffect(() => {
    const checkCollisionsAndEating = () => {
      const isOutOfBounds = (head) =>
        head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;

      const isSelfCollision = (snake) =>
        snake.slice(1).some(segment => segment.x === snake[0].x && segment.y === snake[0].y);

      if (isOutOfBounds(snake1[0]) || isSelfCollision(snake1)) {
        endGame("Blue Snake");
        return;
      }

      if (isOutOfBounds(snake2[0]) || isSelfCollision(snake2)) {
        endGame("Red Snake");
        return;
      }

      const checkEatenAnswer = (head, setSnake, setScore, otherSnakeColor) => {
        const eatenAnswerIndex = answerOptions.findIndex(
          (option) => option.x === head.x && option.y === head.y
        );

        if (eatenAnswerIndex !== -1) {
          if (answerOptions[eatenAnswerIndex].value === mathQuestion.answer) {
            setScore((prevScore) => prevScore + 1);
            setSnake((prevSnake) => [...prevSnake, {}]); // Add a new segment
          } else {
            setSnake((prevSnake) => {
              const newSnake = prevSnake.slice(0, -1);
              if (newSnake.length === 0) {
                endGame(otherSnakeColor);
              }
              return newSnake;
            });
          }
          setMathQuestion(generateMathQuestion());
          return true;
        }
        return false;
      };

      const eaten1 = checkEatenAnswer(snake1[0], setSnake1, setScore1, "Blue Snake");
      const eaten2 = checkEatenAnswer(snake2[0], setSnake2, setScore2, "Red Snake");

      if (eaten1 || eaten2) {
        setAnswerOptions(generateAnswerOptions(mathQuestion.answer));
      }
    };

    const gameLoop = () => {
      moveSnake();
      checkCollisionsAndEating();
    };

    gameLoopRef.current = setInterval(gameLoop, 200);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake, snake1, snake2, mathQuestion, answerOptions, endGame]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;

      const getNewDirection = (key, up, down, left, right) => {
        switch (key) {
          case up: return { x: 0, y: -1 };
          case down: return { x: 0, y: 1 };
          case left: return { x: -1, y: 0 };
          case right: return { x: 1, y: 0 };
          default: return null;
        }
      };

      const newDirection1 = getNewDirection(e.key, "w", "s", "a", "d");
      const newDirection2 = getNewDirection(e.key, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight");

      const updateDirectionQueue = (newDir, currentDir, queue) => {
        if (newDir && (newDir.x !== -currentDir.x || newDir.y !== -currentDir.y)) {
          queue.current = [newDir];
        }
      };

      updateDirectionQueue(newDirection1, direction1, directionQueue1);
      updateDirectionQueue(newDirection2, direction2, directionQueue2);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction1, direction2, gameOver]);

  const restartGame = () => {
    setSnake1(INITIAL_SNAKE1);
    setSnake2(INITIAL_SNAKE2);
    setDirection1(INITIAL_DIRECTION1);
    setDirection2(INITIAL_DIRECTION2);
    setMathQuestion(generateMathQuestion());
    setGameOver(false);
    setScore1(0);
    setScore2(0);
    setWinner(null);
    directionQueue1.current = [];
    directionQueue2.current = [];
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    gameLoopRef.current = setInterval(() => {
      moveSnake();
      checkCollisionsAndEating();
    }, 200);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const backToMenu = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    navigate("/Snakegame");
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div
          ref={gameContainerRef}
          className="bg-gray-800 rounded-lg shadow-lg text-white p-6 max-w-4xl w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">
              Red Snake: {score1} | Blue Snake: {score2}
            </h3>
            <button
              onClick={backToMenu}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Back to Menu
            </button>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={toggleFullScreen}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Toggle Full Screen
            </button>
          </div>

          <div className="text-center mb-6 p-3 bg-blue-600 rounded">
            <span className="text-2xl font-bold">
              {mathQuestion.question} = ?
            </span>
          </div>

          <div
            className="grid bg-gray-200 border-2 border-gray-300 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              width: `${GRID_SIZE * CELL_SIZE}px`,
              height: `${GRID_SIZE * CELL_SIZE}px`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake1 = snake1.some(
                (segment) => segment.x === x && segment.y === y
              );
              const isSnake2 = snake2.some(
                (segment) => segment.x === x && segment.y === y
              );
              const answerOption = answerOptions.find(
                (option) => option.x === x && option.y === y
              );
              return (
                <div
                  key={index}
                  className={`
                    ${isSnake1 && isSnake2 ? "bg-purple-500" : ""}
                    ${isSnake1 && !isSnake2 ? "bg-red-500" : ""}
                    ${!isSnake1 && isSnake2 ? "bg-blue-500" : ""}
                    ${answerOption ? "bg-yellow-300" : ""}
                    ${!isSnake1 && !isSnake2 && !answerOption ? "bg-gray-100" : ""}
                    flex items-center justify-center font-bold border border-gray-300
                  `}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    fontSize: answerOption ? '14px' : '10px',
                    color: answerOption ? 'black' : 'white',
                  }}
                >
                  {answerOption && answerOption.value}
                </div>
              );
            })}
          </div>
          {gameOver && (
            <div className="mt-6 text-center">
              <h4 className="mb-4 text-2xl font-bold">
                Game Over! {winner} wins!
              </h4>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4 transition duration-200"
                onClick={restartGame}
              >
                Restart Game
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                onClick={backToMenu}
              >
                Back to Menu
              </button>
            </div>
          )}
          <p className="mt-6 text-center text-sm text-gray-400">
            Red Snake: Use WASD keys | Blue Snake: Use arrow keys<br />
            Correct answers make you grow, wrong answers shrink you!<br />
            If a snake dies, the other wins! Snakes can pass through each other.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Snake2player;
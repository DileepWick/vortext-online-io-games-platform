import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Target } from "lucide-react";
import { BackgroundBeamsWithCollision } from "../ui/BackgroundBeamsWithCollision";
import Header from "../header";
import Footer from "../footer";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";

const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};
const words = `How High Can You Aim for the Equation?`;

const PuzzlePlatformGame = () => {
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 300, y: 550 });
  const [bullets, setBullets] = useState([]);
  const [health, setHealth] = useState(3);
  const [enemySpeed, setEnemySpeed] = useState(1);
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState(null);
  const [paused, setPaused] = useState(false);

  const togglePause = useCallback(() => {
    setPaused((prev) => !prev);
  }, []);

  const isOverlapping = useMemo(
    () => (enemy1, enemy2) => {
      const distance = Math.sqrt(
        Math.pow(enemy1.x - enemy2.x, 2) + Math.pow(enemy1.y - enemy2.y, 2)
      );
      return distance < 50;
    },
    []
  );

  const generateUniquePosition = useCallback(
    (existingEnemies) => {
      let newEnemy;
      do {
        newEnemy = {
          x: Math.random() * (window.innerWidth - 60) + 30,
          y: -50,
        };
      } while (existingEnemies.some((enemy) => isOverlapping(enemy, newEnemy)));
      return newEnemy;
    },
    [isOverlapping]
  );

  const generateQuestion = useCallback(() => {
    let num1, num2, operation, answer;

    const getRandomNumber = (max) => Math.floor(Math.random() * max) + 1;

    switch (difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        num1 = getRandomNumber(10 + level);
        num2 = getRandomNumber(10 + level);
        operation = Math.random() < 0.5 ? "+" : "-";
        answer = operation === "+" ? num1 + num2 : num1 - num2;
        break;
      case DIFFICULTY_LEVELS.MEDIUM:
        num1 = getRandomNumber(12 + level);
        num2 = getRandomNumber(12 + level);
        const mediumOps = ["+", "-", "*", "/"];
        operation = mediumOps[Math.floor(Math.random() * mediumOps.length)];
        switch (operation) {
          case "+":
            answer = num1 + num2;
            break;
          case "-":
            answer = num1 - num2;
            break;
          case "*":
            answer = num1 * num2;
            break;
          case "/":
            num1 = num2 * getRandomNumber(10 + level);
            answer = num1 / num2;
            break;
        }
        break;
      case DIFFICULTY_LEVELS.HARD:
        const hardOps = ["+", "-", "*", "/", "^", "√"];
        operation = hardOps[Math.floor(Math.random() * hardOps.length)];
        switch (operation) {
          case "+":
          case "-":
          case "*":
            num1 = getRandomNumber(20 + level);
            num2 = getRandomNumber(20 + level);
            answer =
              operation === "+"
                ? num1 + num2
                : operation === "-"
                ? num1 - num2
                : num1 * num2;
            break;
          case "/":
            num2 = getRandomNumber(10 + level);
            num1 = num2 * getRandomNumber(10 + level);
            answer = num1 / num2;
            break;
          case "^":
            num1 = getRandomNumber(10 + Math.floor(level / 2));
            num2 = getRandomNumber(3) + 2;
            answer = Math.pow(num1, num2);
            break;
          case "√":
            answer = getRandomNumber(10 + Math.floor(level / 2));
            num1 = answer * answer;
            num2 = null;
            break;
        }
        break;
    }

    let questionText =
      num2 !== null ? `${num1} ${operation} ${num2}` : `${operation}${num1}`;
    setQuestion(questionText);
    setCorrectAnswer(Math.round(answer * 100) / 100); // Round to 2 decimal places

    const wrongAnswers = [
      answer + getRandomNumber(5 + level),
      answer - getRandomNumber(5 + level),
      answer + getRandomNumber(10 + level) - 5,
    ].map((a) => Math.round(a * 100) / 100); // Round wrong answers too

    const allAnswers = [answer, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );

    const newEnemies = allAnswers.map((ans, index) => ({
      id: Date.now() + index,
      value: ans,
      ...generateUniquePosition([]),
    }));

    setEnemies(newEnemies);
  }, [difficulty, level, generateUniquePosition]);

  useEffect(() => {
    const newLevel = Math.floor(score / 5) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      setEnemySpeed(1 + (newLevel - 1) * 0.5);
    }
  }, [score, level]);

  useEffect(() => {
    if (difficulty && !gameOver) {
      generateQuestion();
    }
  }, [difficulty, gameOver, generateQuestion]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!paused && !gameOver) {
        e.preventDefault(); // Prevent default action
        e.returnValue = ""; // Required for Chrome to show the dialog
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [paused, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    let animationFrameId;
    const gameLoop = () => {
      if (paused) {
        animationFrameId = requestAnimationFrame(gameLoop); // Keep the loop running while paused
        return; // Exit the loop early if paused
      }
      setEnemies((prevEnemies) =>
        prevEnemies.map((enemy) => ({
          ...enemy,
          y: enemy.y + enemySpeed,
        }))
      );

      setBullets((prevBullets) =>
        prevBullets.map((bullet) => ({
          ...bullet,
          y: bullet.y - 5,
        }))
      );

      let bulletsToRemove = new Set();

      setEnemies((prevEnemies) =>
        prevEnemies.filter((enemy) => {
          const hitBullet = bullets.find(
            (bullet) =>
              Math.sqrt(
                Math.pow(bullet.x - (enemy.x + 20), 2) +
                  Math.pow(bullet.y - (enemy.y + 20), 2)
              ) < 20
          );

          if (hitBullet) {
            bulletsToRemove.add(hitBullet.id);

            if (enemy.value === correctAnswer) {
              setScore((prevScore) => prevScore + 1);
              generateQuestion();
            } else {
              setHealth((prevHealth) => {
                const newHealth = prevHealth - 1;
                if (newHealth <= 0) {
                  setGameOver(true);
                }
                return newHealth;
              });
            }

            return false;
          }

          return enemy.y < window.innerHeight;
        })
      );

      setBullets((prevBullets) =>
        prevBullets.filter(
          (bullet) => !bulletsToRemove.has(bullet.id) && bullet.y > 0
        )
      );

      if (enemies.some((enemy) => enemy.y >= playerPosition.y)) {
        setGameOver(true);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [
    enemies,
    bullets,
    correctAnswer,
    gameOver,
    generateQuestion,
    playerPosition,
    enemySpeed,
    paused,
  ]);

  const handleMouseMove = useCallback(
    (e) => {
      if (gameOver) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setPlayerPosition({
        x: e.clientX - rect.left - 25,
        y: window.innerHeight - 50,
      });
    },
    [gameOver]
  );
  const handleClick = useCallback(
    (e) => {
      // Prevent firing bullets if the game is over or paused
      if (gameOver || paused) return;

      // If the game is not paused, fire a bullet
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      // Fire a bullet at the clicked position
      setBullets((prevBullets) => [
        ...prevBullets,
        { id: Date.now(), x: clickX, y: playerPosition.y },
      ]);
    },
    [gameOver, paused, playerPosition]
  );

  const startGame = useCallback((selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setGameOver(false);
    setEnemies([]);
    setBullets([]);
    setHealth(3);
    setEnemySpeed(1);
    setLevel(1);
  }, []);

  const handlePauseClick = useCallback(() => {
    // Toggle pause state
    togglePause();
  }, [togglePause]);

  if (!difficulty) {
    return (
      <div className="bg-foreground ">
        <Header />
        <BackgroundBeamsWithCollision>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="mb-8 text-center">
              <h1 className="text-7xl font-bold text-black bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
                Mathz Blaster
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
                  onClick={() => startGame(level)} // Outer button styling
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                  <div className="px-6 py-3 bg-black rounded-[6px] relative group transition duration-200 text-white text-xl hover:bg-transparent">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </BackgroundBeamsWithCollision>

        <Footer />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full bg-gray-800 overflow-hidden"
      onMouseMove={!paused ? handleMouseMove : undefined}
      onClick={handleClick}
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Add the GameHeader component here */}
      <GameHeader
        question={question}
        score={score}
        health={health}
        level={level}
        paused={paused}
        onTogglePause={handlePauseClick}
      />

      {/* Player Character */}
      <div
        className="absolute w-[50px] h-[50px] bg-blue-500"
        style={{ left: `${playerPosition.x}px`, top: `${playerPosition.y}px` }}
      >
        <Target className="w-full h-full text-white" />
      </div>

      {/* Render Enemies */}
      {enemies.map((enemy) => (
        <div
          key={enemy.id}
          className="absolute w-[40px] h-[40px] bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
          style={{ left: `${enemy.x}px`, top: `${enemy.y}px` }}
        >
          {enemy.value}
        </div>
      ))}

      {/* Render Bullets */}
      {bullets.map((bullet) => (
        <div
          key={bullet.id}
          className="absolute w-[5px] h-[10px] bg-yellow-400"
          style={{ left: `${bullet.x}px`, top: `${bullet.y}px` }}
        />
      ))}

      {/* Display Pause Screen */}
      {paused && (
        <PauseScreen
          onResume={togglePause}
          onRestart={() => startGame(difficulty)}
        />
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
          <p className="text-2xl text-white mb-4">Your Score: {score}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
            onClick={() => startGame(difficulty)}
          >
            Play Again
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setDifficulty(null)}
          >
            Change Difficulty
          </button>
        </div>
      )}
    </div>
  );
};

const PauseScreen = ({ onResume, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
      <h2 className="text-4xl font-bold text-white mb-4">Paused</h2>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        onClick={onResume}
      >
        Resume
      </button>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={onRestart}
      >
        Restart
      </button>
    </div>
  );
};

const GameHeader = ({
  question,
  score,
  health,
  level,
  paused,
  onTogglePause,
}) => {
  const handlePauseClick = (e) => {
    e.stopPropagation(); // Prevent click event from bubbling up
    onTogglePause(); // Call the toggle pause function
  };
  return (
    <div className="absolute top-0 left-0 w-full flex justify-between items-center bg-gray-800 text-white p-4">
      <div className="flex items-center space-x-4">
        <span className="text-lg font-bold">Health: {health}</span>
        <span className="text-lg font-bold">Level: {level}</span>
        <button
          onClick={handlePauseClick}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div className="text-xl font-bold">{question} = ?</div>
      <div className="text-lg font-bold">Score: {score}</div>
    </div>
  );
};

export default PuzzlePlatformGame;

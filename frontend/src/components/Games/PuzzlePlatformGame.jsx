import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaTrophy } from "react-icons/fa"; // Ensure the import is correct
import { useNavigate } from "react-router-dom"; // Import useHistory for navigation
import axios from "axios";
import { Loader, Target } from "lucide-react";
import { MathzBlasterScore } from "../../../../backend/models/MathzBlasterScore";
import { BackgroundBeamsWithCollision } from "../ui/BackgroundBeamsWithCollision";
import Header from "../header";
import Footer from "../footer";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import ScrollToTop from "../ScrollToTop";
import { getToken } from "../../utils/getToken";
import { getUserIdFromToken } from "../../utils/user_id_decoder";
import { Button } from "@nextui-org/react";
import useAuthCheck from "../../utils/authCheck";
import usePreventNavigation from "../PreventNavigation";

const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};
const words = `How High Can You Aim for the Equation?`;

const PuzzlePlatformGame = () => {
  useAuthCheck();
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
  const [startTime, setStartTime] = useState(null);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [transform, setTransform] = useState("translate(0, 0)"); // Default position
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (e) => {
    const { clientX, clientY, target } = e;
    const { left, top, width, height } = target.getBoundingClientRect();

    const x = clientX - (left + width / 2); // Mouse position relative to the center of the button
    const y = clientY - (top + height / 2);

    // Determine the direction of the hover
    if (Math.abs(x) > Math.abs(y)) {
      // Horizontal hover
      if (x > 0) {
        // Hovering from the left
        setTransform("translate(-10px, 0)"); // Move left
      } else {
        // Hovering from the right
        setTransform("translate(10px, 0)"); // Move right
      }
    } else {
      // Vertical hover
      if (y > 0) {
        // Hovering from the top
        setTransform("translate(0, -10px)"); // Move down
      } else {
        // Hovering from the bottom
        setTransform("translate(0, 10px)"); // Move up
      }
    }
  };

  const handleMouseLeave = () => {
    setTransform("translate(0, 0)"); // Reset to default position
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);
        console.log("User ID:", userId);
        const response = await axios.get(
          "http://localhost:8098/users/allusers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("User profile fetched:", response.data);
        setUserData({
          userId: response.data._id,
          username: response.data.username,
          email: response.data.email,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const saveGameStats = async (score, playtime, level, difficulty) => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);

      const response = await axios.post(
        "http://localhost:8098/mathzblaster/save",
        { userId, score, playtime, level, difficulty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Game stats saved:", response.data);
    } catch (error) {
      console.error("Error saving game stats:", error);
    }
  };

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

  const generateUniquePosition = useCallback((existingEnemies) => {
    const margin = 50; // Margin from the edges of the screen
    const enemySize = 40; // Size of the enemy
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop

    while (attempts < maxAttempts) {
      const newEnemy = {
        x:
          Math.random() * (window.innerWidth - 2 * margin - enemySize) + margin,
        y: -50 - Math.random() * 100, // Randomize initial vertical position above the screen
      };

      // Check collision with existing enemies
      const collision = existingEnemies.some(
        (enemy) =>
          Math.abs(enemy.x - newEnemy.x) < enemySize &&
          Math.abs(enemy.y - newEnemy.y) < enemySize
      );

      if (!collision) {
        return newEnemy;
      }

      attempts++;
    }

    // If we couldn't find a non-colliding position, return null
    return null;
  }, []);

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

    const newEnemies = [];
    for (let i = 0; i < allAnswers.length; i++) {
      const position = generateUniquePosition(newEnemies);
      if (position) {
        newEnemies.push({
          id: Date.now() + i,
          value: allAnswers[i],
          ...position,
        });
      }
    }
    setEnemies(newEnemies);
  }, [difficulty, level, generateUniquePosition]);

  useEffect(() => {
    const newLevel = Math.floor(score / 5) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      setEnemySpeed(0.5 + (newLevel - 1) * 0.5);
    }
  }, [score, level]);

  useEffect(() => {
    if (difficulty && !gameOver) {
      generateQuestion();
    }
  }, [difficulty, gameOver, generateQuestion]);

  usePreventNavigation(!paused && !gameOver);

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
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
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

      setEnemies((prevEnemies) => {
        let enemiesOffScreen = false;
        const updatedEnemies = prevEnemies.filter((enemy) => {
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

          if (enemy.y >= window.innerHeight) {
            enemiesOffScreen = true;
            return false;
          }

          return true;
        });

        if (enemiesOffScreen) {
          setHealth((prevHealth) => {
            const newHealth = prevHealth - 1;
            if (newHealth <= 0) {
              setGameOver(true);
            } else {
              generateQuestion(); // Generate a new question when enemies fall off screen
            }
            return newHealth;
          });
        }

        return updatedEnemies;
      });

      setBullets((prevBullets) =>
        prevBullets.filter(
          (bullet) => !bulletsToRemove.has(bullet.id) && bullet.y > 0
        )
      );

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

  const endGame = async () => {
    setGameOver(true);
    const endTime = Date.now();
    const playtime = Math.round((endTime - startTime) / 1000);

    if (userData) {
      console.log("Saving game stats:", { score, playtime, level, difficulty });
      await saveGameStats(score, playtime, level, difficulty);
    } else {
      console.log("No user data available, score not saved");
    }
  };

  const startGame = useCallback(
    (selectedDifficulty) => {
      setDifficulty(selectedDifficulty);
      setScore(0);
      setGameOver(false);
      setEnemies([]);
      setBullets([]);
      setHealth(3);
      setEnemySpeed(0.5);
      setLevel(1);
      setStartTime(Date.now());
      setPaused(false); // Ensure the game is unpaused when starting
      generateQuestion(); // Make sure to generate the first question
    },
    [difficulty, generateQuestion]
  );
  const restartGame = useCallback(() => {
    startGame(difficulty);
    setPaused(false); // Explicitly unpause the game when restarting
  }, [startGame, difficulty]);

  useEffect(() => {
    if (gameOver) {
      endGame();
    }
  }, [gameOver, endGame]);

  const handleLeaderboardClick = () => {
    // Log userData to check if it's correctly set
    console.log("userData before navigating:", userData);

    // Ensure userData is defined
    if (userData) {
      navigate("/leaderboard", { state: { currentUser: userData.userId } });
    } else {
      console.error("User data not available.");
    }
  };

  const handlePauseClick = useCallback(() => {
    // Toggle pause state
    togglePause();
  }, [togglePause]);

  // if (!userData) {
  //   return (
  //     <div>
  //       <Loader />
  //     </div>
  //   );
  // }

  if (!difficulty) {
    return (
      <div className="bg-foreground ">
        <ScrollToTop />
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
            <button
              className="shadow-[0_0_0_3px_#000000_inset] px-6 py-4 bg-black border border-black dark:border-white dark:text-white text-white text-sm rounded-lg font-bold transform transition duration-400 mt-4 hover:bg-transparent flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleLeaderboardClick} // Handle the button click
            >
              <FaTrophy className="mr-2" />
              <span>Leaderboard</span>
            </button>
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
        difficulty={difficulty}
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
            className="p-[3px] relative m-5"
            onClick={() => startGame(difficulty)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
            <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
              Play Again
            </div>
          </button>
          <button
            className="p-[3px] relative"
            onClick={() => setDifficulty(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
            <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
              Change Difficulty
            </div>
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
      <button className="p-[3px] relative m-5" onClick={onResume}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
        <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
          Resume
        </div>
      </button>
      <button className="p-[3px] relative" onClick={onRestart}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
        <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
          Restart
        </div>
      </button>
    </div>
  );
};

const GameHeader = ({
  question,
  score,
  health,
  difficulty,
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
        <span className="text-lg font-bold">Difficulty: {difficulty}</span>
        <button className="p-[3px] relative" onClick={handlePauseClick}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
          <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
            {paused ? "Resume" : "Pause"}
          </div>
        </button>
      </div>
      <div className="text-xl font-bold">{question} = ?</div>
      <div className="text-lg font-bold">Score: {score}</div>
    </div>
  );
};

export default PuzzlePlatformGame;

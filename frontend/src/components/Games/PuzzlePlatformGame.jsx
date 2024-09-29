import React, { useState, useEffect, useCallback } from "react";
import { Target } from "lucide-react";

const PuzzlePlatformGame = () => {
  // Game state hooks
  const [score, setScore] = useState(0); // Player's score
  const [question, setQuestion] = useState(""); // Current math question
  const [correctAnswer, setCorrectAnswer] = useState(null); // Correct answer to the question
  const [enemies, setEnemies] = useState([]); // Array of enemy objects
  const [gameOver, setGameOver] = useState(false); // Flag for game over state
  const [playerPosition, setPlayerPosition] = useState({ x: 300, y: 550 }); // Player's position
  const [bullets, setBullets] = useState([]); // Array of bullets shot by the player
  const [health, setHealth] = useState(3); // Player's health points
  const [enemySpeed, setEnemySpeed] = useState(1);
  const [level, setLevel] = useState(1);

  // Helper function to check if two enemies are overlapping
  const isOverlapping = (enemy1, enemy2) => {
    const distance = Math.sqrt(
      Math.pow(enemy1.x - enemy2.x, 2) + Math.pow(enemy1.y - enemy2.y, 2)
    );
    return distance < 50; // Ensure at least a 50px gap between enemies
  };

  // Function to generate a unique enemy position that does not overlap with others
  const generateUniquePosition = (existingEnemies) => {
    let newEnemy;
    do {
      // Randomize enemy position within window boundaries
      newEnemy = {
        x: Math.random() * (window.innerWidth - 60) + 30,
        y: -50, // Spawn above the screen
      };
    } while (
      existingEnemies.some((enemy) => isOverlapping(enemy, newEnemy)) // Avoid overlap
    );
    return newEnemy;
  };

  // Generate a new math question and create enemy positions with answers
  const generateQuestion = useCallback(() => {
    const num1 = Math.floor(Math.random() * 10) + 1; // Random number 1
    const num2 = Math.floor(Math.random() * 10) + 1; // Random number 2
    const operation = Math.random() < 0.5 ? "+" : "-"; // Randomly choose between addition and subtraction
    let answer;

    // Calculate correct answer based on chosen operation
    if (operation === "+") {
      answer = num1 + num2;
    } else {
      answer = num1 - num2;
    }

    setQuestion(`${num1} ${operation} ${num2}`); // Update question text
    setCorrectAnswer(answer); // Set the correct answer

    // Generate a few wrong answers for the enemies
    const wrongAnswers = [
      answer + Math.floor(Math.random() * 5) + 1, // Slightly off answer
      answer - Math.floor(Math.random() * 5) + 1, // Another wrong answer
      answer + Math.floor(Math.random() * 10) - 5, // Random incorrect answer
    ];

    // Shuffle the correct and wrong answers together
    const allAnswers = [answer, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );

    // Map answers to enemies with unique positions
    const newEnemies = allAnswers.map((ans, index) => ({
      id: Date.now() + index, // Unique ID for each enemy
      value: ans, // Set answer as the value displayed on the enemy
      ...generateUniquePosition([]), // Assign a random unique position
    }));

    setEnemies(newEnemies); // Update the enemies state
  }, []);

  useEffect(() => {
    // Increase level and speed every 5 points
    const newLevel = Math.floor(score / 5) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      setEnemySpeed(1 + (newLevel - 1) * 0.5); // Increase speed by 0.5 for each level
    }
  }, [score, level]);

  // Effect to generate a question when the game starts or when it's not over
  useEffect(() => {
    if (!gameOver) {
      generateQuestion(); // Generate a new question
    }
  }, [gameOver, generateQuestion]);

  // Main game loop to handle enemy movement, bullet movement, and collisions
  useEffect(() => {
    if (gameOver) return; // Stop the game loop if the game is over

    const gameLoop = setInterval(() => {
      setEnemies((prevEnemies) =>
        prevEnemies.map((enemy) => ({
          ...enemy,
          y: enemy.y + enemySpeed,
        }))
      );

      // Move bullets upwards
      setBullets((prevBullets) =>
        prevBullets.map((bullet) => ({
          ...bullet,
          y: bullet.y - 5, // Decrease bullet y position
        }))
      );

      // Check for bullet collisions with enemies
      setEnemies((prevEnemies) =>
        prevEnemies.filter((enemy) => {
          // Find if a bullet hits an enemy
          const hitBullet = bullets.find(
            (bullet) =>
              Math.sqrt(
                Math.pow(bullet.x - (enemy.x + 20), 2) +
                  Math.pow(bullet.y - (enemy.y + 20), 2)
              ) < 20 // Check if bullet is within 20px of enemy center
          );

          if (hitBullet) {
            // Remove the bullet that hit the target
            setBullets((prevBullets) =>
              prevBullets.filter((bullet) => bullet !== hitBullet)
            );

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

            return false; // Remove the enemy
          }

          return enemy.y < window.innerHeight;
        })
      );

      // Remove bullets that have gone off screen
      setBullets((prevBullets) => prevBullets.filter((bullet) => bullet.y > 0));

      // End the game if any enemy reaches the player position
      if (enemies.some((enemy) => enemy.y >= playerPosition.y)) {
        setGameOver(true); // Set game over if enemy hits player
      }
    }, 50); // Run game loop every 50ms

    return () => clearInterval(gameLoop); // Clean up on unmount
  }, [
    enemies,
    bullets,
    correctAnswer,
    gameOver,
    generateQuestion,
    playerPosition,
    enemySpeed,
  ]);

  // Handle player movement with mouse
  const handleMouseMove = (e) => {
    if (gameOver) return; // Prevent movement if game is over
    const rect = e.currentTarget.getBoundingClientRect();
    setPlayerPosition({
      x: e.clientX - rect.left - 25, // Set player x position based on mouse
      y: window.innerHeight - 50, // Fixed y position for player
    });
  };

  // Handle player shooting (mouse click)
  const handleClick = () => {
    if (gameOver) return; // Prevent shooting if game is over
    setBullets((prevBullets) => [
      ...prevBullets,
      { x: playerPosition.x + 25, y: playerPosition.y }, // Add new bullet at player's position
    ]);
  };

  // Restart the game by resetting state values
  const restartGame = () => {
    setScore(0); // Reset score
    setGameOver(false); // Remove game over state
    setEnemies([]); // Clear enemies
    setBullets([]); // Clear bullets
    setHealth(3); // Reset player health
    generateQuestion(); // Generate a new question
  };

  return (
    <div
      className="relative w-full h-full bg-gray-800 overflow-hidden"
      onMouseMove={handleMouseMove} // Track mouse movement
      onClick={handleClick} // Handle player shooting
      style={{ width: "100vw", height: "100vh" }} // Full screen width and height
    >
      {/* Player Character */}
      <div
        className="absolute w-[50px] h-[50px] bg-blue-500"
        style={{ left: `${playerPosition.x}px`, top: `${playerPosition.y}px` }} // Update position dynamically
      >
        <Target className="w-full h-full text-white" /> {/* Player icon */}
      </div>

      {/* Render Enemies */}
      {enemies.map((enemy) => (
        <div
          key={enemy.id}
          className="absolute w-[40px] h-[40px] bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
          style={{ left: `${enemy.x}px`, top: `${enemy.y}px` }} // Position each enemy
        >
          {enemy.value} {/* Display enemy's value (math answer) */}
        </div>
      ))}

      {/* Render Bullets */}
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className="absolute w-[5px] h-[10px] bg-yellow-400"
          style={{ left: `${bullet.x}px`, top: `${bullet.y}px` }} // Position each bullet
        />
      ))}

      {/* Display Question */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded">
        <span className="text-2xl font-bold text-black">{question} = ?</span>
      </div>

      {/* Display Score */}
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded">
        <span className="text-xl font-bold text-black">Score: {score}</span>
      </div>

      {/* Display Health */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded">
        <span className="text-xl font-bold text-black">Health: {health}</span>
      </div>
      {/* Display Level */}
      <div className="absolute top-16 left-4 bg-white px-4 py-2 rounded">
        <span className="text-xl font-bold">Level: {level}</span>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
          <p className="text-2xl text-white mb-4">Your Score: {score}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={restartGame} // Restart game on click
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PuzzlePlatformGame;

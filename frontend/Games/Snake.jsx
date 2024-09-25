import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 30;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const generateMathQuestion = () => {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let a, b, answer;

  switch (operation) {
    case '+':
      a = Math.floor(Math.random() * 20);
      b = Math.floor(Math.random() * 20);
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 20) + 20;
      b = Math.floor(Math.random() * 20);
      answer = a - b;
      break;
    case '*':
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
  return options.sort(() => Math.random() - 0.5).map((value, index) => ({
    value,
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  }));
};

const Snake = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [mathQuestion, setMathQuestion] = useState(generateMathQuestion());
  const [answerOptions, setAnswerOptions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    setAnswerOptions(generateAnswerOptions(mathQuestion.answer));
  }, [mathQuestion]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    if (newSnake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    const eatenAnswerIndex = answerOptions.findIndex(option => 
      option.x === head.x && option.y === head.y
    );

    if (eatenAnswerIndex !== -1) {
      if (answerOptions[eatenAnswerIndex].value === mathQuestion.answer) {
        setScore(prevScore => prevScore + 1);
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
        case 'ArrowUp':
          newDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          newDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          newDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          newDirection = { x: 1, y: 0 };
          break;
        default:
          return;
      }

      if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center" style={{ backgroundColor: '#1a202c' }}>
      <div className="bg-gray-800 rounded-lg shadow-lg text-white p-4" style={{ backgroundColor: '#2d3748' }}>
        <h3 className="text-center mb-4 text-xl font-bold" style={{ color: '#ffffff' }}>
          Score: {score} | High Score: {highScore}
        </h3>
        
        {/* New Question Display Area */}
        <div className="text-center mb-4 p-2 bg-blue-500 rounded" style={{ backgroundColor: '#4299e1' }}>
          <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>
            Question: {mathQuestion.question}
          </span>
        </div>

        <div 
          className="grid bg-gray-200 border-2 border-gray-300 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`,
            backgroundColor: '#edf2f7',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const answerOption = answerOptions.find(option => option.x === x && option.y === y);
            return (
              <div
                key={index}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: isSnake ? '#000000' : (answerOption ? '#4299e1' : 'transparent'),
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: isSnake ? '#ffffff' : '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                {answerOption && answerOption.value}
              </div>
            );
          })}
        </div>
        {gameOver && (
          <div className="mt-4 text-center">
            <h4 className="mb-2 text-lg font-bold" style={{ color: '#ffffff' }}>Game Over!</h4>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={restartGame}
              style={{ backgroundColor: '#4299e1', color: '#ffffff' }}
            >
              Restart Game
            </button>
          </div>
        )}
        <p className="mt-4 text-center text-sm" style={{ color: '#a0aec0' }}>
          Use arrow keys to control the snake. Eat correct answers to grow, wrong answers make you smaller!
        </p>
      </div>
    </div>
  );
};

export default Snake;
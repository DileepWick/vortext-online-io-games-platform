import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";

const colors = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
];

const ColorGuessingGame = () => {
  const [currentColor, setCurrentColor] = useState(null);
  const [options, setOptions] = useState([]);
  const [health, setHealth] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  const generateQuestion = () => {
    const correctColor = colors[Math.floor(Math.random() * colors.length)];
    const incorrectColors = colors.filter(color => color !== correctColor);
    const shuffledOptions = [
      correctColor,
      ...incorrectColors.sort(() => 0.5 - Math.random()).slice(0, 2)
    ].sort(() => 0.5 - Math.random());
    setCurrentColor(correctColor);
    setOptions(shuffledOptions);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAnswer = (selectedColor) => {
    if (selectedColor.name === currentColor.name) {
      setScore(prevScore => prevScore + 1);
      setHealth(prevHealth => Math.min(prevHealth + 1, 3));
      setMessage('Correct! Well done!');
      generateQuestion();
    } else {
      setHealth(prevHealth => prevHealth - 1);
      setMessage(`Oops! That's not correct. The color was ${currentColor.name}.`);
      if (health <= 1) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
        }
      } else {
        generateQuestion();
      }
    }
  };

  const restartGame = () => {
    setHealth(3);
    setScore(0);
    setGameOver(false);
    setMessage('');
    generateQuestion();
  };

  const containerStyle = {
    width: '384px', 
    margin: '32px auto', 
    padding: '16px', 
    border: '1px solid #ccc', 
    borderRadius: '8px',
    color: 'black'
  };

  const buttonStyle = {
    padding: '8px 16px', 
    backgroundColor: '#007bff', 
    color: 'black',
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer',
    marginBottom: '8px'
  };

  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      if (i < health) {
        hearts.push(<FaHeart key={i} color="red" size={24} style={{ marginRight: '4px' }} />);
      } else {
        hearts.push(<FaRegHeart key={i} color="red" size={24} style={{ marginRight: '4px' }} />);
      }
    }
    return hearts;
  };

  if (gameOver) {
    return (
      <div style={containerStyle}>
        <h2>Game Over!</h2>
        <p>Your score: {score}</p>
        <p>High score: {highScore}</p>
        <button onClick={restartGame} style={buttonStyle}>Play Again</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>Guess the Color!</h2>
      <div 
        style={{ 
          width: '128px', 
          height: '128px', 
          borderRadius: '50%', 
          margin: '0 auto 16px', 
          backgroundColor: currentColor?.hex 
        }}
      ></div>
      <p>What color is this?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((color) => (
          <button 
            key={color.name} 
            onClick={() => handleAnswer(color)}
            style={buttonStyle}
          >
            {color.name}
          </button>
        ))}
      </div>
      {message && (
        <div style={{ marginTop: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Result</h3>
          <p>{message}</p>
        </div>
      )}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>Health:</span>
        <div style={{ display: 'flex' }}>{renderHearts()}</div>
      </div>
      <p>Score: {score}</p>
      <p>High Score: {highScore}</p>
    </div>
  );
};

export default ColorGuessingGame;
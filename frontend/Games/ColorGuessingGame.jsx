import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Header from "../src/components/header";
import Footer from "../src/components/footer";

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

const ColorGuessingGame = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [currentColor, setCurrentColor] = useState(easyColors[0]);
  const [options, setOptions] = useState([]);
  const [health, setHealth] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  const generateQuestion = () => {
    let colorSet, questionType;

    switch (difficulty) {
      case 'easy':
        colorSet = easyColors;
        questionType = 'single';
        break;
      case 'medium':
        colorSet = mediumColors;
        questionType = 'single';
        break;
      case 'hard':
        colorSet = hardColors;
        questionType = 'single';
        break;
      case 'expert':
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
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty]);

  const handleAnswer = (selectedColor) => {
    const isCorrect = difficulty === 'expert'
      ? selectedColor.name === currentColor.result
      : selectedColor.name === currentColor.name;

      if (isCorrect) {
        setScore(prevScore => prevScore + 1);
        setMessage('Correct! Well done!');
        generateQuestion();
      } else {
        setHealth(prevHealth => Math.max(prevHealth - 1, 0));
      setMessage(`Oops! That's not correct. ${
        difficulty === 'expert'
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
    color: 'white',
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
    <div>
      <Header />
      <div style={containerStyle}>
        <h2>Guess the Color!</h2>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="difficulty">Difficulty: </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{ marginLeft: '8px' }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        {currentColor && (
          difficulty === 'expert' ? (
            <div>
              <p>What color do you get when you combine:</p>
              <p style={{ fontWeight: 'bold' }}>{currentColor.components?.join(' + ') || 'Loading...'}</p>
            </div>
          ) : (
            <div 
              style={{ 
                width: '128px', 
                height: '128px', 
                borderRadius: '50%', 
                margin: '0 auto 16px', 
                backgroundColor: currentColor.hex 
              }}
            ></div>
          )
        )}
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
      <Footer />
    </div>
  );
};

export default ColorGuessingGame;
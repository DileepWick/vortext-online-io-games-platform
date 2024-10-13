import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GRID_SIZE = 15;
const ALL_WORDS = {
  animals: ['DOG', 'CAT', 'ELEPHANT', 'GIRAFFE', 'LION', 'TIGER', 'ZEBRA', 'MONKEY', 'PANDA', 'KOALA'],
  vehicles: ['CAR', 'TRUCK', 'BUS', 'MOTORCYCLE', 'BICYCLE', 'TRAIN', 'AIRPLANE', 'BOAT', 'SCOOTER', 'HELICOPTER'],
  Foods: ['RICE', 'WHEAT', 'CORN', 'BARLEY', 'OATS', 'MILLET', 'SORGHUM', 'QUINOA', 'AMARANTH', 'BUCKWHEAT'],
  computerParts: ['CPU', 'RAM', 'GPU', 'SSD', 'HDD', 'MOTHERBOARD', 'KEYBOARD', 'MOUSE', 'MONITOR', 'SPEAKER'],
  programmingLanguages: ['PYTHON', 'JAVA', 'JAVASCRIPT', 'CSHARP', 'RUBY', 'PHP', 'SWIFT', 'KOTLIN', 'RUST', 'GOLANG']
};

const DIFFICULTY_LEVELS = {
  1: { name: 'Animals', words: ALL_WORDS.animals, timeLimit: 600 },
  2: { name: 'Vehicles', words: ALL_WORDS.vehicles, timeLimit: 440 },
  3: { name: 'Foods', words: ALL_WORDS.Foods, timeLimit: 300 },
  4: { name: 'Computer Parts', words: ALL_WORDS.computerParts, timeLimit: 200 },
  5: { name: 'Programming Languages', words: ALL_WORDS.programmingLanguages, timeLimit: 180 }
};

const MAX_WRONG_SELECTIONS = 10;

const generateGrid = (words) => {
  const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''));
  const directions = [
    [0, 1], [1, 0], [1, 1], [-1, -1], [-1, 0], [0, -1], [1, -1], [-1, 1]
  ];

  const placeWord = (word) => {
    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
    let row, col;
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    } while (!canPlaceWord(word, row, col, dx, dy));

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

  useEffect(() => {
    if (foundWords.length === gameWords.length && !gameOver) {
      setGameOver(true);
      const timeBonus = timeLeft * 10;
      const newScore = score + timeBonus;
      setScore(newScore);
      setMessage(`Congratulations! You've found all words. Your final score is ${newScore}`);
    }
  }, [foundWords, gameWords, gameOver, score, timeLeft]);

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

  const renderHomeButton = () => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleHomeClick}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '5px 15px',
        fontSize: '0.9em',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        zIndex: 10
      }}
    >
      Home
    </motion.button>
  );

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

  const isLetterSelected = (row, col) => {
    return selectedLetters.some(pos => pos.row === row && pos.col === col);
  };

  if (!gameStarted) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f3f5',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            color: '#2c3e50',
            fontSize: '3em',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textAlign: 'center'
          }}
        >
          Word Search Game
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ 
            color: '#34495e', 
            marginBottom: '20px',
            fontSize: '1.5em',
            textAlign: 'center'
          }}
        >
          Select Level
        </motion.h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '600px'
        }}>
          {Object.entries(DIFFICULTY_LEVELS).map(([key, value], index) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, backgroundColor: '#2980b9' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLevelSelect(parseInt(key))}
              style={{
                margin: '8px',
                padding: '12px 24px',
                fontSize: '1em',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {`Level ${key}: ${value.name}`}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f3f5',
      padding: '10px',
      borderRadius: '10px',
      width: '98%',
      maxWidth: '1200px',
      margin: '10px auto',
      position: 'relative',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 20px)'
    }}>
      {renderHomeButton()}
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          color: '#2c3e50',
          fontSize: '1.5em',
          marginBottom: '10px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}
      >
        Word Search: {DIFFICULTY_LEVELS[level].name.toUpperCase()}
      </motion.h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1, overflow: 'hidden' }}>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ 
            width: '30%',
            minWidth: '200px',
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginRight: '10px',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '1em' }}>Words to Find:</h3>
          {gameWords.map((word, index) => (
            <motion.div 
              key={word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                margin: '5px 0',
                padding: '8px',
                backgroundColor: foundWords.includes(word) ? '#e8f5e9' : '#fff9c4',
                borderRadius: '5px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: foundWords.includes(word) ? '#4caf50' : '#ffa000',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                fontSize: '0.9em'
              }}
            >
              {word}
            </motion.div>
          ))}
          <div style={{ marginTop: '20px', fontSize: '0.9em' }}>
            <p style={{ color: '#34495e', fontWeight: 'bold' }}>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
            <p style={{ color: '#34495e', fontWeight: 'bold' }}>Score: {score}</p>
            <p style={{ color: '#34495e', fontWeight: 'bold' }}>Hints Left: {hints}</p>
            <p style={{ color: '#34495e', fontWeight: 'bold' }}>Wrong Selections: {wrongSelections} / {MAX_WRONG_SELECTIONS}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHintClick}
              disabled={hints === 0 || gameOver}
              style={{
                padding: '8px 16px',
                fontSize: '0.9em',
                backgroundColor: hints > 0 && !gameOver ? '#f39c12' : '#bdc3c7',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                cursor: hints > 0 && !gameOver ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                marginTop: '10px'
              }}
            >
              Use Hint
            </motion.button>
          </div>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#e8f5e9',
                borderRadius: '5px',
                color: '#4caf50',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '0.9em'
              }}
            >
              {message}
            </motion.div>
          )}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ 
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflowY: 'auto'
          }}
        >
          <div>
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center' }}>
                {row.map((cell, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLetterClick(rowIndex, colIndex)}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #3498db',
                      margin: '1px',
                      cursor: 'pointer',
                      backgroundColor: isLetterHighlighted(rowIndex, colIndex) ? '#2ecc71' : 
                                       isLetterSelected(rowIndex, colIndex) ? '#f39c12' : 'white',
                      color: (isLetterHighlighted(rowIndex, colIndex) || isLetterSelected(rowIndex, colIndex)) ? 'white' : '#2c3e50',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      fontSize: '0.8em',
                      borderRadius: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
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
  );
};

export default WordSearch;
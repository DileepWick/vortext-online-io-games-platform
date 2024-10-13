import React, { useState, useEffect, useRef } from 'react';
import useAuthCheck from "../../utils/authCheck";

const AdvancedEducationalRockPaperScissors = () => {
  useAuthCheck();
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [roundCount, setRoundCount] = useState(0);
  const [gameMode, setGameMode] = useState('endless');
  const [thinking, setThinking] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [powerUp, setPowerUp] = useState(null);
  const [theme, setTheme] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [wordGuess, setWordGuess] = useState('');
  const chatBoxRef = useRef(null);

  // Enhanced educational game states
  const [hiddenWord, setHiddenWord] = useState('');
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [hint, setHint] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const [wordList, setWordList] = useState([
    { word: 'SCIENCE', hint: 'The study of the natural world through observation and experimentation' },
    { word: 'MATH', hint: 'The study of numbers, quantities, and shapes' },
    { word: 'HISTORY', hint: 'The study of past events and human affairs' },
    { word: 'GEOGRAPHY', hint: 'The study of Earth\'s landscapes, peoples, places, and environments' },
    { word: 'LITERATURE', hint: 'Written works, especially those considered of superior or lasting artistic merit' },
    { word: 'BIOLOGY', hint: 'The study of living organisms and their interactions' },
    { word: 'CHEMISTRY', hint: 'The study of matter, its properties, and how it interacts with energy' },
    { word: 'PHYSICS', hint: 'The study of matter, energy, and their interactions' },
    { word: 'ASTRONOMY', hint: 'The study of celestial objects, space, and the physical universe' },
    { word: 'TECHNOLOGY', hint: 'The application of scientific knowledge for practical purposes' }
  ]);

  const choices = ['rock', 'paper', 'scissors'];

  const difficultyLevels = {
    easy: 0.3,
    medium: 0.5,
    hard: 0.7
  };

  const themes = {
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      buttonColor: 'linear-gradient(45deg, #FF9A8B, #FF6A88)',
      textColor: '#ffffff',
      choiceButtonColor: 'linear-gradient(135deg, #FF9A8B, #764ba2)'
    },
    dark: {
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      buttonColor: 'linear-gradient(45deg, #e74c3c, #c0392b)',
      textColor: '#ecf0f1',
      choiceButtonColor: 'linear-gradient(135deg, #e74c3c, #34495e)'
    },
    light: {
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      buttonColor: 'linear-gradient(45deg, #4facfe, #00f2fe)',
      textColor: '#2c3e50',
      choiceButtonColor: 'linear-gradient(135deg, #4facfe, #fda085)'
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      addMessage('computer', "Welcome to the Advanced Educational Rock Paper Scissors! Type 'help' for information. Let's learn while we play!");
      selectNewWord();
    }, 3000);
  }, []);

  useEffect(() => {
    if (result === 'You win!') {
      setShowFireworks(true);
      setCelebrationMessage('Congratulations! You won!');
      setTimeout(() => {
        setShowFireworks(false);
        setCelebrationMessage('');
      }, 3000);
      revealLetter();
      setConsecutiveWins(prev => prev + 1);
      if (consecutiveWins + 1 >= 3) {
        addMessage('computer', "Wow! You're on fire! 🔥 Here's a bonus hint: " + hint);
        setConsecutiveWins(0);
      }
    } else if (result === 'Computer wins!') {
      setConsecutiveWins(0);
    }
  }, [result]);

  useEffect(() => {
    if (gameMode === 'best-of-5' && (score.player === 3 || score.computer === 3)) {
      setResult(score.player === 3 ? 'You won the game!' : 'Computer won the game!');
      if (score.player === 3) {
        addMessage('computer', `Congratulations! You've won the game and the word was: ${hiddenWord}. The full hint was: ${hint}`);
      } else {
        addMessage('computer', `Game over! The hidden word was: ${hiddenWord}. The hint was: ${hint}`);
      }
      selectNewWord();
    }
  }, [score, gameMode]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const selectNewWord = () => {
    const newWordObject = wordList[Math.floor(Math.random() * wordList.length)];
    setHiddenWord(newWordObject.word);
    setHint(newWordObject.hint);
    setRevealedLetters(new Array(newWordObject.word.length).fill(false));
    setHintUsed(false);
    addMessage('computer', `A new word has been selected. It has ${newWordObject.word.length} letters. Win rounds to reveal letters or guess the word!`);
  };

  const revealLetter = () => {
    const hiddenIndices = revealedLetters.reduce((acc, revealed, index) => {
      if (!revealed) acc.push(index);
      return acc;
    }, []);

    if (hiddenIndices.length > 0) {
      const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
      const newRevealedLetters = [...revealedLetters];
      newRevealedLetters[randomIndex] = true;
      setRevealedLetters(newRevealedLetters);

      if (newRevealedLetters.every(revealed => revealed)) {
        addMessage('computer', `Congratulations! You've revealed the entire word: ${hiddenWord}. The hint was: ${hint}`);
        selectNewWord();
      } else {
        addMessage('computer', `Great job! You've revealed a new letter in the word.`);
      }
    }
  };

  const useHint = () => {
    if (!hintUsed) {
      addMessage('computer', `Hint: ${hint}`);
      setHintUsed(true);
    } else {
      addMessage('computer', "You've already used the hint for this word.");
    }
  };

  const playGame = (choice) => {
    setThinking(true);
    setIsAnimating(true);
    setPlayerChoice(choice);

    setTimeout(() => {
      let computerChoice;
      if (Math.random() < difficultyLevels[difficulty]) {
        const winningChoice = choices[(choices.indexOf(choice) + 1) % 3];
        computerChoice = winningChoice;
      } else {
        computerChoice = choices[Math.floor(Math.random() * choices.length)];
      }

      setComputerChoice(computerChoice);
      setThinking(false);

      if (choice === computerChoice) {
        setResult("It's a tie!");
        addMessage('computer', "It's a tie! Here's a fun fact: Did you know that in some variations of Rock Paper Scissors, additional moves like 'Lizard' and 'Spock' are added?");
      } else if (
        (choice === 'rock' && computerChoice === 'scissors') ||
        (choice === 'paper' && computerChoice === 'rock') ||
        (choice === 'scissors' && computerChoice === 'paper')
      ) {
        setResult('You win!');
        const points = powerUp === 'doublePoints' ? 2 : 1;
        setScore(prev => ({ ...prev, player: prev.player + points }));
        if (powerUp === 'doublePoints') setPowerUp(null);
        addMessage('computer', "You win! Well played. You've revealed a new letter!");
      } else {
        setResult('Computer wins!');
        setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
        addMessage('computer', "I win this round! Don't give up, keep learning and trying!");
      }
      setIsAnimating(false);
      setRoundCount(prev => prev + 1);
    }, 2000);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
    setScore({ player: 0, computer: 0 });
    setRoundCount(0);
    setShowFireworks(false);
    setPowerUp(null);
    setConsecutiveWins(0);
    selectNewWord();
    addMessage('computer', "Game reset! Let's start fresh with a new word. Good luck and happy learning!");
  };

  const getEmoji = (choice) => {
    switch(choice) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '❓';
    }
  };

  const addMessage = (sender, text) => {
    setChatMessages(prev => [...prev, { sender, text }]);
  };

  const handleUserInput = (e) => {
    if (e.key === 'Enter' && userInput.trim()) {
      addMessage('player', userInput);
      handleComputerResponse(userInput);
      setUserInput('');
    }
  };

  const handleComputerResponse = (input) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('help')) {
      addMessage('computer', "Here are some commands you can use:\n- 'play': Start a new game\n- 'score': Check the current score\n- 'rules': Learn about the game rules\n- 'difficulty': Change the game difficulty\n- 'theme': Change the game theme\n- 'word': Get info about the current word");
    } else if (lowerInput.includes('play')) {
      addMessage('computer', "Great! Choose rock, paper, or scissors to start playing. Win rounds to reveal letters of the hidden word!");
    } else if (lowerInput.includes('score')) {
      addMessage('computer', `Current score - Player: ${score.player}, Computer: ${score.computer}`);
    } else if (lowerInput.includes('rules')) {
      addMessage('computer', "Rock beats scissors, scissors beat paper, and paper beats rock. Win rounds to reveal letters of a hidden word. First to 3 wins in 'Best of 5' mode, or play endlessly in 'Endless' mode. Get 3 wins in a row for a bonus hint! You can also win by guessing the entire word correctly.");
    } else if (lowerInput.includes('difficulty')) {
      addMessage('computer', `Current difficulty is ${difficulty}. You can change it using the dropdown menu above.`);
    } else if (lowerInput.includes('theme')) {
      addMessage('computer', `Current theme is ${theme}. You can change it using the dropdown menu above.`);
    } else if (lowerInput.includes('word')) {
      const revealedWord = hiddenWord.split('').map((letter, index) => revealedLetters[index] ? letter : '_').join(' ');
      addMessage('computer', `Here's what you've revealed so far: ${revealedWord}`);
    } else {
      addMessage('computer', "I'm not sure how to respond to that. Type 'help' for a list of commands!");
    }
  };

  const handleWordGuess = () => {
    if (wordGuess.toLowerCase() === hiddenWord.toLowerCase()) {
      addMessage('computer', `Congratulations! You've guessed the word correctly: ${hiddenWord}. The hint was: ${hint}`);
      setShowFireworks(true);
      setCelebrationMessage('Congratulations! You guessed the word!');
      setTimeout(() => {
        setShowFireworks(false);
        setCelebrationMessage('');
      }, 3000);
      setScore(prev => ({ ...prev, player: prev.player + 3 }));
      selectNewWord();
    } else {
      addMessage('computer', "That's not the correct word. Keep trying!");
    }
    setWordGuess('');
  };

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    background: themes[theme].background,
    color: themes[theme].textColor,
  };

  const leftPanelStyle = {
    width: '250px',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
  };

  const gameAreaStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    overflowY: 'auto',
  };

  const chatAreaStyle = {
    width: '300px',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  };

  const chatBoxStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column-reverse',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    background: themes[theme].buttonColor,
    color: themes[theme].textColor,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    margin: '5px',
  };

  const selectStyle = {
    ...buttonStyle,
    appearance: 'none',
    paddingRight: '30px',
    background: themes[theme].buttonColor,
    color: themes[theme].textColor,
    backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="292.4" height="292.4"><path fill="${themes[theme].textColor.replace('#', '%23')}" d="M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z"/></svg>')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px top 50%',
    backgroundSize: '12px auto',
  };

  const controlPanelStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const gameDisplayStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  };

  const choiceDisplayStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    fontSize: '80px',
    margin: '20px 0',
  };

  const resultStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    padding: '10px 20px',
    borderRadius: '15px',
    background: result.includes('won') ? 'linear-gradient(45deg, #00b09b, #96c93d)' : 
                'linear-gradient(45deg, #4facfe, #00f2fe)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    maxWidth: '80%',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  };

  const scoreStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '400px',
    fontSize: '18px',
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '10px',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)',
    margin: '10px 0',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  };

  const choiceButtonsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
  };

  const loadingStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: themes[theme].background,
    color: themes[theme].textColor,
    zIndex: 1000,
  };

  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: `4px solid ${themes[theme].textColor}`,
    borderTop: `4px solid ${themes[theme].buttonColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const messageStyle = (sender) => ({
    padding: '8px',
    borderRadius: '10px',
    marginBottom: '8px',
    maxWidth: '80%',
    alignSelf: sender === 'player' ? 'flex-end' : 'flex-start',
    background: sender === 'player' ? themes[theme].buttonColor : 'rgba(255, 255, 255, 0.2)',
    fontSize: '14px',
  });

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: themes[theme].textColor,
    fontSize: '14px',
  };

  const hiddenWordStyle = {
    fontSize: '24px',
    letterSpacing: '8px',
    marginTop: '20px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  };

  const hintDisplayStyle = {
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: themes[theme].textColor,
  };

  const wordGuessInputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: `2px solid ${themes[theme].buttonColor}`,
    borderRadius: '25px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: themes[theme].textColor,
    fontSize: '16px',
    textAlign: 'center',
    outline: 'none',
  };

  const celebrationMessageStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    zIndex: 1000,
    animation: 'bounce 0.5s infinite alternate',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '10px',
  };
  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-30px); }
              60% { transform: translateY(-15px); }
            }
          `}
        </style>
        <div style={spinnerStyle}></div>
        <h2 style={{ marginTop: '20px', animation: 'bounce 2s infinite' }}>Loading Educational Game...</h2>
        <p style={{ marginTop: '10px' }}>Get ready to rock, paper, scissors, and learn!</p>
      </div>
    );
  }

  const choiceButtonStyle = (choice) => ({
    ...buttonStyle,
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    background: themes[theme].choiceButtonColor,
    border: `3px solid ${themes[theme].textColor}`,
    transition: 'all 0.3s ease',
  });

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes firework {
            0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
            50% { width: 0.5vmin; opacity: 1; }
            100% { width: var(--finalSize); opacity: 0; }
          }
          .firework {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          }
          .firework::before, .firework::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0.5vmin;
            aspect-ratio: 1;
            background:
              radial-gradient(circle, #ff0 0.2vmin, #0000 0) 50% 00%,
              radial-gradient(circle, #ff0 0.3vmin, #0000 0) 00% 50%,
              radial-gradient(circle, #ff0 0.5vmin, #0000 0) 50% 99%,
              radial-gradient(circle, #ff0 0.2vmin, #0000 0) 99% 50%,
              radial-gradient(circle, #ff0 0.3vmin, #0000 0) 80% 90%,
              radial-gradient(circle, #ff0 0.5vmin, #0000 0) 95% 90%,
              radial-gradient(circle, #ff0 0.5vmin, #0000 0) 10% 60%,
              radial-gradient(circle, #ff0 0.2vmin, #0000 0) 31% 80%,
              radial-gradient(circle, #ff0 0.3vmin, #0000 0) 80% 10%,
              radial-gradient(circle, #ff0 0.2vmin, #0000 0) 90% 23%,
              radial-gradient(circle, #ff0 0.3vmin, #0000 0) 45% 20%,
              radial-gradient(circle, #ff0 0.5vmin, #0000 0) 13% 24%;
            background-size: 0.5vmin 0.5vmin;
            background-repeat: no-repeat;
            animation: firework 2s infinite;
          }
          .firework::after {
            transform: translate(-50%, -50%) rotate(25deg);
          }
          button:hover, select:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          }
          button:active {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }
          select {
            background-color: rgba(255, 255, 255, 0.9) !important;
            color: #333 !important;
          }
          select option {
            background-color: white;
            color: #333;
            padding: 10px;
          }
          select option:checked {
            background-color: #ddd;
          }
        `}
      </style>
      <div style={leftPanelStyle}>
        <div style={hintDisplayStyle}>
          <p>Hint:</p>
          <p>{hintUsed ? hint : "Use the 'Use Hint' button to reveal"}</p>
        </div>
        <input
          type="text"
          value={wordGuess}
          onChange={(e) => setWordGuess(e.target.value)}
          placeholder="Guess the word..."
          style={wordGuessInputStyle}
        />
        <button onClick={handleWordGuess} style={buttonStyle}>
          Submit Guess
        </button>
        <button onClick={useHint} style={{...buttonStyle, opacity: hintUsed ? 0.6 : 1, marginTop: '10px'}} disabled={hintUsed}>
          Use Hint
        </button>
      </div>
      <div style={gameAreaStyle}>
        <div style={controlPanelStyle}>
          <button onClick={() => setGameMode('endless')} style={{...buttonStyle, opacity: gameMode === 'endless' ? 1 : 0.6}}>
            Endless Mode
          </button>
          <button onClick={() => {setGameMode('best-of-5'); resetGame();}} style={{...buttonStyle, opacity: gameMode === 'best-of-5' ? 1 : 0.6}}>
            Best of 5
          </button>
          <select 
            onChange={(e) => setDifficulty(e.target.value)} 
            value={difficulty} 
            style={selectStyle}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button onClick={resetGame} style={{...buttonStyle, background: 'linear-gradient(45deg, #e74c3c, #c0392b)'}}>Reset Game</button>
          <button onClick={() => setPowerUp('doublePoints')} style={powerUp === 'doublePoints' ? {...buttonStyle, background: 'gold', color: 'black'} : buttonStyle} disabled={powerUp !== null}>
            Double Points
          </button>
          <select 
            onChange={(e) => setTheme(e.target.value)} 
            value={theme} 
            style={selectStyle}
          >
            <option value="default">Default Theme</option>
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
          </select>
          </div>
        <div style={gameDisplayStyle}>
          <h1 className="game-title" style={{ fontSize: '36px', margin: '10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Advanced Educational Rock Paper Scissors</h1>
          <div style={choiceDisplayStyle}>
            <div style={{animation: isAnimating ? 'shake 0.5s infinite' : 'none'}}>{getEmoji(playerChoice)}</div>
            <div className="vs-text" style={{ fontWeight: 'bold', fontSize: '48px' }}>VS</div>
            <div style={{animation: thinking ? 'bounce 0.5s infinite' : isAnimating ? 'shake 0.5s infinite' : 'none'}}>
              {thinking ? '🤔' : getEmoji(computerChoice)}
            </div>
          </div>
          {result && <div className="result-text" style={resultStyle}>{result}</div>}
          <div style={scoreStyle}>
            <div>Player: {score.player}</div>
            <div>Computer: {score.computer}</div>
            <div>Round: {roundCount}</div>
            <div>Streak: {consecutiveWins}</div>
          </div>
          <div style={hiddenWordStyle}>
            {hiddenWord.split('').map((letter, index) => (
              revealedLetters[index] ? letter : '_'
            )).join(' ')}
          </div>
          <div style={choiceButtonsStyle}>
            {choices.map((choice) => (
              <button 
                key={choice} 
                onClick={() => playGame(choice)} 
                style={choiceButtonStyle(choice)}
                className="choice-button"
                disabled={isAnimating || (gameMode === 'best-of-5' && (score.player === 3 || score.computer === 3))}
              >
                <span style={{ fontSize: '32px', marginBottom: '5px' }}>{getEmoji(choice)}</span>
                {choice.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '10px', fontSize: '14px', color: themes[theme].textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
            Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </div>
          {showFireworks && (
            <>
              <div className="firework" style={{'--x': '-30vmin', '--initialY': '60vmin'}}></div>
              <div className="firework" style={{'--x': '30vmin', '--initialY': '60vmin'}}></div>
              <div className="firework" style={{'--x': '0vmin', '--initialY': '80vmin'}}></div>
              <div className="firework" style={{'--x': '-20vmin', '--initialY': '40vmin'}}></div>
              <div className="firework" style={{'--x': '20vmin', '--initialY': '40vmin'}}></div>
            </>
          )}
        </div>
      </div>
      <div style={chatAreaStyle}>
        <div style={chatBoxStyle} ref={chatBoxRef}>
          {chatMessages.slice().reverse().map((message, index) => (
            <div key={index} style={messageStyle(message.sender)}>
              <strong>{message.sender === 'player' ? 'You' : 'Computer'}:</strong> {message.text}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleUserInput}
          placeholder="Type a message..."
          style={inputStyle}
        />
      </div>
    </div>
  );
};

export default AdvancedEducationalRockPaperScissors;
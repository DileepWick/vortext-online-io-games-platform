import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #282c34;
  color: white;
`;

const Word = styled.div`
  display: flex;
  margin: 20px 0;
`;

const Letter = styled.span`
  font-size: 2em;
  margin: 0 5px;
  border-bottom: 2px solid white;
  width: 30px;
  text-align: center;
`;

const AlphabetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
`;

const LetterButton = styled.button`
  font-size: 1.5em;
  margin: 5px;
  padding: 10px;
  background: white;
  color: #282c34;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  font-size: 2em;
  margin: 20px 0;
`;

const Hint = styled.div`
  font-size: 1.5em;
  margin: 20px 0;
`;

const LearningSubject = styled.div`
  font-size: 1.5em;
  margin: 20px 0;
  font-style: italic;
`;

const Hangman = ({ questions, learningSubject }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const maxWrongGuesses = 6;

  const selectRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestionIndex(randomIndex);
    const { word, hint } = questions[randomIndex];
    setWord(word);
    setHint(hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
  };

  useEffect(() => {
    selectRandomQuestion();
  }, []);

  const handleGuess = (letter) => {
    setGuessedLetters([...guessedLetters, letter]);

    if (!word.includes(letter)) {
      setWrongGuesses(wrongGuesses + 1);
    }
  };

  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <Letter key={index}>
        {guessedLetters.includes(letter) ? letter : ''}
      </Letter>
    ));
  };

  const renderAlphabetButtons = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return alphabet.map((letter) => (
      <LetterButton
        key={letter}
        onClick={() => handleGuess(letter)}
        disabled={guessedLetters.includes(letter)}
      >
        {letter}
      </LetterButton>
    ));
  };

  const isGameOver = wrongGuesses >= maxWrongGuesses;
  const isGameWon = word.split('').every((letter) => guessedLetters.includes(letter));

  useEffect(() => {
    if (isGameOver || isGameWon) {
      setTimeout(selectRandomQuestion, 3000); // Change question after 3 seconds
    }
  }, [isGameOver, isGameWon]);

  return (
    <GameContainer>
      <LearningSubject>Subject: {learningSubject}</LearningSubject>
      <Hint>Hint: {hint}</Hint>
      <Word>{renderWord()}</Word>
      <AlphabetContainer>{renderAlphabetButtons()}</AlphabetContainer>
      <Message>
        Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}
      </Message>
      {isGameOver && <Message>Game Over! The word was {word}</Message>}
      {isGameWon && <Message>Congratulations! You won!</Message>}
    </GameContainer>
  );
};

export default Hangman;

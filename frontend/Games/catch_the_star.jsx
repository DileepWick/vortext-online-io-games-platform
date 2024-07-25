import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fall = keyframes`
  from {
    top: -50px;
  }
  to {
    top: 100%;
  }
`;

const GameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: #282c34;
  overflow: hidden;
`;

const Star = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: yellow;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: ${fall} 3s linear infinite;
  left: ${({ left }) => left}%;
`;

const Bomb = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: red;
  border-radius: 50%;
  animation: ${fall} 3s linear infinite;
  left: ${({ left }) => left}%;
`;

const Basket = styled.div`
  position: absolute;
  bottom: 20px;
  left: ${({ left }) => left}%;
  width: 100px;
  height: 50px;
  background: brown;
  border-radius: 10px;
`;

const Score = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  color: white;
`;

const LifeLines = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  color: white;
`;

const CatchTheStarGame = () => {
  const [basketLeft, setBasketLeft] = useState(50);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [lifeLines, setLifeLines] = useState(5);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const newBasketLeft = (event.clientX / window.innerWidth) * 100;
      setBasketLeft(newBasketLeft);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const interval = setInterval(() => {
      const newItem = {
        id: Date.now(),
        left: Math.random() * 100,
        type: Math.random() < 0.8 ? 'star' : 'bomb', // 80% chance for star, 20% for bomb
      };
      setItems((prevItems) => [...prevItems, newItem]);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prevItems) => {
        const newItems = prevItems.filter((item) => {
          const itemTop = (Date.now() - item.id) / 3;
          if (itemTop > window.innerHeight - 70 && itemTop < window.innerHeight - 20) {
            if (Math.abs(basketLeft - item.left) < 10) {
              if (item.type === 'star') {
                setScore((prevScore) => prevScore + 1);
              } else if (item.type === 'bomb') {
                setLifeLines((prevLifeLines) => prevLifeLines - 1);
              }
              return false;
            }
          }
          return itemTop < window.innerHeight;
        });
        return newItems;
      });
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [basketLeft]);

  return (
    <GameContainer>
      {items.map((item) =>
        item.type === 'star' ? (
          <Star key={item.id} left={item.left} />
        ) : (
          <Bomb key={item.id} left={item.left} />
        )
      )}
      <Basket left={basketLeft} />
      <Score>Score: {score}</Score>
      <LifeLines>Life Lines: {lifeLines}</LifeLines>
      {lifeLines <= 0 && (
        <div style={{ color: 'white', fontSize: '48px', textAlign: 'center', marginTop: '20%' }}>
          Game Over!
        </div>
      )}
    </GameContainer>
  );
};

export default CatchTheStarGame;

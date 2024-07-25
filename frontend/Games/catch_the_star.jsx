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
  cursor: none; /* Hide the cursor */
`;

const Item = styled.img`
  position: absolute;
  width: 60px;
  height: 60px;
  animation: ${fall} 3s linear infinite;
  left: ${({ left }) => left}%;
`;

const BasketContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: ${({ left }) => left}%;
  width: 300px;
  height: 150px;
`;

const BasketIcon = styled.img`
  width: 100%;
  height: 100%;
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
      {items.map((item) => (
        <Item
          key={item.id}
          left={item.left}
          src={item.type === 'star' ? 'https://pbs.twimg.com/profile_images/541867053351583744/rcxem8NU_400x400.jpeg' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUgXQeGsvTBC-JFiecXjnh0IC4MbKi3yDZVw&s'}
          alt={item.type}
        />
      ))}
      <BasketContainer left={basketLeft}>
        <BasketIcon src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR95J04FfX4oV8sULU8acqlDZy1TlbmpCuS-g&s" alt="Basket" />
      </BasketContainer>
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

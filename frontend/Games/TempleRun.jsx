import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const GameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: #282c34;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
`;

const Player = styled.div`
  position: absolute;
  bottom: ${({ isJumping }) => (isJumping ? '100px' : '0')};
  left: 50px;
  width: 50px;
  height: 50px;
  background: green;
  transition: bottom 0.2s;
`;

const Obstacle = styled.div`
  position: absolute;
  bottom: 0;
  right: ${({ right }) => right}px;
  width: 30px;
  height: 50px;
  background: red;
`;

const Coin = styled.div`
  position: absolute;
  bottom: 50px;
  right: ${({ right }) => right}px;
  width: 20px;
  height: 20px;
  background: yellow;
  border-radius: 50%;
`;

const Score = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  color: white;
`;

const Lives = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  color: white;
`;

const EndlessRunnerGame = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' && !isJumping) {
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const obstacleInterval = setInterval(() => {
      const newObstacle = { id: Date.now(), right: -30 };
      setObstacles((prevObstacles) => [...prevObstacles, newObstacle]);
    }, 2000);

    const coinInterval = setInterval(() => {
      const newCoin = { id: Date.now(), right: -20 };
      setCoins((prevCoins) => [...prevCoins, newCoin]);
    }, 1500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(obstacleInterval);
      clearInterval(coinInterval);
    };
  }, [isJumping]);

  useEffect(() => {
    const interval = setInterval(() => {
      setObstacles((prevObstacles) => {
        return prevObstacles
          .map((obstacle) => ({ ...obstacle, right: obstacle.right + 5 }))
          .filter((obstacle) => {
            if (obstacle.right > window.innerWidth) return false;
            if (obstacle.right > 50 && obstacle.right < 100 && !isJumping) {
              setLives((prevLives) => prevLives - 1);
              return false;
            }
            return true;
          });
      });

      setCoins((prevCoins) => {
        return prevCoins
          .map((coin) => ({ ...coin, right: coin.right + 5 }))
          .filter((coin) => {
            if (coin.right > window.innerWidth) return false;
            if (coin.right > 50 && coin.right < 100 && isJumping) {
              setScore((prevScore) => prevScore + 1);
              return false;
            }
            return true;
          });
      });
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [isJumping]);

  return (
    <GameContainer>
      <Player isJumping={isJumping} />
      {obstacles.map((obstacle) => (
        <Obstacle key={obstacle.id} right={obstacle.right} />
      ))}
      {coins.map((coin) => (
        <Coin key={coin.id} right={coin.right} />
      ))}
      <Score>Score: {score}</Score>
      <Lives>Lives: {lives}</Lives>
      {lives <= 0 && (
        <div style={{ color: 'white', fontSize: '48px', textAlign: 'center', marginTop: '20%' }}>
          Game Over!
        </div>
      )}
    </GameContainer>
  );
};

export default EndlessRunnerGame;

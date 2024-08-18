import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@nextui-org/react';
import GameDetails from './GamePlay'; // Adjust the import path as needed

const GameDetailsButton = ({ gameStock, onClick }) => {
  return (
    <Button
      onClick={onClick}
      color="primary"
      size="lg"
      className="w-full text-white bg-blue-500 hover:bg-blue-700"
    >
      <GameDetails gameStock={gameStock} />
    </Button>
  );
};

GameDetailsButton.propTypes = {
  gameStock: PropTypes.shape({
    AssignedGame: PropTypes.shape({
      title: PropTypes.string.isRequired,
      IoGameUrl: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default GameDetailsButton;

import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/header';
import Footer from '../components/footer';

const GameDetails = ({ gameStock }) => {
  if (!gameStock) return <p className="text-center mt-8 text-black">Game not found</p>;

  return (
    <div className="bg-customDark text-black min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-customDark rounded-lg shadow-lg p-8">
          <h1 className="text-5xl text-white mb-4 text-left">
            {gameStock.AssignedGame.title}
          </h1>
          <div className="flex flex-col items-center">
            <iframe
              src={gameStock.AssignedGame.IoGameUrl} // Ensure this URL is correct and allows embedding
              width="900"
              height="400"
              frameBorder="0"
              allowFullScreen
              className="mb-4 shadow-md"
              title={gameStock.AssignedGame.title}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

GameDetails.propTypes = {
  gameStock: PropTypes.shape({
    AssignedGame: PropTypes.shape({
      title: PropTypes.string.isRequired,
      IoGameUrl: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default GameDetails;

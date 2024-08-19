import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const HandleRentals = () => {
  const { stockid } = useParams(); // Extract stockid from URL
  const [gameStock, setGameStock] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        // Fetch game stock details by ID
        const response = await axios.get(
          `http://localhost:8098/gameStocks/GetStockById/${stockid}`
        );
        const currentGameStock = response.data;

        // Fetch related game stocks with the same AssignedGame ID
        const relatedResponse = await axios.get(
          `http://localhost:8098/gameStocks/getGameStockDetails/${currentGameStock.AssignedGame._id}`
        );

        // Filter out the current game stock from related stocks
        const filteredRelatedStocks = relatedResponse.data.filter(
          (stock) => stock._id !== currentGameStock._id
        );

        // Update state with the fetched data
        setGameStock({
          ...currentGameStock,
          relatedGameStocks: filteredRelatedStocks
        });
      } catch (err) {
        // Set error state with error message
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [stockid]);

  if (loading) return <p className="text-center mt-8 text-black">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-black">Error: {error}</p>;
  if (!gameStock) return <p className="text-center mt-8 text-black">Game not found</p>;

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Game Rental Details</h1>
      {gameStock.AssignedGame && (
        <>
          <img
            src={gameStock.AssignedGame.coverPhoto}
            alt={gameStock.AssignedGame.title}
            className="mx-auto w-1/2 h-auto object-cover"
          />
          <p className="mt-4 text-lg">Title: {gameStock.AssignedGame.title}</p>
        </>
      )}
      {gameStock.relatedGameStocks && gameStock.relatedGameStocks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Related Editions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {gameStock.relatedGameStocks.map((stock) => (
              <div
                key={stock._id}
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
              >
                <img
                  src={stock.AssignedGame.coverPhoto}
                  alt={stock.AssignedGame.title}
                  className="w-40 h-52 object-cover rounded-lg mb-2"
                />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {stock.AssignedGame.title} {stock.Edition} Edition
                </h2>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HandleRentals;

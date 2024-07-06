import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import useAuthCheck from "../utils/authCheck";
import { getToken } from "../utils/getToken";
import {  toast ,Flip} from 'react-toastify';

import Header from "../components/header";
import Footer from "../components/footer";

const GameDetails = () => {
  // Authenticate user
  useAuthCheck();

  const { id } = useParams();
  const [gameStock, setGameStock] = useState(null);
  const [relatedGameStocks, setRelatedGameStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartId, setCartId] = useState(null); // State to handle cart ID
  const [quantityByStockId, setQuantityByStockId] = useState({}); // State to handle quantity by stock id

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/gameStocks/GetStockById/${id}`
        );
        const currentGameStock = response.data;
        setGameStock(currentGameStock); // Set the current game stock details

        // Fetch related game stocks with the same AssignedGame ID
        const relatedResponse = await axios.get(
          `http://localhost:8098/gameStocks/getGameStockDetails/${currentGameStock.AssignedGame._id}`
        );

        // Filter out the current game stock from related stocks
        const filteredRelatedStocks = relatedResponse.data.filter(
          (stock) => stock._id !== currentGameStock._id
        );

        setRelatedGameStocks(filteredRelatedStocks); // Set related game stocks
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCartId = async () => {
      try {
        const token = getToken(); // Get token
        const userId = getUserIdFromToken(token); // Use token to get user id
        const response = await axios.get(
          `http://localhost:8098/cart/getCartByUserId/${userId}`
        );
        setCartId(response.data._id); // Set the cart ID
      } catch (error) {
        console.error("Error fetching cart ID:", error);
      }
    };

    fetchGameDetails();
    fetchCartId(); // Fetch cart ID
  }, [id]);

  //Handle Add to Cart
  const handleAddToCart = async (stockId) => {
    try {
      if (!cartId) {
        setCartMessage("Cart not found.");
        return;
      }

      const response = await axios.post(
        `http://localhost:8098/cartItems/createCartItem`,
        {
          cartid: cartId, // Use the fetched cart id
          stockid: stockId,
          quantity: quantityByStockId[stockId] || 1, // Use the selected quantity or default to 1
        }
      );

      if (response.status === 201) {
        toast.success('Item Added Successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style:{fontFamily:'Rubik'}
          });
      } else {
        setCartMessage("Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      setCartMessage("Error adding item to cart.");
    }
  };

  const handleQuantityChange = (stockId, newQuantity) => {
    // Update quantityByStockId state
    setQuantityByStockId({ ...quantityByStockId, [stockId]: newQuantity });
  };

  if (loading) return <p className="text-center mt-8 text-white">Loading...</p>;
  if (error)
    return <p className="text-center mt-8 text-white">Error: {error}</p>;
  if (!gameStock)
    return <p className="text-center mt-8 text-white">Game not found</p>;

  return (
    <div className="bg-gray-900 text-white min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-200 mb-4">
            {gameStock.AssignedGame.title}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={gameStock.AssignedGame.coverPhoto}
                alt={gameStock.AssignedGame.title}
                className="w-full rounded-lg mb-4 shadow-md"
              />
              <video
                src={gameStock.AssignedGame.TrailerVideo}
                autoPlay
                controls
                muted
                className="w-full rounded-lg mb-4 shadow-md"
              />
            </div>
            <div>
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Platform:</span>{" "}
                {gameStock.Platform}
              </p>
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Edition:</span>{" "}
                {gameStock.Edition}
              </p>
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Units:</span>{" "}
                {gameStock.NumberOfUnits}
              </p>
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Price:</span> $
                {gameStock.UnitPrice}
              </p>
              {gameStock.discount && (
                <p className="text-gray-400 mb-2">
                  <span className="font-semibold">Discount:</span>{" "}
                  {gameStock.discount}%
                </p>
              )}

              <button
                onClick={() => handleAddToCart(gameStock._id)}
                className="block w-full text-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 mt-4"
              >
                Add to Cart
              </button>
              {cartMessage && (
                <p className="text-center text-green-600 mt-2">{cartMessage}</p>
              )}
            </div>
          </div>
        </div>

        {relatedGameStocks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">
              Related Editions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {relatedGameStocks.map((stock) => (
                <div
                  key={stock._id}
                  className="bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <img
                    src={stock.AssignedGame.coverPhoto}
                    alt={stock.AssignedGame.title}
                    className="w-30 h-32"
                  />
                  <h2 className="text-xl font-bold text-gray-200 mb-2">
                    {stock.AssignedGame.title} {stock.Edition} Edition
                  </h2>
                  <Link
                    to={`/game/${stock._id}`}
                    className="block text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    View Details
                  </Link>
                  <div className="mt-4">
                    <label className="block text-gray-400 mb-2">
                      Quantity:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantityByStockId[stock._id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(stock._id, Number(e.target.value))
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-700 text-white px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={() => handleAddToCart(stock._id)}
                    className="block w-full text-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 mt-4"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GameDetails;

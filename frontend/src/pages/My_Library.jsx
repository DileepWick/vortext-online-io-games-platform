import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Card, CardBody, Chip, Input } from "@nextui-org/react";
import GameStartIcon from "../assets/icons/Game_Start";

const OrderHistory = () => {
  useAuthCheck();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);
        const response = await axios.get(
          `http://localhost:8098/orderItems/useOrders/${userId}`
        );
        setOrderItems(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to fetch order items.");
      }
    };

    fetchOrderItems();
  }, []);

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              No Games Found In The Library
            </h2>
            <p className="text-gray-400 text-lg">
              Your game library is empty. Start building your collection!
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter out removed games
  const filteredOrderItems = orderItems.filter(
    (item) => item.stockid?.AssignedGame?._id
  );

  // Filter games based on search query
  const searchResults = filteredOrderItems.filter((item) => {
    const game = item.stockid?.AssignedGame;
    return (
      game &&
      (game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.Genre || []).some((genre) =>
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );
  });

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-primaryRegular mb-2 text-black">
            My Library
          </h1>
          <p className="text-gray-400 text-lg">
            {filteredOrderItems.length} game{filteredOrderItems.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search by game title or genre..."
            labelPlacement="inside"
            className="w-full"
            label="Search Games"
            value={searchQuery}
            size="lg"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Games Grid */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {searchResults.map((item) => {
              const game = item.stockid?.AssignedGame;
              const gameExists = game && game._id;

              return (
                <Card
                  key={item._id}
                  className="group relative  overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-gray-600 cursor-pointer"
                >
                  <Link
                    to={`/playgame/${encodeURIComponent(
                      game.PlayLink || "default-link"
                    )}/${encodeURIComponent(game.title || "N/A")}`}
                    className="block h-full"
                  >
                    {gameExists ? (
                      <>
                        <div className="relative overflow-hidden">
                          <img
                            alt={game.title || "Game Image"}
                            className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover transition-transform duration-300 group-hover:scale-110"
                            src={game.coverPhoto || "default-image-url"}
                          />
                          
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="text-center">
                              <GameStartIcon className="text-white w-12 h-12 mx-auto mb-2" />
                              <p className="text-white font-bold text-lg">Play Game</p>
                            </div>
                          </div>
                        </div>
                        
                        <CardBody className="p-4 bg-black text-white">
                          <h3 className="text-white text-lg mb-2 line-clamp-2  transition-colors">
                            {game.title || "N/A"}
                          </h3>
                          
                          {/* Genre chips */}
                          {game.Genre && game.Genre.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {game.Genre.slice(0, 2).map((genre, index) => (
                                <Chip
                                  key={index}
                                  size="sm"
                                  variant="dot"
                                  className="text-white"
                                >
                                  {genre}
                                </Chip>
                              ))}
                              {game.Genre.length > 2 && (
                                <Chip
                                  size="sm"
                                  className="bg-gray-700 text-gray-400 text-xs"
                                >
                                  +{game.Genre.length - 2}
                                </Chip>
                              )}
                            </div>
                          )}
                        </CardBody>
                      </>
                    ) : (
                      <CardBody className="p-6 text-center bg-gray-900 border border-gray-800">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <p className="text-lg font-medium">
                            This game has been removed
                          </p>
                        </div>
                      </CardBody>
                    )}
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              No Games Found
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              {searchQuery 
                ? `No games match your search "${searchQuery}"`
                : "Your game library is empty"
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-white text-black font-bold py-2 px-6 rounded hover:bg-gray-200 transition-colors duration-200"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrderHistory;
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
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

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
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-customDark flex flex-col min-h-screen">
        <Header />
        <p className="text-center text-white font-primaryRegular text-5xl mt-[100px]">
            No Games Found In The Library
          </p>
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
    <div className="bg-customDark min-h-screen font-sans text-white">
      <Header />
      <div className="container mx-auto p-6">
        <div className="text-5xl font-primaryRegular mb-6">MY LIBRARY</div>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search for games..."
            className="dark font-primaryRegular w-[300px]"
            value={searchQuery}
            size="lg"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchResults.length > 0 ? (
          <div className="flex flex-wrap justify-start gap-6">
            {searchResults.map((item) => {
              const game = item.stockid?.AssignedGame;
              const gameExists = game && game._id;

              return (
                <Card
                  key={item._id}
                  className="relative bg-black overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-opacity-80"
                >
                  <Link
                    to={`/playgame/${encodeURIComponent(
                      game.PlayLink || "default-link"
                    )}/${encodeURIComponent(game.title || "N/A")}`}
                    className="block"
                  >
                    {gameExists ? (
                      <>
                        <img
                          isBlurred
                          radius="none"
                          alt={game.title || "Game Image"}
                          className="w-[230px] h-[300px] object-cover"
                          src={game.coverPhoto || "default-image-url"}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                          <GameStartIcon /> {/* Show GameIcon on hover */}
                        </div>
                        <CardBody className="p-4">
                          <p className="mb-2 font-primaryRegular text-xl text-white w-[200px]">
                            {game.title || "N/A"}
                          </p>
                        </CardBody>
                      </>
                    ) : (
                      <CardBody className="p-4 text-center text-white">
                        <p className="text-lg font-primaryRegular">
                          This game has been removed.
                        </p>
                      </CardBody>
                    )}
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-black font-primaryRegular text-xl">
            No Games Found In The Library
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;

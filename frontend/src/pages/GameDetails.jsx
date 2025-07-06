import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import axios from "axios";

// Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import useAuthCheck from "../utils/authCheck";
import { getToken } from "../utils/getToken";
import { toast, Flip } from "react-toastify";
import VideoPlayer from "../components/videoPlayer";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import RatingSystem from "../components/RatingSystem";

// NextUI
import { Button, Chip } from "@nextui-org/react";
import { Card, CardBody, CardFooter, Image, Textarea } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/react";
import RatingSystemEditing from "../components/RatingSystemEditing";
import Loader from "../components/Loader/loader";

const GameDetails = () => {
  // Authenticate user
  useAuthCheck();

  const { id } = useParams();
  const [gameStock, setGameStock] = useState(null);
  const [relatedGameStocks, setRelatedGameStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [quantityByStockId, setQuantityByStockId] = useState({});
  const [checkItem, setCheckItem] = useState("not in the library");
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [user, setUser] = useState(null);

  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/users/profile/${userId}`
        );
        setUser(response.data.profile);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    try {
      if (user) {
        console.log("User:", { role: user.role });
        console.log("user.role:", user.role);
        console.log("Type of user.role:", typeof user.role);
      } else {
        console.log("User not found", { role: user.role });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, [user]);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/gameStocks/GetStockById/${id}`
        );
        const currentGameStock = response.data;
        setGameStock(currentGameStock);

        const relatedResponse = await axios.get(
          `http://localhost:8098/gameStocks/getGameStockDetails/${currentGameStock.AssignedGame._id}`
        );

        const filteredRelatedStocks = relatedResponse.data.filter(
          (stock) => stock._id !== currentGameStock._id
        );

        setRelatedGameStocks(filteredRelatedStocks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRatings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/ratings/game/${id}`
        );
        setRatings(response.data);
        console.log("id", id);
        const avg =
          response.data.reduce((sum, rating) => sum + rating.rating, 0) /
          response.data.length;
        setAverageRating(avg);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();

    const fetchCartId = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);
        const response = await axios.get(
          `http://localhost:8098/cart/getCartByUserId/${userId}`
        );
        setCartId(response.data._id);
      } catch (error) {
        console.error("Error fetching cart ID:", error);
      }
    };

    const checkLibrary = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);
        const checkStatus = await axios.get(
          `http://localhost:8098/orderItems/checkItem/${id}/${userId}/`
        );

        if (checkStatus.status == 200) {
          setCheckItem("in the library");
        }
      } catch (error) {}
    };

    checkLibrary();
    fetchGameDetails();
    fetchCartId();
  }, [id]);

  const handleAddToCart = async (stockId) => {
    if (checkItem === "in the library") {
      toast.warning("Game is already in Library.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } else {
      try {
        if (!cartId) {
          setCartMessage("Cart not found.");
          return;
        }

        const response = await axios.post(
          `http://localhost:8098/cartItems/createCartItem`,
          {
            cartid: cartId,
            stockid: stockId,
            quantity: quantityByStockId[stockId] || 1,
          }
        );

        if (response.status === 201) {
          toast.success(response.data.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Flip,
            style: { fontFamily: "Rubik" },
          });
        } else if (response.status == 222) {
          toast.warning("Item is already in the cart", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Flip,
            style: { fontFamily: "Rubik" },
          });
        }
      } catch (error) {
        console.error("Error adding item to cart:", error);
        setCartMessage("Error adding item to cart.");
      }
    }
  };

  const handleRatingSubmit = async (rating, comment) => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      console.log("Submitting rating:", {
        userId,
        gameId: id,
        rating,
        comment,
      });

      const response = await axios.post(`http://localhost:8098/ratings`, {
        user: userId,
        game: id,
        rating,
        comment,
      });

      console.log("Rating submission response:", response);

      if (response.status === 201) {
        toast.success("Rating submitted successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        const updatedRatings = await axios.get(
          `http://localhost:8098/ratings/game/${id}`
        );
        console.log("Updated ratings:", updatedRatings.data);
        setRatings(updatedRatings.data);
        const avg =
          updatedRatings.data.reduce((sum, r) => sum + r.rating, 0) /
          updatedRatings.data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error("Error submitting rating:", error.response || error);
      toast.error(
        `Error submitting rating: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        }
      );
    }
  };

  const navigate = useNavigate();

  const handleRent = (gameId) => {
    if (checkItem === "in the library") {
      toast.info("You already own this game in your library.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } else {
      navigate(`/HandleRentals/${gameId}`);
    }
  };

  const handleQuantityChange = (stockId, newQuantity) => {
    setQuantityByStockId({ ...quantityByStockId, [stockId]: newQuantity });
  };

  const handleRateUpdate = async (ratingId, rating, comment) => {
    try {
      const response = await axios.put(
        `http://localhost:8098/ratings/game/${ratingId}`,
        {
          rating,
          comment,
        }
      );
      console.log("Rating update response:", response);
      if (response.status === 200) {
        toast.success("Rating updated successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        const updatedRatings = await axios.get(
          `http://localhost:8098/ratings/game/${id}`
        );
        console.log("Updated ratings:", updatedRatings.data);
        setRatings(updatedRatings.data);
        const avg =
          updatedRatings.data.reduce((sum, r) => sum + r.rating, 0) /
          updatedRatings.data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error("Error updating rating:", error.response || error);
      toast.error(
        `Error updating rating: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        }
      );
    }
  };

  if (loading) return <Loader />;
  if (error)
    return <p className="text-center mt-8 text-white">Error: {error}</p>;
  if (!gameStock)
    return <p className="text-center mt-8 text-white">Game not found</p>;

  const originalPrice = gameStock.UnitPrice;
  const discountedPrice = gameStock.discount
    ? originalPrice - (originalPrice * gameStock.discount) / 100
    : originalPrice;

  return (
    <div className="bg-white text-white min-h-screen font-sans">
      <Header />
      
      {/* Main Game Details Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white  rounded-lg shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
            
            {/* Left Column - Video and Description */}
            <div className="flex-1">
              <VideoPlayer
                videoUrl={gameStock.AssignedGame.TrailerVideo}
                autoPlay
                controls
                muted
                className="w-full h-64 sm:h-80 lg:h-96 object-cover mb-6 rounded-lg shadow-lg border border-gray-700"
              />
              
              <div className="space-y-6">
                <h1 className="text-xl sm:text-4xl lg:text-5xl font-primaryRegular text-black mt-8">
                  About the Game
                </h1>
                
                <div className="bg-white rounded-lg p-4 ">
                  <ScrollShadow
                    hideScrollBar
                    className="h-32 sm:h-40 lg:h-48 text-black text-sm sm:text-base lg:text-lg leading-relaxed"
                  >
                    {gameStock.AssignedGame.Description}
                  </ScrollShadow>
                </div>
              </div>
            </div>

            {/* Right Column - Game Card */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <Card className="bg-white overflow-hidden shadow-xl">
                <Image
                  removeWrapper
                  alt={gameStock.AssignedGame.title}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  src={gameStock.AssignedGame.coverPhoto}
                />
                
                <CardBody className="p-6 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-primaryRegular text-black">
                    {gameStock.AssignedGame.title}
                  </h2>
                  
                  {gameStock.discount > 0 && (
                    <div className="space-y-3">
                      <Chip
                        className="font-primaryRegular"
                        radius="sm"
                        color="danger"
                      >
                        -{gameStock.discount}% OFF
                      </Chip>
                      <div className="flex items-center gap-3">
                        <span className="line-through text-black text-lg">
                          LKR {originalPrice.toFixed(2)}
                        </span>
                        <span className="text-black  text-xl">
                          LKR {discountedPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {!gameStock.discount && (
                    <div className="text-white font-bold text-xl">
                      LKR {originalPrice.toFixed(2)}
                    </div>
                  )}
                </CardBody>
                
                <CardFooter className="p-6 pt-0">
                  <div className="w-full space-y-3">
                    <Button
                      onClick={() => handleAddToCart(gameStock._id)}
                      className="w-full "
                      size="lg"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => handleRent(gameStock.AssignedGame._id)}
                      className="w-full"
                      size="lg"
                      variant="bordered"
                    >
                      Rent Game
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="mt-12 bg-white rounded-lg p-6 lg:p-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-8 pb-4">
            Ratings & Reviews
          </h2>

          {user && user.role === "Review Manager" ? (
            <RatingSystemEditing
              gameId={id}
              ratings={ratings}
              averageRating={averageRating}
              onSubmitRating={handleRatingSubmit}
              onUpdateRating={handleRateUpdate}
            />
          ) : (
            <RatingSystem
              gameId={id}
              userid={userId}
              ratings={ratings}
              averageRating={averageRating}
              onSubmitRating={handleRatingSubmit}
              onUpdateRating={handleRateUpdate}
            />
          )}
        </div>
      </div>

      {/* Related Games Section */}
      {relatedGameStocks.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 lg:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center border-b border-gray-700 pb-4">
              Related Editions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedGameStocks.map((stock) => (
                <div
                  key={stock._id}
                  className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
                >
                  <img
                    src={stock.AssignedGame.coverPhoto}
                    alt={stock.AssignedGame.title}
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                  
                  <div className="p-4 space-y-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                      {stock.AssignedGame.title} {stock.Edition} Edition
                    </h3>
                    
                    <Link
                      to={`/game/${stock._id}`}
                      className="block w-full bg-white text-black font-bold py-2 px-4 rounded text-center hover:bg-gray-200 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-300 text-sm font-medium">
                        Quantity:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantityByStockId[stock._id] || 1}
                        onChange={(e) =>
                          handleQuantityChange(stock._id, Number(e.target.value))
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddToCart(stock._id)}
                        className="w-full bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition-colors duration-200"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRent(stock.AssignedGame._id)}
                        className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-200 border border-gray-600"
                      >
                        Rent
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GameDetails;
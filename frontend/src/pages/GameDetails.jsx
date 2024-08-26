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
import RatingSystem from "../components/RatingSystem"; // New import


// NextUI
import { Button, Chip } from "@nextui-org/react";
import { Card, CardBody, CardFooter, Image, Textarea } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/react";



const GameDetails = () => {
  // Authenticate user
  useAuthCheck();

  const { id } = useParams();
  const [gameStock, setGameStock] = useState(null);
  const [relatedGameStocks, setRelatedGameStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartId, setCartId] = useState(null); // State to handle cart ID
  const [quantityByStockId, setQuantityByStockId] = useState({}); // State to handle quantity by stock id
  const [checkItem, setCheckItem] = useState("not in the library");
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);



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



    // Add this new fetch for ratings
    const fetchRatings = async () => {
      try {
        const response = await axios.get(`http://localhost:8098/ratings/game/${id}`);
        setRatings(response.data);
        // Calculate average rating
        const avg = response.data.reduce((sum, rating) => sum + rating.rating, 0) / response.data.length;
        setAverageRating(avg);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();
   
  

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

    //Check library Item
    const checkLibrary = async () => {
      try {
        const token = getToken(); // Get token
        const userId = getUserIdFromToken(token); // Use token to get user id
        const checkStatus = await axios.get(
          `http://localhost:8098/orderItems/checkItem/${id}/${userId}/`
        );

        if (checkStatus.status == 200) {
          setCheckItem("in the library");
        }
      } catch (error) {}
    };

    checkLibrary(); //Check library item
    fetchGameDetails(); //fetch game details
    fetchCartId(); // Fetch cart
  }, [id]);

  // Handle Add to Cart
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
            cartid: cartId, // Use the fetched cart id
            stockid: stockId,
            quantity: quantityByStockId[stockId] || 1, // Use the selected quantity or default to 1
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



 // New function to handle rating submission
 const handleRatingSubmit = async (rating, comment) => {
  try {
    const token = getToken();
    const userId = getUserIdFromToken(token);
    console.log("Submitting rating:", { userId, gameId: id, rating, comment });
    
    const response = await axios.post(`http://localhost:8098/ratings`, {
      user: userId,
      game: id,
      rating,
      comment
    });
    
    console.log("Rating submission response:", response);
    
    if (response.status === 201) {
      toast.success("Rating submitted successfully", {
        // ... (keep existing toast options)
      });
      // Refresh ratings
      const updatedRatings = await axios.get(`http://localhost:8098/ratings/game/${id}`);
      console.log("Updated ratings:", updatedRatings.data);
      setRatings(updatedRatings.data);
      const avg = updatedRatings.data.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.data.length;
      setAverageRating(avg);
    }
  } catch (error) {
    console.error("Error submitting rating:", error.response || error);
    toast.error(`Error submitting rating: ${error.response?.data?.message || error.message}`, {
      // ... (keep existing toast options)
    });
  }
};


  // Handle Rent
  const navigate = useNavigate();

  const handleRent = (stockId) => {
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
      navigate(`/HandleRentals/${stockId}`);
    }
  };
  
  
  


  const handleQuantityChange = (stockId, newQuantity) => {
    // Update quantityByStockId state
    setQuantityByStockId({ ...quantityByStockId, [stockId]: newQuantity });
  };

  if (loading) return <p className="text-center mt-8 text-black">Loading...</p>;
  if (error)
    return <p className="text-center mt-8 text-black">Error: {error}</p>;
  if (!gameStock)
    return <p className="text-center mt-8 text-black">Game not found</p>;

  const originalPrice = gameStock.UnitPrice;
  const discountedPrice = gameStock.discount
    ? originalPrice - (originalPrice * gameStock.discount) / 100
    : originalPrice;

  return (
    <div className="bg-customDark text-black min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-customDark rounded-lg shadow-lg ">

          <div className="flex flex-col md:flex-row items-start justify-start gap-4 bg-customDark scale-80">
            <div className="flex flex-col">
              <VideoPlayer
                videoUrl={gameStock.AssignedGame.TrailerVideo}
                autoPlay
                controls
                muted
                className="w-[600px] h-[400px] object-cover mb-4 shadow-md"
              />
              <h1 className="mt-8 text-editionColor text-5xl">About the game</h1>
              <p className="text-lg mt-4">
                <ScrollShadow
                  hideScrollBar
                  className="w-[1000px] h-[200px] text-white"
                >
                  {gameStock.AssignedGame.Description}
                </ScrollShadow>
              </p>
            </div>
            <div className="flex flex-col items-center text-center md:text-left">
              <Card className="bg-customDark" radius="none">
                <Image
                  radius="none"
                  removeWrapper
                  alt={gameStock.AssignedGame.title}
                  className="w-[300px] h-[400px] object-cover rounded-t"
                  src={gameStock.AssignedGame.coverPhoto}
                />
                <CardBody>
                  <h2 className="text-xl font-primaryRegular text-white mb-2">
                    {gameStock.AssignedGame.title} <br />
                    {gameStock.discount > 0 && (
                      <>
                        <Chip color="primary" radius="none">
                          -{gameStock.discount}% off
                        </Chip>
                        <div className="flex items-center mt-2">
                          <span className="line-through mr-4 text-editionColor">
                            LKR .{originalPrice.toFixed(2)}
                          </span>
                          <span className="text-lg">
                            LKR .{discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {gameStock.AssignedGame.Genre.flatMap((genre) =>
                      genre.includes(",") ? genre.split(",") : genre
                    ).map((genre, index) => (
                      <Chip
                        key={index}
                        color="primary"
                        variant="flat"
                        size="sm"
                        radius="none"
                        className="font-primaryRegular text-white"
                      >
                        {genre.trim()}
                      </Chip>
                    ))}
                  </div>
                </CardBody>
                        <CardFooter className="text-center">
          <div className="flex flex-col items-center">
            <Button
              onClick={() => handleAddToCart(gameStock._id)}
              color="primary"
              radius="none"
              className="w-[300px] mb-2"
              variant="shadow"
            >
              Add to Cart
            </Button>
            <Button
              onClick={() => handleRent(gameStock._id)}
              color="primary"
              radius="none"
              className="w-[300px] mt-2"
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

        <div className="mt-8 scale-80">
  <h2 className="text-3xl text-white mb-4 ">Ratings and Reviews</h2>
  <RatingSystem 
    gameId={id} 
    ratings={ratings} 
    averageRating={averageRating} 
    onSubmitRating={handleRatingSubmit}
  />
</div>
        {relatedGameStocks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Related Editions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {relatedGameStocks.map((stock) => (
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
                  <Link
                    to={`/game/${stock._id}`}
                    className="block text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    View Details
                  </Link>
                  <div className="mt-4">
                    <label className="block text-gray-700 mb-2">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={quantityByStockId[stock._id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(stock._id, Number(e.target.value))
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-100 text-black px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={() => handleAddToCart(stock._id)}
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 mt-4"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRent(stock._id)}
                    className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 mt-4"
                  >
                    Rent
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

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import useAuthCheck from "../utils/authCheck";
import { getToken } from "../utils/getToken";
import { toast, Flip } from "react-toastify";
import VideoPlayer from "../components/videoPlayer";

import Header from "../components/header";
import Footer from "../components/footer";

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

  // Handle Add to Cart
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
        toast.success("Item Added Successfully!", {
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
      } else if (response.status == 400) {
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
    <div className="bg-customDark  text-black min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8  ">
        <div className="bg-customDark rounded-lg shadow-lg p-8">
          <h1 className="text-5xl text-white mb-4 text-left">
            {gameStock.AssignedGame.title}
            <br />
            <Chip color="primary" radius="none">
              {gameStock.AssignedGame.RatingPoints} Rating Points ⭐
            </Chip>
          </h1>
          <div className="flex flex-col md:flex-row items-start justify-start gap-8 bg-customDark">
            <div className="flex flex-col">
              <VideoPlayer
                videoUrl={gameStock.AssignedGame.TrailerVideo}
                autoPlay
                controls
                muted
                className="w-[900px] h-[400px] object-cover mb-4 shadow-md"
              />
              <h1 className="mt-8 text-editionColor text-3xl">
                About the game
              </h1>
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

                  {gameStock.Platform === "Windows" ? (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="bi bi-windows"
                        viewBox="0 0 16 16"
                        color="white"
                      >
                        <path d="M6.555 1.375 0 2.237v5.45h6.555zM0 13.795l6.555.933V8.313H0zm7.278-5.4.026 6.378L16 16V8.395zM16 0 7.33 1.244v6.414H16z" />
                      </svg>
                    </div>
                  ) : gameStock.Platform === "PS5" ? (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="bi bi-playstation"
                        viewBox="0 0 16 16"
                        color="white"
                      >
                        <path d="M15.858 11.451c-.313.395-1.079.676-1.079.676l-5.696 2.046v-1.509l4.192-1.493c.476-.17.549-.412.162-.538-.386-.127-1.085-.09-1.56.08l-2.794.984v-1.566l.161-.054s.807-.286 1.942-.412c1.135-.125 2.525.017 3.616.43 1.23.39 1.368.962 1.056 1.356M9.625 8.883v-3.86c0-.453-.083-.87-.508-.988-.326-.105-.528.198-.528.65v9.664l-2.606-.827V2c1.108.206 2.722.692 3.59.985 2.207.757 2.955 1.7 2.955 3.825 0 2.071-1.278 2.856-2.903 2.072Zm-8.424 3.625C-.061 12.15-.271 11.41.304 10.984c.532-.394 1.436-.69 1.436-.69l3.737-1.33v1.515l-2.69.963c-.474.17-.547.411-.161.538.386.126 1.085.09 1.56-.08l1.29-.469v1.356l-.257.043a8.45 8.45 0 0 1-4.018-.323Z" />
                      </svg>
                    </div>
                  ) : gameStock.Platform === "Xbox" ? (
                    <div className="flex flex-row p-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="bi bi-xbox"
                        viewBox="0 0 16 16"
                        color="white"
                      >
                        <path d="M7.202 15.967a8 8 0 0 1-3.552-1.26c-.898-.585-1.101-.826-1.101-1.306 0-.965 1.062-2.656 2.879-4.583C6.459 7.723 7.897 6.44 8.052 6.475c.302.068 2.718 2.423 3.622 3.531 1.43 1.753 2.088 3.189 1.754 3.829-.254.486-1.83 1.437-2.987 1.802-.954.301-2.207.429-3.239.33m-5.866-3.57C.589 11.253.212 10.127.03 8.497c-.06-.539-.038-.846.137-1.95.218-1.377 1.002-2.97 1.945-3.95.401-.417.437-.427.926-.263.595.2 1.23.638 2.213 1.528l.574.519-.313.385C4.056 6.553 2.52 9.086 1.94 10.653c-.315.852-.442 1.707-.306 2.063.091.24.007.15-.3-.319Zm13.101.195c.074-.36-.019-1.02-.238-1.687-.473-1.443-2.055-4.128-3.508-5.953l-.457-.575.494-.454c.646-.593 1.095-.948 1.58-1.25.381-.237.927-.448 1.161-.448.145 0 .654.528 1.065 1.104a8.4 8.4 0 0 1 1.343 3.102c.153.728.166 2.286.024 3.012a9.5 9.5 0 0 1-.6 1.893c-.179.393-.624 1.156-.82 1.404-.1.128-.1.127-.043-.148ZM7.335 1.952c-.67-.34-1.704-.705-2.276-.803a4 4 0 0 0-.759-.043c-.471.024-.45 0 .306-.358A7.8 7.8 0 0 1 6.47.128c.8-.169 2.306-.17 3.094-.005.85.18 1.853.552 2.418.9l.168.103-.385-.02c-.766-.038-1.88.27-3.078.853-.361.176-.676.316-.699.312a12 12 0 0 1-.654-.319Z" />
                      </svg>
                    </div>
                  ) : (
                    <div>
                      <span>Other Platform</span>
                    </div>
                  )}
                </CardBody>
                <CardFooter className="text-center">
                  <Button
                    onClick={() => handleAddToCart(gameStock._id)}
                    color="primary"
                    radius="none"
                    className="mt-4 w-[300px]"
                    variant="ghost"
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
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
                    <label className="block text-gray-700 mb-2">
                      Quantity:
                    </label>
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

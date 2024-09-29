import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import GameIcon from "../assets/icons/detailsIcon";
import {
  Spinner,
  Card,
  CardBody,
  Chip,
  ScrollShadow,
  Input,
} from "@nextui-org/react";
import Loader from "../components/Loader/loader";

const Shop = () => {
  const [gameStocks, setGameStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingsData, setRatingsData] = useState([]);
  const [showtoprated, setShowTopRated] = useState(false);

  useEffect(() => {
    const fetchGameStocks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8098/gameStocks/allGameStock"
        );
        setGameStocks(response.data.allGameStocks);
        setFilteredStocks(response.data.allGameStocks);
      } catch (err) {
        setError(err.message);
      } finally {
        // Delay the end of loading to ensure the Loader is visible for at least 2 seconds
        const minLoadingTime = 1000; // 2 seconds
        const actualLoadingTime = Date.now() - startLoadingTime;
        const delay = Math.max(minLoadingTime - actualLoadingTime, 0);

        setTimeout(() => {
          setLoading(false);
        }, delay);
      }
    };

    const startLoadingTime = Date.now();
    fetchGameStocks();
  }, []);

  const fetchRatings = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8098/ratings/game/${id}`
      );
      const ratings = response.data;

      // Calculate average rating
      const avg =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            ratings.length
          : undefined;

      // Check if avg is defined
      if (avg !== undefined) {
        // Create a new entry with gameId and averageRating
        const newRatingData = { gameId: id, averageRating: avg };

        // Update the state with the new entry
        setRatingsData((prevData) => {
          const updatedData = [...prevData, newRatingData];

          // Filter out entries where averageRating is undefined
          const filteredData = updatedData.filter(
            (data) => data.averageRating !== undefined
          );

          // Sort by averageRating in descending order
          const sortedData = filteredData.sort(
            (a, b) => b.averageRating - a.averageRating
          );

          return sortedData;
        });
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  useEffect(() => {
    gameStocks.forEach((game) => {
      console.log(game._id);
      fetchRatings(game._id);
    });
  }, [setShowTopRated, showtoprated]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredStocks(gameStocks);
    } else {
      setFilteredStocks(
        gameStocks.filter((stock) =>
          stock.AssignedGame.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, gameStocks]);

  useEffect(() => {
    console.log("Ratings Data: ");
    ratingsData.map((rating) => {
      console.log(rating);
    });
  }, [ratingsData]);

  useEffect(() => {
    const orderedFilteredStocks = ratingsData
      .map((rating) => gameStocks.find((stock) => stock._id === rating.gameId))
      .filter((stock) => stock !== undefined);

    if (showtoprated) {
      setFilteredStocks(orderedFilteredStocks);
      console.log("Filtered Stocks: ");
      filteredStocks.map((stock) => {
        console.log(stock);
      });
    }
  }, [ratingsData, gameStocks]);

  if (loading) return <Loader />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-customDark text-white dark">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          {/* Search Bar */}
          <Input
            clearable
            underlined
            placeholder="SEARCH GAMES ..."
            className="w-[400px] font-primaryRegular dark ml-[50px] mt-8"
            size="lg"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowTopRated(false);
            }}
            value={searchTerm}
          />
        </div>

        <button
          className="text-[#f21160] px-16 pb-8"
          onClick={() => {
            setShowTopRated(true);
          }}
        >
          Show Top Rated This week...
        </button>

        {filteredStocks.length === 0 ? (
          <p className="text-gray-400 text-center">No Games Found</p>
        ) : (
          <ScrollShadow hideScrollBar>
            <div className="flex flex-wrap justify-center gap-8">
              {" "}
              {/* Adjusted gap */}
              {filteredStocks.map((stock) => {
                const originalPrice = stock.UnitPrice;
                const discount = stock.discount;
                const discountedPrice =
                  discount > 0
                    ? originalPrice - (originalPrice * discount) / 100
                    : originalPrice;

                return (
                  <Card
                    key={stock._id}
                    className="relative  bg-opacity-20 rounded-lg shadow-lg text-white transform transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl hover:bg-opacity-80 w-[250px] h-[500px]"
                  >
                    <Link to={`/game/${stock._id}`}>
                      <div className="relative">
                        <img
                          alt={stock.AssignedGame.title}
                          style={{
                            width: "250px",
                            height: "350px",
                            objectFit: "cover",
                          }}
                          src={stock.AssignedGame.coverPhoto}
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                          <GameIcon />
                        </div>
                      </div>
                      <CardBody className="p-2 text-white">
                        {" "}
                        {/* Reduced padding */}
                        <h2 className="text-lg font-primaryRegular text-white mb-1">
                          {stock.AssignedGame.title}
                        </h2>
                        <p className="font-primaryRegular text-white mb-1">
                          {discount > 0 && (
                            <>
                              <Chip
                                color="danger"
                                radius="none"
                                className="font-primaryRegular mr-1"
                                size="sm"
                              >
                                -{stock.discount}% off
                              </Chip>
                              <span
                                className="line-through mr-1 text-editionColor"
                                style={{ fontSize: "15px" }}
                              >
                                LKR.{originalPrice}
                              </span>
                            </>
                          )}
                          <span style={{ fontSize: "15px" }}>
                            LKR.{discountedPrice}
                          </span>
                        </p>
                        <div className="flex flex-wrap mb-1 text-white">
                          {stock.AssignedGame.Genre.flatMap((genre) =>
                            genre.includes(",") ? genre.split(",") : genre
                          ).map((genre, index) => (
                            <Chip
                              variant="dot"
                              size="sm"
                              radius="none"
                              className="font-primaryRegular"
                              color="danger"
                              key={index}
                            >
                              {(() => {
                                const genreName =
                                  genre.trim().charAt(0).toUpperCase() +
                                  genre.trim().slice(1);
                                if (genreName === "Action") return `Action ⚔️`;
                                if (genreName === "Adventure")
                                  return `Adventure 🐾`;
                                if (genreName === "Racing") return `Racing 🏎️`;
                                if (genreName === "Puzzle") return `Puzzle 🧩`;
                                if (genreName === "Fighting")
                                  return `Fighting 🥷🏻`;
                                if (genreName === "Strategy")
                                  return `Strategy 🙄`;
                                if (genreName === "Sport") return `Sport 🏅`;
                                return genreName; // Fallback in case no match is found
                              })()}
                            </Chip>
                          ))}
                        </div>
                      </CardBody>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </ScrollShadow>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Shop;

import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import GameIcon from "../assets/icons/detailsIcon";
import {
  Card,
  CardBody,
  Chip,
  ScrollShadow,
  Input,
} from "@nextui-org/react";
import Loader from "../components/Loader/loader";
import { IoIosArrowForward } from "react-icons/io";  
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import '../style/Shop.css';
import { BackgroundLines } from "../components/ui/background-lines";

const Shop = () => {
  const [gameStocks, setGameStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingsData, setRatingsData] = useState([]);
  const [showtoprated, setShowTopRated] = useState(false);
  const [swiperLoading, setSwiperLoading] = useState(false);

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
        setLoading(false); 
      }
    };

    
    fetchGameStocks();
  }, [showtoprated]);

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
  className="text-[white] font-bold px-16 pb-8 flex flex-row gap-2 items-center  text-left text-[22px]"
  onClick={() => {
    setSwiperLoading(true); // Start loading state immediately when clicked
    setShowTopRated(true); // Set the showtoprated state to true

    // Set timeout to simulate delay (if you still need it), but move state management into useEffect
    setTimeout(() => {
      setSwiperLoading(false); // After 500ms, stop loading
    }, 1500);
  }}
>
  Show Top Rated This week <IoIosArrowForward />
</button>


        {filteredStocks.length === 0 ? (
          <p className="text-gray-400 text-center">No Games Found</p>
        ) : (
          <ScrollShadow hideScrollBar className="">
            {showtoprated ? (
              swiperLoading ? (
                <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-t-customPink border-transparent border-solid rounded-full animate-spin"></div>
                </div>
              ) : (
                <Swiper
                  effect={'coverflow'}
                  grabCursor={true}
                  centeredSlides={true}
                  loop={true}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  slidesPerView={'auto'}
                  spaceBetween={100}
                  coverflowEffect={{
                    rotate: 30,
                    stretch: 0,
                    depth: 200,
                    modifier: 1,
                    slideShadows: true,
                  }}
                  pagination={{ el: '.swiper-pagination', clickable: true }}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                    clickable: true,
                  }}
                  modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
                  className="swiper_container overflow-hidden w-[850px] "
                >
                  {filteredStocks.map((stock,index) => {
                    const originalPrice = stock.UnitPrice;
                    const discount = stock.discount;
                    const discountedPrice =
                      discount > 0
                        ? originalPrice - (originalPrice * discount) / 100
                        : originalPrice;

                    return (
                      <SwiperSlide key={stock._id} className='slide w-fit '>
                        <Card
                          className="relative bg-opacity-20 z-40 rounded-lg shadow-lg text-white transform transition-transform duration-300  hover:z-10 hover:shadow-2xl hover:bg-opacity-80 w-[250px] h-[500px] hover:scale-1"
                        > 
                          
                          
                          <Link to={`/game/${stock._id}`}>
                          <div className="rank absolute z-49 top-[34%] text-center justify-center items-center text-white "></div>
                          <p className="rankNum absolute top-[30%] z-50  left-[28%] text-[35px]  gaming-animation">Top : {index + 1} </p>
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
                              

                              <div className="absolute  inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300  hover:opacity-100">
                                <GameIcon />
                              </div>
                            </div>
                            <CardBody className="p-2 text-white">
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
                                      if (genreName === "Action")
                                        return `Action ⚔️`;
                                      if (genreName === "Adventure")
                                        return `Adventure 🐾`;
                                      if (genreName === "Racing")
                                        return `Racing 🏎️`;
                                      if (genreName === "Puzzle")
                                        return `Puzzle 🧩`;
                                      if (genreName === "Fighting")
                                        return `Fighting 🥷🏻`;
                                      if (genreName === "Strategy")
                                        return `Strategy 🙄`;
                                      if (genreName === "Sport")
                                        return `Sport 🏅`;
                                      return genreName; // Fallback in case no match is found
                                    })()}
                                  </Chip>
                                ))}
                              </div>
                            </CardBody>
                          </Link>
                        </Card>
                      </SwiperSlide>
                    );
                  })}
                  <div className="slider-controler hidden">
                    <div className="swiper-button-prev slider-arrow">
                      <ion-icon name="arrow-back-outline"></ion-icon>
                    </div>
                    <div className="swiper-button-next slider-arrow">
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                    </div>
                    <div className="swiper-pagination hidden"></div>
                  </div>
                </Swiper>
              )
            ) : (
              <div className="flex flex-wrap justify-center gap-8">
                
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
                      className="relative bg-customDark bg-opacity-20 rounded-lg shadow-lg text-white transform transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl hover:bg-opacity-80 w-[250px] h-[500px]"
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
                          <h2 className="text-lg font-primaryRegular text-white mb-1">
                            {stock.AssignedGame.title}
                          </h2>
                          <p className="font-primaryRegular text-white mb-1">
                            {discount > 0 && (
                              <>
                                <Chip
                                  color="primary"
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
                                color="primary"
                                key={index}
                              >
                                {(() => {
                                  const genreName =
                                    genre.trim().charAt(0).toUpperCase() +
                                    genre.trim().slice(1);
                                  if (genreName === "Action")
                                    return `ACTION`;
                                  if (genreName === "Adventure")
                                    return `ADVENTURE`;
                                  if (genreName === "Racing")
                                    return `RACING`;
                                  if (genreName === "Puzzle")
                                    return `PUZZLE`;
                                  if (genreName === "Fighting")
                                    return `FIGHTING `;
                                  if (genreName === "Strategy")
                                    return `STRATEGY`;
                                  if (genreName === "Sport")
                                    return `SPORT`;
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
            )}
          </ScrollShadow>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
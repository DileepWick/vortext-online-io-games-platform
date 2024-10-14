import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import GameIcon from "../assets/icons/detailsIcon";
import { TracingBeam } from "../components/ui/TracingBeam";
import { LampContainer } from "../components/ui/Lamp";
import { motion } from "framer-motion";
import { FlipWords } from "../components/ui/FlipWords";
import { TypewriterEffectSmooth } from "../components/ui/Typewriter";
import { TextGenerateEffect } from "../components/ui/text-generate-effect";
import {
  Card,
  CardBody,
  Chip,
  CardFooter,
  ScrollShadow,
  Input,
  Image,
  Button,
} from "@nextui-org/react";
import Loader from "../components/Loader/loader";
import { IoIosArrowForward } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import {
  EffectCoverflow,
  Pagination,
  Navigation,
  Autoplay,
} from "swiper/modules";
import "../style/Shop.css";
import { BackgroundLines } from "../components/ui/background-lines";
import { BackgroundGradient } from "../components/ui/BackgroundGradient";

const Shop = () => {
  const [gameStocks, setGameStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingsData, setRatingsData] = useState([]);
  const [showtoprated, setShowTopRated] = useState(false);
  const [swiperLoading, setSwiperLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const targetDivRef = useRef(null);
  const cateDivRef = useRef(null);

  const words = [
    "Enhance your gaming experience",
    "Discover the games you love",
    "Find the perfect gear",
    "Upgrade your collection",
    "Level up your gameplay",
    "Complete your gaming setup",
    "Explore the latest releases",
    "Gear up for victory",
    "Fuel your gaming passion",
    "Unlock exclusive content",
  ];

  const typeWriterWords = [
    {
      text: "Select ",
    },
    {
      text: "Your ",
    },
    {
      text: "Prefered ",
    },
    {
      text: "Game ",
    },
    {
      text: "Category!", // No space at the end for the last word
    },
  ];
  const scrollToWelcomeSection = () => {
    if (cateDivRef.current) {
      cateDivRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
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

  const handleButtonClick = () => {
    // Scroll to the target div only when the button is clicked
    if (targetDivRef.current) {
      targetDivRef.current.scrollIntoView({
        behavior: "smooth", // Optional: to animate the scroll
        block: "start", // Align the top of the div with the top of the viewport
      });
    }
  };

  //Search bar
  useEffect(() => {
    if (searchTerm === "" && selectedGenre === "") {
      setFilteredStocks(gameStocks);
    } else {
      setFilteredStocks(
        gameStocks.filter((stock) => {
          const matchesTitle = stock.AssignedGame.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesGenre = selectedGenre
            ? stock.AssignedGame.Genre.flatMap((genre) =>
                genre.includes(",") ? genre.split(",") : genre
              ).some(
                (genre) =>
                  genre.trim().toLowerCase() === selectedGenre.toLowerCase()
              )
            : true;

          return matchesTitle && matchesGenre;
        })
      );
    }
  }, [searchTerm, selectedGenre, gameStocks]);

  // Collect unique genres for the dropdown
  const uniqueGenres = ["Action", "Adventure", "Strategy","Sport","Puzzle","Strategy","Fighting"];


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
    <div className="h-[4000px] bg-customDark text-white dark">
      <Header />
      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-customDark"
        style={{
          backgroundImage: "url('/api/placeholder/1920/1080')", // Replace with your actual image URL
        }}
      >
        <div className="absolute inset-0 bg-customDark bg-opacity-0"></div>
        <div className="relative min-h-screen w-full overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source
              src="https://res.cloudinary.com/dhcawltsr/video/upload/v1718781647/Games%20cover%20images/waio5ufjthrdovrdazoh.mp4"
              type="video/mp4"
            />{" "}
            {/* Replace with your actual video URL */}
            Your browser does not support the video tag.
          </video>

          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

          {/* Content */}
          <div className="relative z-20 flex flex-col items-center justify-center min-h-screen">
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
              <FlipWords words={words} />
              <br /> from our shop
            </motion.h1>
            <motion.div
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
            >
              <div className="text-center mt-8">
                <Button
                  color="primary"
                  onClick={scrollToWelcomeSection}
                  variant="ghost"
                  className="text-[30px] text-white h-[80px] w-[200px] font-primaryRegular"
                  size="lg"
                >
                  Shop Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8" ref={cateDivRef}>
        <TracingBeam>
          <div className="mb-8"></div>
          <div className="mb-8 ml-8">
            <TypewriterEffectSmooth words={typeWriterWords} />
          </div>

          <div className="flex flex-wrap justify-center items-center space-x-4 space-y-4 mt-4 ml-8">
            {/* Genre Buttons */}
            <div className="flex flex-wrap space-x-4 mt-4 ml-8">
              <BackgroundGradient className="rounded-[22px]  bg-zinc-900 transition-transform duration-300 transform hover:scale-105">
                <Card
                  className="bg-customDark text-center mr-4 "
                  shadow="sm"
                  isPressable
                  style={{
                    width: "280px",
                    height: "250px",
                  }}
                  onPress={() => console.log("item pressed")} // Assuming you want this for some other action
                  onClick={() => {
                    setSelectedGenre(""); // Reset the selected genre
                    handleButtonClick(); // Call the function to scroll
                  }}
                >
                  <CardBody className="overflow-visible p-0">
                    <Image
                      shadow="sm"
                      radius="lg"
                      width="100%"
                      alt="sadadad"
                      className="w-full object-cover h-[200px]"
                      src="https://res.cloudinary.com/dhcawltsr/image/upload/v1728819813/DALL_E_2024-10-13_17.05.40_-_A_collection_of_video_game_cover_images_each_representing_different_game_genres._For_the_action_genre_depict_a_dynamic_and_intense_scene_with_explos_vwaopb.webp"
                    />
                  </CardBody>
                  <CardFooter className="text-lg text-center">All</CardFooter>
                </Card>
              </BackgroundGradient>
              {uniqueGenres.map((genre, index) => (
                <BackgroundGradient className="rounded-[22px]  bg-zinc-900 transition-transform duration-300 transform hover:scale-105">
                  <Card
                    style={{
                      width: "280px",
                      height: "250px",
                    }}
                    className="bg-customDark"
                    shadow="sm"
                    key={index}
                    isPressable
                    onPress={() => console.log("item pressed")}
                    onClick={() => {
                      setSelectedGenre(genre.trim()); // Reset the selected genre
                      handleButtonClick(); // Call the function to scroll
                    }}
                  >
                    <CardBody className="overflow-visible p-0">
                      <Image
                        shadow="sm"
                        radius="lg"
                        width="100%"
                        alt="sadadad"
                        className="w-full object-cover h-[200px]"
                        src={(() => {
                          if (genre.trim().toLowerCase() === "action")
                            return "https://res.cloudinary.com/dhcawltsr/image/upload/v1728819811/DALL_E_2024-10-13_17.07.33_-_A_high-energy_action_video_game_cover_image._Show_an_intense_battle_scene_with_explosions_fast-paced_combat_and_a_hero_in_futuristic_armor_wielding_assboi.webp";
                          if (genre.trim().toLowerCase() === "adventure")
                            return "https://res.cloudinary.com/dhcawltsr/image/upload/v1728821251/DALL_E_2024-10-13_17.37.23_-_Create_a_cover_image_for_adventure_games_using_the_color_theme_9171bb_light_purple_020617_dark_navy_7186a6_cool_grey-blue_and_19191b_dar_wltlqq.webp";
                          if (genre.trim().toLowerCase() === "sport")
                            return "https://res.cloudinary.com/dhcawltsr/image/upload/v1728820470/DALL_E_2024-10-13_17.21.57_-_An_action-packed_sports_game_cover_image_showing_athletes_in_intense_moments_of_play._One_player_is_kicking_a_soccer_ball_while_another_leaps_for_a_b_pdeixx.webp";
                          if (genre.trim().toLowerCase() === "puzzle")
                            return "https://res.cloudinary.com/dhcawltsr/image/upload/v1728820456/DALL_E_2024-10-13_17.22.43_-_A_creative_and_visually_captivating_cover_for_a_puzzle_game_with_intricate_geometric_shapes_and_puzzle_pieces_floating_in_a_futuristic_setting._The_d_c058co.webp";
                          if (genre.trim().toLowerCase() === "racing")
                            return "https://res.cloudinary.com/dhcawltsr/image/upload/v1728820997/DALL_E_2024-10-13_17.32.56_-_Create_a_dynamic_cover_image_for_racing_games_using_the_color_theme_9171bb_light_purple_020617_dark_navy_7186a6_cool_grey-blue_and_19191b_efoisq.webp";
                          if (genre.trim().toLowerCase() === "strategy")
                            return "https://res.cloudinary.com/dhcawltsr/image/upload/v1728821063/DALL_E_2024-10-13_17.34.00_-_Create_a_cover_image_for_strategy_games_using_the_color_theme_9171bb_light_purple_020617_dark_navy_7186a6_cool_grey-blue_and_19191b_dark_gioz6x.webp";
                          if (genre.trim().toLowerCase() === "fighting")
                            return "https://res.cloudinary.com/dhcawltsr/image/upload/v1728820483/DALL_E_2024-10-13_17.20.00_-_A_dynamic_cover_pic_for_a_fighting_game_featuring_intense_energetic_action_with_two_fighters_in_combat._The_scene_is_set_in_a_futuristic_arena_with_n08mf0.webp"; // Default image
                          return "path-to-horror-image.jpg";
                        })()}
                      />
                    </CardBody>
                    <CardFooter className="text-lg justify-between">
                      {genre.trim().charAt(0).toUpperCase() +
                        genre.trim().slice(1)}
                    </CardFooter>
                  </Card>
                </BackgroundGradient>
              ))}
            </div>
          </div>
          <div className="mb-8 mt-8 text-customDark" ref={targetDivRef}>
            i
          </div>
           {/*
          <button
            className="text-[white] font-primaryRegular px-16 pb-8 flex flex-row gap-2 items-center  text-left text-[22px] mt-8"
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
          </button>*/}

          {/* Search Bar */}

          <Input
            clearable
            underlined
            placeholder="Search Games ..."
            className="w-[400px] font-primaryRegular bg-customdark ml-[70px]  mb-8 "
            size="lg"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowTopRated(false);
            }}
            value={searchTerm}
          />

          {filteredStocks.length === 0 ? (
            <p className="text-gray-400 text-center">No Games Found</p>
          ) : (
            <>
              <ScrollShadow hideScrollBar className="">
                {showtoprated ? (
                  swiperLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="w-10 h-10 border-4 border-t-customPink border-transparent border-solid rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Swiper
                      effect={"coverflow"}
                      grabCursor={true}
                      centeredSlides={true}
                      loop={true}
                      autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                      }}
                      slidesPerView={"auto"}
                      spaceBetween={100}
                      coverflowEffect={{
                        rotate: 30,
                        stretch: 0,
                        depth: 200,
                        modifier: 1,
                        slideShadows: true,
                      }}
                      pagination={{ el: ".swiper-pagination", clickable: true }}
                      navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                        clickable: true,
                      }}
                      modules={[
                        EffectCoverflow,
                        Pagination,
                        Navigation,
                        Autoplay,
                      ]}
                      className="swiper_container overflow-hidden w-[850px] "
                    >
                      {filteredStocks.map((stock, index) => {
                        const originalPrice = stock.UnitPrice;
                        const discount = stock.discount;
                        const discountedPrice =
                          discount > 0
                            ? originalPrice - (originalPrice * discount) / 100
                            : originalPrice;

                        return (
                          <SwiperSlide key={stock._id} className="slide w-fit ">
                            <BackgroundGradient className="rounded-[22px]  bg-zinc-100">
                              <Card>
                                <Link to={`/game/${stock._id}`}>
                                  <div className="rank absolute z-49 top-[34%] text-center justify-center items-center text-white "></div>
                                  <p className="rankNum absolute top-[30%] z-50  left-[28%] text-[35px]  gaming-animation">
                                    {index + 1}{" "}
                                  </p>
                                  <div className="relative">
                                    <img
                                      alt={stock.AssignedGame.title}
                                      style={{
                                        width: "290px",
                                        height: "350px",
                                        objectFit: "cover",
                                      }}
                                      src={stock.AssignedGame.coverPhoto}
                                    />
                                  </div>
                                  <CardBody className="p-2 text-white bg-customDark">
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
                                      {stock.AssignedGame.Genre.flatMap(
                                        (genre) =>
                                          genre.includes(",")
                                            ? genre.split(",")
                                            : genre
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
                                              genre
                                                .trim()
                                                .charAt(0)
                                                .toUpperCase() +
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
                            </BackgroundGradient>
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
                        <BackgroundGradient className="rounded-[22px]  bg-zinc-100">
                          <Card key={stock._id}>
                            <Link to={`/game/${stock._id}`}>
                              <div className="relative">
                                <img
                                  alt={stock.AssignedGame.title}
                                  style={{
                                    width: "290px",
                                    height: "350px",
                                    objectFit: "cover",
                                  }}
                                  src={stock.AssignedGame.coverPhoto}
                                />

                                <div className="absolute inset-0 flex items-center justify-center bg-customDark bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                                  <GameIcon />
                                </div>
                              </div>
                              <CardBody className="p-2 text-white bg-customDark">
                                <h2 className="text-lg font-primaryRegular text-white mb-1">
                                  {stock.AssignedGame.title}
                                </h2>
                                <p className="font-primaryRegular text-white mb-1">
                                  {discount > 0 && (
                                    <>
                                      <Chip
                                        style={{
                                          backgroundImage:
                                            "linear-gradient(135deg, #2596be, #3b2c81, #29aefc, #29aefc, #040414)",
                                        }}
                                        radius="none"
                                        className="font-primaryRegular mr-1"
                                        size="lg"
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
                                    genre.includes(",")
                                      ? genre.split(",")
                                      : genre
                                  ).map((genre, index) => (
                                    <Chip
                                      variant="dot"
                                      size="sm"
                                      radius="none"
                                      className="font-primaryRegular m-[2px]"
                                      color="default"
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
                        </BackgroundGradient>
                      );
                    })}
                  </div>
                )}
              </ScrollShadow>
            </>
          )}
        </TracingBeam>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;

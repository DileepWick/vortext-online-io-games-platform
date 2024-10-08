import { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast, Flip } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";
import "../style/Slider.css";
import Hangman from "../components/Games/Hangaman";
import Chatbot from "../components/chatbox";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { LampContainer } from "../components/ui/lamp";
import { SparklesCore } from "../components/ui/sparkles";

const Home = () => {
  const [gameStocks, setGameStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const notify = () => {
    toast.success("🦄 Wow so easy!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Flip,
      progressBarClassName: "bg-gray-800",
      style: { fontFamily: "Rubik" },
    });
  };

  const propFunction = () => {
    alert("Hello");
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
  }, [gameStocks, setGameStocks]);

  useEffect(() => {
    const top5Ratings = ratingsData.slice(0, 3); // Get top 5 based on averageRating
    const orderedFilteredStocks = top5Ratings
      .map((rating) => gameStocks.find((stock) => stock._id === rating.gameId))
      .filter((stock) => stock !== undefined);

    setFilteredStocks(orderedFilteredStocks);
    console.log("Filtered Stocks: ");
    filteredStocks.map((stock) => {
      console.log(stock);
    });
  }, [ratingsData, gameStocks]);

  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const listRef = useRef(null);
  const thumbnailRef = useRef(null);
  const timeRef = useRef(null);
  const nextRef = useRef(null);
  const prevRef = useRef(null);

  const timeRunning = 3000; // Time for animation
  const timeAutoNext = 4000; // Time between slides

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, timeAutoNext);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [activeIndex]);

  const handleNext = () => {
    showSlider("next");
  };

  const handlePrev = () => {
    showSlider("prev");
  };

  const showSlider = (type) => {
    const sliderItems = listRef.current.children;
    const thumbnailItems = thumbnailRef.current.children;

    if (type === "next") {
      listRef.current.appendChild(sliderItems[0]);
      thumbnailRef.current.appendChild(thumbnailItems[0]);
      carouselRef.current.classList.add("next");
    } else {
      listRef.current.prepend(sliderItems[sliderItems.length - 1]);
      thumbnailRef.current.prepend(thumbnailItems[thumbnailItems.length - 1]);
      carouselRef.current.classList.add("prev");
    }

    setTimeout(() => {
      carouselRef.current.classList.remove("next");
      carouselRef.current.classList.remove("prev");
    }, timeRunning);
  };

  return (
    <div className="font-primaryRegular bg-customDark flex flex-col min-h-screen">
      <Helmet>
        <title>Welcome to Vortex</title>
      </Helmet>
      <Header />

      <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <h1 className="md:text-7xl text-3xl lg:text-9xl  text-center text-white relative z-20">
        Vortex
      </h1>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
 
        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
 
        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
























      
      <div className="m-auto  mt-[80px] mb-[40px]">
        <div className="carousel" ref={carouselRef}>
          <div className="list" ref={listRef}>
            {filteredStocks[0] && (
              <div className="item">
                <img src={filteredStocks[0].AssignedGame.coverPhoto} />
                <div
                  className="darklayer absolute -z-0 top-0 w-[100%] h-[100%] "
                  ref={timeRef}
                ></div>
                <div className="content">
                  <div className="title">
                    {filteredStocks[0].AssignedGame.title}
                  </div>
                  <div className="topic">
                    -{filteredStocks[0].discount}% off
                  </div>
                  <div className="des">
                    {filteredStocks[0].AssignedGame.Description}
                  </div>

                  <div className="author">
                    <span className="line-through mr-1 text-editionColor">
                      LKR.{filteredStocks[0].UnitPrice}
                    </span>
                    <span className="discprice">
                      LKR.
                      {filteredStocks[0].discount > 0
                        ? filteredStocks[0].UnitPrice -
                          (filteredStocks[0].UnitPrice *
                            filteredStocks[0].discount) /
                            100
                        : filteredStocks[0].UnitPrice}
                    </span>
                  </div>
                  <div className="buttons">
                    <Link to={`/game/${filteredStocks[0]._id}`}>
                      {" "}
                      <button className="border-none bg-[#f1683a] tracking-widest font-poppins font-medium p-[10px] rounded-[5px]">
                        SEE MORE{" "}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {filteredStocks[1] && (
              <div className="item">
                <img src={filteredStocks[1].AssignedGame.coverPhoto} />
                <div
                  className="darklayer absolute -z-0 top-0 w-[100%] h-[100%] "
                  ref={timeRef}
                ></div>
                <div className="content">
                  <div className="title">
                    {filteredStocks[1].AssignedGame.title}
                  </div>
                  <div className="topic">
                    -{filteredStocks[1].discount}% off
                  </div>
                  <div className="des">
                    {filteredStocks[1].AssignedGame.Description}
                  </div>

                  <div className="author">
                    <span className="line-through mr-1 text-editionColor">
                      LKR.{filteredStocks[1].UnitPrice}
                    </span>
                    <span className="discprice">
                      LKR.
                      {filteredStocks[1].discount > 0
                        ? filteredStocks[1].UnitPrice -
                          (filteredStocks[1].UnitPrice *
                            filteredStocks[1].discount) /
                            100
                        : filteredStocks[1].UnitPrice}
                    </span>
                  </div>
                  <div className="buttons">
                    <Link to={`/game/${filteredStocks[1]._id}`}>
                      {" "}
                      <button className="border-none bg-[#f1683a] tracking-widest font-poppins font-medium p-[10px] rounded-[5px]">
                        SEE MORE{" "}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {filteredStocks[2] && (
              <div className="item">
                <img src={filteredStocks[2].AssignedGame.coverPhoto} />
                <div
                  className="darklayer absolute -z-0 top-0 w-[100%] h-[100%] "
                  ref={timeRef}
                ></div>
                <div className="content">
                  <div className="title">
                    {filteredStocks[2].AssignedGame.title}
                  </div>
                  <div className="topic">
                    -{filteredStocks[2].discount}% off
                  </div>
                  <div className="des">
                    {filteredStocks[2].AssignedGame.Description}
                  </div>

                  <div className="author">
                    <span className="line-through mr-1 text-editionColor">
                      LKR.{filteredStocks[2].UnitPrice}
                    </span>
                    <span className="discprice">
                      LKR.
                      {filteredStocks[2].discount > 0
                        ? filteredStocks[2].UnitPrice -
                          (filteredStocks[2].UnitPrice *
                            filteredStocks[2].discount) /
                            100
                        : filteredStocks[2].UnitPrice}
                    </span>
                  </div>
                  <div className="buttons">
                    <Link to={`/game/${filteredStocks[2]._id}`}>
                      {" "}
                      <button className="border-none bg-[#f1683a] tracking-widest font-poppins font-medium p-[10px] rounded-[5px]">
                        SEE MORE{" "}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="thumbnail " ref={thumbnailRef}>
            {filteredStocks[0] && (
              <div className="item">
                <img src={filteredStocks[0].AssignedGame.coverPhoto} />
                <div className="content">
                  {/* <div className="title">{image.title}</div> */}
                  {/* <div className="description">{image.description}</div> */}
                </div>
              </div>
            )}
            {filteredStocks[1] && (
              <div className="item">
                <img src={filteredStocks[1].AssignedGame.coverPhoto} />
                <div className="content">
                  {/* <div className="title">{image.title}</div> */}
                  {/* <div className="description">{image.description}</div> */}
                </div>
              </div>
            )}
            {filteredStocks[2] && (
              <div className="item">
                <img src={filteredStocks[2].AssignedGame.coverPhoto} />
                <div className="content">
                  {/* <div className="title">{image.title}</div> */}
                  {/* <div className="description">{image.description}</div> */}
                </div>
              </div>
            )}
          </div>
          <div className="arrows hidden">
            <button id="prev" ref={prevRef} onClick={handlePrev}>
              &lt;
            </button>
            <button id="next" ref={nextRef} onClick={handleNext}>
              &gt;
            </button>
          </div>
          <div className="time" ref={timeRef}></div>
        </div>
      </div>
      <Footer />
      <script src="../components/Slider.jsx"></script>
    </div>
  );
};

export default Home;

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { LampContainer } from "../components/ui/Lamp";
import { FlipWords } from "../components/ui/FlipWords";
import { TypewriterEffectSmooth } from "../components/ui/Typewriter";
import { TracingBeam } from "../components/ui/TracingBeam";
import { BackgroundGradient } from "../components/ui/BackgroundGradient";
import { BackgroundBeams } from "../components/ui/BackgroundBeams";
import { Button } from "@nextui-org/react";

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [latestRatings, setLatestRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, ratingsResponse] = await Promise.all([
          axios.get("http://localhost:8098/gameStocks/allGameStock"),
          axios.get("http://localhost:8098/ratings/getnewratings"),
        ]);
        setFeaturedGames(gamesResponse.data.allGameStocks.slice(0, 5));
        setLatestRatings(ratingsResponse.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentSlide, featuredGames.length]);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % featuredGames.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prevSlide) =>
        (prevSlide - 1 + featuredGames.length) % featuredGames.length
    );
  };

  return (
    <div className="font-primaryRegular bg-customDark flex flex-col min-h-screen">
      {" "}
      <TracingBeam>
        <Helmet>
          <title>Welcome to Vortex Gaming</title>
        </Helmet>
        <Header />

        {/* Hero Section */}

        <LampContainer>
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
          >
            <FlipWords words={["Discover", "Play", "Connect", "Shop"]} />
          </motion.h1>
          <p className="text-white text-xl mt-4 text-center">
            Your one-stop destination for all things gaming
          </p>
          <Button color="primary" variant="shadow" size="lg" className="mt-8">
            Explore Our Shop
          </Button>
        </LampContainer>

        {/* Game Shop Highlight */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Vortex Game Shop
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                "Latest Releases",
                "Top Sellers",
                "Indie Gems",
                "Special Offers",
              ].map((category, index) => (
                <BackgroundGradient key={index} className="rounded-xl p-1">
                  <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col justify-between">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {category}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Discover amazing games in our {category.toLowerCase()}{" "}
                      collection.
                    </p>
                    <Button color="primary" size="sm">
                      Browse {category}
                    </Button>
                  </div>
                </BackgroundGradient>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button color="secondary" size="lg">
                Visit Full Shop
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Games Slider */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl font-bold text-white mb-8">
              Featured Games
            </h2>
            <div className="relative" ref={sliderRef}>
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredGames.map((game, index) => (
                    <div key={game._id} className="w-full flex-shrink-0">
                      <div className="relative h-96">
                        <img
                          src={game.AssignedGame.coverPhoto}
                          alt={game.AssignedGame.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                          <h3 className="text-3xl font-bold text-white mb-2">
                            {game.AssignedGame.title}
                          </h3>
                          <p className="text-gray-300 mb-4">
                            {game.AssignedGame.Description.substring(0, 150)}...
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-green-400">
                              $
                              {(
                                game.UnitPrice -
                                (game.UnitPrice * game.discount) / 100
                              ).toFixed(2)}
                            </span>
                            <Link to={`/game/${game._id}`}>
                              <Button color="primary" size="lg">
                                View Game
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                &#10094;
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                &#10095;
              </button>
            </div>
          </div>
        </section>

        {/* AI Assistant Feature */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-[50px] font-primaryRegular text-white mb-4">
                  Meet Gwen <br></br>Your AI Gaming Assistant
                </h2>
                <p className="text-[30px] text-gray-300 mb-6">
                  Get personalized game recommendations, strategy tips, and
                  instant answers to your gaming questions.
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-[200px]">
                <div className="bg-white rounded-[200px] p-6 shadow-xl">
                  <div className="flex justify-center">
                    <img
                      src="https://res.cloudinary.com/dhcawltsr/image/upload/v1727709362/smart-girl-animation-download--unscreen_icm1qe.gif"
                      alt="AI Assistant Gwen"
                      className="rounded-lg w-[300px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Indie Developers Section */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Calling All Indie Developers
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Join our platform and showcase your games to a passionate
                  community of gamers. We provide the tools and support you need
                  to succeed.
                </p>
                <Button color="success" size="lg">
                  Join as a Developer
                </Button>
              </div>
              <div className="md:w-1/2">
                <img
                  src="https://res.cloudinary.com/dhcawltsr/image/upload/v1728837460/Video_game_developer_qahcp2.gif"
                  alt="Indie Developer"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Gaming Community Section */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-8">
              Join Our Thriving Gaming Community
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with fellow gamers, share experiences, participate in
              events, and level up together!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <BackgroundGradient className="rounded-xl p-1">
                <div className="bg-gray-800 rounded-lg p-6 h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">Forums</h3>
                  <p className="text-gray-300 mb-4">
                    Discuss strategies, share tips, and make new friends.
                  </p>
                  <Button color="primary" size="sm">
                    Visit Forums
                  </Button>
                </div>
              </BackgroundGradient>
              <BackgroundGradient className="rounded-xl p-1">
                <div className="bg-gray-800 rounded-lg p-6 h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">Events</h3>
                  <p className="text-gray-300 mb-4">
                    Join tournaments, watch live streams, and attend virtual
                    meetups.
                  </p>
                  <Button color="primary" size="sm">
                    See Events
                  </Button>
                </div>
              </BackgroundGradient>
              <BackgroundGradient className="rounded-xl p-1">
                <div className="bg-gray-800 rounded-lg p-6 h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">Groups</h3>
                  <p className="text-gray-300 mb-4">
                    Find like-minded gamers and form your own gaming clans.
                  </p>
                  <Button color="primary" size="sm">
                    Explore Groups
                  </Button>
                </div>
              </BackgroundGradient>
            </div>
            <Button color="secondary" size="lg">
              Join Community
            </Button>
          </div>
        </section>

        {/* Support Unit Section */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              World-Class Support at Your Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BackgroundGradient className="rounded-xl p-1">
                <div className="bg-gray-800 rounded-lg p-6 h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    24/7 Assistance
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Our support team is always ready to help, any time of day or
                    night.
                  </p>
                  <Button color="primary" size="sm">
                    Contact Support
                  </Button>
                </div>
              </BackgroundGradient>
              <BackgroundGradient className="rounded-xl p-1">
                <div className="bg-gray-800 rounded-lg p-6 h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Knowledge Base
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Find answers to common questions in our comprehensive guide.
                  </p>
                  <Button color="primary" size="sm">
                    Browse FAQs
                  </Button>
                </div>
              </BackgroundGradient>
              <BackgroundGradient className="rounded-xl p-1">
                <div className="bg-gray-800 rounded-lg p-6 h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Community Support
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Get help from our community of experienced gamers and
                    developers.
                  </p>
                  <Button color="primary" size="sm">
                    Visit Forum
                  </Button>
                </div>
              </BackgroundGradient>
            </div>
          </div>
        </section>

        {/* Latest Reviews */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Latest Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestRatings.map((rating, index) => (
                <BackgroundGradient key={index} className="rounded-xl p-1">
                  <div className="bg-gray-800 rounded-lg p-6 h-full">
                    <p className="text-gray-300 mb-4">{rating.comment}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">
                        {rating.user?.username || "Anonymous"}
                      </span>
                      <span className="text-yellow-400">{rating.rating}/5</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {rating.game?.AssignedGame?.title || "Unknown Game"}
                    </p>
                  </div>
                </BackgroundGradient>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-8">
              Stay in the Loop
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Subscribe to our newsletter for the latest game releases and
              exclusive offers.
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-primary mb-4"
              />
              <Button color="primary" size="lg" className="w-full">
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </TracingBeam>
    </div>
  );
};

export default Home;

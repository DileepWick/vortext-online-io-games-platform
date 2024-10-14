import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, inView } from "framer-motion";
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
import AIAssistantSection from "../components/ui/AIAssistantSection";
import IndieDeveloperSection from "../components/ui/DeveloperSection";
import { TypewriterEffectOneWordSmooth } from "../components/ui/TypeWriterOneWord";

const AnimatedSection = ({ children }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
};
const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [latestRatings, setLatestRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const shopSectionRef = useRef(null);
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const sectionRef = useRef(null); // Reference for the section
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [hoverDirection, setHoverDirection] = useState("");

  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
const totalSlides = featuredGames.length;

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
  }, 3000);

  return () => clearInterval(intervalId);
}, [currentSlide]);

useEffect(() => {
  if (isTransitioning) {
    const timeoutId = setTimeout(() => {
      setIsTransitioning(false);
      if (currentSlide > totalSlides) {
        setCurrentSlide(1);
      } else if (currentSlide < 1) {
        setCurrentSlide(totalSlides);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }
}, [currentSlide, isTransitioning, totalSlides]);

const nextSlide = () => {
  setIsTransitioning(true);
  setCurrentSlide(prevSlide => prevSlide + 1);
};

const prevSlide = () => {
  setIsTransitioning(true);
  setCurrentSlide(prevSlide => prevSlide - 1);
};

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const handleScrollToShopSection = () => {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMouseEnter = (e) => {
    const { top, left, width, height } = e.target.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    const angle = Math.atan2(y, x) * (180 / Math.PI);

    if (angle >= -45 && angle <= 45) {
      setHoverDirection("left");
    } else if (angle > 45 && angle <= 135) {
      setHoverDirection("up");
    } else if (angle > -135 && angle <= -45) {
      setHoverDirection("down");
    } else {
      setHoverDirection("right");
    }
  };

  const handleMouseLeave = () => {
    setHoverDirection("");
  };
  const hoverVariants = {
    up: { y: -10 },
    down: { y: 10 },
    left: { x: -10 },
    right: { x: 10 },
    initial: { x: 0, y: 0 },
  };
  return (
    <div className="font-primaryRegular bg-customDark flex flex-col min-h-screen">
      {" "}
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
          <TypewriterEffectOneWordSmooth
            words={[
              { text: "Discover" },
              { text: "Play" },
              { text: "Connect" },
              { text: "Shop" },
            ]}
          />
        </motion.h1>
        <p className="text-white text-4xl mt-4 text-center">
          Your one-stop destination for all things gaming
        </p>
        <motion.button
          initial="initial"
          animate={hoverDirection || "initial"}
          variants={hoverVariants}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleScrollToShopSection}
          className="mt-8 px-16 py-8 bg-transparent border-2 border-white rounded-full text-white text-2xl font-bold hover:bg-white hover:text-black"
        >
          Explore
        </motion.button>
      </LampContainer>
      <TracingBeam>
        {/* Game Shop Highlight */}
        <section
          className="py-16 relative overflow-hidden"
          ref={shopSectionRef}
        >
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <h2 className="text-4xl font-bold text-white mb-8 text-center">
                Vortex Game Shop
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                "Latest Releases",
                "Top Sellers",
                "Indie Games",
                "Special Offers",
              ].map((category, index) => (
                <AnimatedSection key={index}>
                  <BackgroundGradient className="rounded-xl p-1">
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
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection>
              <div className="text-center mt-12">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={() => handleClick("/shop")}
                >
                  Visit Full Shop
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

{/* Featured Games Slider */}
<section className="py-16 relative overflow-hidden bg-customDark">
  <BackgroundBeams />
  <div className="container mx-auto px-4 relative z-10">
    <h2 className="text-4xl font-bold text-white mb-8">Featured Games</h2>
    <div className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${(currentSlide - 1) * 33.33}%)` }}
      >
        {[...featuredGames.slice(-1), ...featuredGames, ...featuredGames.slice(0, 1)].map((game, index) => (
          <div key={`${game._id}-${index}`} className="w-1/3 flex-shrink-0 px-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <img
                src={game.AssignedGame.coverPhoto}
                alt={game.AssignedGame.title}
                className="w-full h-80 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {game.AssignedGame.title}
                </h3>
                <p className="text-gray-300 mb-4 text-sm h-12 overflow-hidden">
                  {game.AssignedGame.Description.substring(0, 80)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-100">
                    ${(game.UnitPrice - (game.UnitPrice * game.discount) / 100).toFixed(2)}
                  </span>
                  <Link to={`/game/${game._id}`}>
                 <Button 
                  color="primary" 
                  size="sm" 
                  style={{
                  backgroundColor: '#8E44AD', // Vibrant Purple for a striking effect
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 'bold'
           }}
>
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
      className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all z-20"
      style={{ marginLeft: "-3rem" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      onClick={nextSlide}
      className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all z-20"
      style={{ marginRight: "-3rem" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</section>
        
        <AIAssistantSection />
        <IndieDeveloperSection />

        {/* Gaming Community Section */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 text-center relative z-10">
            <AnimatedSection>
              <h2 className="text-4xl font-bold text-white mb-8">
                Join Our Thriving Gaming Community
              </h2>
            </AnimatedSection>
            <AnimatedSection>
              <p className="text-xl text-gray-300 mb-8">
                Connect with fellow gamers, share experiences, participate in
                events, and level up together!
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: "Forums",
                  description:
                    "Discuss strategies, share tips, and make new friends.",
                  buttonText: "Visit Forums",
                },
                {
                  title: "Events",
                  description:
                    "Join tournaments, watch live streams, and attend virtual meetups.",
                  buttonText: "See Events",
                },
                {
                  title: "Groups",
                  description:
                    "Find like-minded gamers and form your own gaming clans.",
                  buttonText: "Explore Groups",
                },
              ].map((item, index) => (
                <AnimatedSection key={index}>
                  <BackgroundGradient className="rounded-xl p-1">
                    <div className="bg-gray-800 rounded-lg p-6 h-full">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 mb-4">{item.description}</p>
                      <Button color="primary" size="sm">
                        {item.buttonText}
                      </Button>
                    </div>
                  </BackgroundGradient>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection>
              <Button
                color="secondary"
                size="lg"
                onClick={() => handleClick("/articles")}
              >
                Join Community
              </Button>
            </AnimatedSection>
          </div>
        </section>

        {/* Support Unit Section */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <h2 className="text-4xl font-bold text-white mb-8 text-center">
                World-Class Support at Your Service
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "24/7 Assistance",
                  description:
                    "Our support team is always ready to help, any time of day or night.",
                  buttonText: "Contact Support",
                  buttonAction: () => handleClick("/support#contactForm"),
                },
                {
                  title: "Knowledge Base",
                  description:
                    "Find answers to common questions in our comprehensive guide.",
                  buttonText: "Browse FAQs",
                  buttonAction: () => console.log("Browsing FAQs"), // You can update this with your navigation logic
                },
                {
                  title: "Community Support",
                  description:
                    "Get help from our community of experienced gamers and developers.",
                  buttonText: "Visit Forum",
                  buttonAction: () => console.log("Visiting Forum"), // You can update this with your navigation logic
                },
              ].map((item, index) => (
                <AnimatedSection key={index}>
                  <BackgroundGradient className="rounded-xl p-1">
                    <div className="bg-gray-800 rounded-lg p-6 h-full">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 mb-4">{item.description}</p>
                      <Button
                        color="primary"
                        size="sm"
                        onClick={item.buttonAction}
                      >
                        {item.buttonText}
                      </Button>
                    </div>
                  </BackgroundGradient>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Reviews */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <h2 className="text-4xl font-bold text-white mb-8 text-center">
                Latest Reviews
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestRatings.map((rating, index) => (
                <AnimatedSection key={index}>
                  <BackgroundGradient className="rounded-xl p-1">
                    <div className="bg-gray-800 rounded-lg p-6 h-full">
                      <p className="text-gray-300 mb-4">{rating.comment}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">
                          {rating.user?.username || "Anonymous"}
                        </span>
                        <span className="text-yellow-400">
                          {rating.rating}/5
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {rating.game?.AssignedGame?.title || "Unknown Game"}
                      </p>
                    </div>
                  </BackgroundGradient>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 text-center relative z-10">
            <AnimatedSection>
              <h2 className="text-4xl font-bold text-white mb-8">
                Stay in the Loop
              </h2>
            </AnimatedSection>
            <AnimatedSection>
              <p className="text-xl text-gray-300 mb-8">
                Subscribe to our newsletter for the latest game releases and
                exclusive offers.
              </p>
            </AnimatedSection>
            <AnimatedSection>
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
            </AnimatedSection>
          </div>
        </section>

        <Footer />
      </TracingBeam>
    </div>
  );
};

export default Home;

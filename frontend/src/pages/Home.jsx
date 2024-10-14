import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, inView } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { User } from "@nextui-org/react";
import Loader from "../components/Loader/loader";

//Accernity
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
import { Cover } from "../components/ui/cover";

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const shopSectionRef = useRef(null);
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const sectionRef = useRef(null); // Reference for the section
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [hoverDirection, setHoverDirection] = useState("");

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
  const handleClick = (path) => {
    navigate(path);
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

  const words = [
    "Unleash your gaming potential",
    "Discover the perfect game for you",
    "Explore new worlds and challenges",
    "Level up your gaming experience",
  ];

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
              <p className="text-[50px] font-primaryRegular text-grey-600 mb-8 text-center">
                 With Our Game Shop <br/>
                <FlipWords words={words} />
              </p>
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
                    <div className="bg-customDark rounded-lg p-6 h-full flex flex-col justify-between">
                      <Cover>
                        <h3 className="text-2xl font-primaryRegular text-white mb-4">
                          {category}
                        </h3>
                      </Cover>
                      <img
                        src={
                          category.toLowerCase() === "latest releases"
                            ? "https://res.cloudinary.com/dhcawltsr/image/upload/v1728890476/DALL_E_2024-10-14_12.50.40_-_A_3D_cartoon-style_illustration_showcasing_the_latest_online_game_releases_in_a_violet-themed_setting._The_scene_features_a_futuristic_gaming_hub_with_vftf5x.webp"
                            : category.toLowerCase() === "top sellers"
                            ? "https://res.cloudinary.com/dhcawltsr/image/upload/v1728890386/DALL_E_2024-10-14_12.48.54_-_A_3D_cartoon-style_illustration_representing_top_online_game_sellers_in_a_violet-themed_environment._The_scene_features_a_dynamic_storefront_with_glow_uqtmlx.webp"
                            : category.toLowerCase() === "indie games"
                            ? "https://res.cloudinary.com/dhcawltsr/image/upload/v1728890520/DALL_E_2024-10-14_12.51.50_-_A_3D_cartoon-style_illustration_representing_the_latest_indie_games_in_a_violet-themed_setting._The_scene_features_a_cozy_and_creative_indie_game_stud_xn7dhk.webp"
                            : category.toLowerCase() === "special offers"
                            ? "https://res.cloudinary.com/dhcawltsr/image/upload/v1728888043/DALL_E_2024-10-14_12.06.26_-_A_vibrant_and_dynamic_cover_image_for_a_gaming_shop_s_special_offers._The_theme_uses_colors_9171bb_soft_purple_020617_dark_blue-black_7186a6_fxgokc.webp"
                            : "https://res.cloudinary.com/dhcawltsr/image/upload/v1727709362/smart-girl-animation-download--unscreen_icm1qe.gif"
                        }
                        alt={`${category} category`}
                        className="rounded-[200px] w-[200px] h-[200px] object-cover mx-auto"
                      />
                      <p className="text-white mb-4 mt-8">
                        {category.toLowerCase() === "latest releases"
                          ? "Discover exciting new adventures in our latest game releases."
                          : category.toLowerCase() === "top sellers"
                          ? "Play the most popular games loved by gamers worldwide."
                          : category.toLowerCase() === "indie games"
                          ? "Explore creative and unique games from indie developers."
                          : category.toLowerCase() === "special offers"
                          ? "Enjoy great deals on games with our special offers."
                          : `Find amazing games in our ${category.toLowerCase()} collection.`}
                      </p>
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
                  variant="ghost"
                  onClick={() => handleClick("/shop")}
                >
                  Visit Full Shop
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>


        <AIAssistantSection />
        <IndieDeveloperSection />

        {/* Gaming Community Section */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundBeams />
          <div className="container mx-auto px-4 text-center relative z-10">
            <AnimatedSection>
              <h2 className="text-4xl font-primaryRegular text-white mb-8">
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
                      <h3 className="text-2xl font-primaryRegular text-white mb-4">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 mb-4">{item.description}</p>
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
                      <p className="text-[20px] text-white mt-2 mb-8 text-center">
                        {rating.game?.AssignedGame?.title || "Unknown Game"}
                      </p>
                      <img
                        src={
                          rating.game?.AssignedGame?.coverPhoto ||
                          "Unknown Game"
                        }
                        alt="Cover"
                        className="w-[400px] rounded-[40px]"
                      />
                      <p className="text-white mb-4 mt-8 font-primaryRegular text-[25px]">
                        {rating.comment}
                      </p>
                      <div className="flex items-center justify-between">
                        <User
                          className="cursor-pointer text-white"
                          name={rating.user?.username || "Anonymous"}
                          description={rating.user?.role || "Anonymous"}
                          avatarProps={{
                            src: rating.user.profilePic,
                          }}
                        />
                        <span className="text-yellow-400">
                          {rating.rating}/5
                        </span>
                      </div>
                    </div>
                  </BackgroundGradient>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup 
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
        </section>*/}

        <Footer />
      </TracingBeam>
    </div>
  );
};

export default Home;

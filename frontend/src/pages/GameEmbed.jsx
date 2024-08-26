import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { FaExpand, FaTimes } from "react-icons/fa"; // Use relevant icons for fullscreen and exit
import { ExitFullScreen } from "../assets/icons/ExitFullScreen";
import { FullScreen } from "../assets/icons/fullscreen";
import { Chip, Tooltip } from "@nextui-org/react";
import ChatComponent from "./GeminiBot";

// Helper function to handle full-screen requests
const requestFullScreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};

// Helper function to handle exiting full-screen
const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

const GameEmbed = () => {
  const { src, title } = useParams();
  const navigate = useNavigate();
  const decodedSrc = decodeURIComponent(src);
  const decodedTitle = decodeURIComponent(title);
  const iframeRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1000); // 4 hours in seconds
  

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          window.alert("Your gaming session for the day has ended!"); // Alert box
          navigate("/mylibrary"); // Navigate to /mylibrary after alert is closed
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Clean up the timer on component unmount
  }, [navigate]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setIsFullScreen(!!fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, []);

  const handleFullScreenToggle = () => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      requestFullScreen(iframeRef.current);
    }
  };

  const handleCut = () => {
    navigate("/mylibrary");
  };

  // Format time left in HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen bg-customDark ">
        {/* Game iframe on the left */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={decodedSrc}
            title={decodedTitle}
            width="94%"
            height="70%"
            frameBorder="0"
            allowFullScreen
            className="block border-4 border-customDark shadow-lg rounded-lg mt-[100px] ml-[40px]"
          ></iframe>

          {/* Timer and Full Screen/Exit Icons */}
          <div className="absolute top-1 right-1 z-20 flex flex-row items-end space-y-4">
            <Chip
              size="lg"
              color="danger"
              className="text-white mb-[20px] font-primaryRegular text-xl"
            >
              Time Left: {formatTime(timeLeft)} {decodedTitle}
            </Chip>
            <div className="flex flex-row space-y-2">
              <Tooltip
                content="Full Screen"
                color="danger"
                className="font-primaryRegular"
              >
                <div
                  onClick={handleFullScreenToggle}
                  className=" scale-75 cursor-pointer  p-2 hover:scale-105 transition-transform duration-300 ease-in-out"
                >
                  <FullScreen /> {/* Full screen icon */}
                </div>
              </Tooltip>
              <Tooltip
                content="Exit Game"
                color="danger"
                className="font-primaryRegular"
              >
                <div
                  onClick={handleCut}
                  className="scale-75 hover:scale-105 cursor-pointer transition-transform duration-300 ease-in-out"
                >
                  <ExitFullScreen /> {/* Exit icon */}
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Ai assistance */}
        <ChatComponent game={decodedTitle}/>

      </div>
      <Footer />
    </>
  );
};

export default GameEmbed;

import React, { useEffect, useState, useRef } from "react";
import { Card } from "@nextui-org/react";
import { motion } from "framer-motion";

const StarIcon = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? "text-yellow-400" : "text-gray-400"}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <StarIcon key={index} filled={index < Math.floor(rating)} />
  ));
  return <div className="flex">{stars}</div>;
};

const InfiniteMovingCards = ({
  items,
  direction = "right",
  speed = "slow",
}) => {
  const [duplicatedItems, setDuplicatedItems] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    setDuplicatedItems([...items, ...items]);
  }, [items]);

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 50;
      case "medium":
        return 100;
      case "fast":
        return 150;
      default:
        return 50;
    }
  };

  const getAnimationDuration = () => {
    return `${duplicatedItems.length * (300 / getSpeed())}s`;
  };

  const getAnimationDirection = () => {
    return direction === "right" ? "moveRight" : "moveLeft";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative m-auto w-full overflow-hidden bg-transparent">
      <div
        className="hover-wrapper"
        onMouseEnter={() => containerRef.current?.classList.add("paused")}
        onMouseLeave={() => containerRef.current?.classList.remove("paused")}
      >
        <motion.div
          ref={containerRef}
          className={`flex animate-${getAnimationDirection()}`}
          style={{
            animationDuration: getAnimationDuration(),
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {duplicatedItems.map((item, idx) => (
            <motion.div key={idx} variants={cardVariants}>
              <Card
                className="flex-shrink-0 w-[20vw] h-[150px] p-2 shadow-lg rounded-lg m-2 overflow-hidden
                           bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700
                           text-white border border-gray-700"
              >
                <div className="h-full flex flex-col justify-between">
                  <p className="text-sm italic mb-2 line-clamp-3 text-center text-gray-300">
                    "{item.quote}"
                  </p>
                  <div>
                    <p className="font-bold text-gray-100">{item.name}</p>
                    <p className="text-sm text-gray-300">{item.title}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">{item.date}</p>
                      <StarRating
                        rating={parseFloat(item.title.split(" - Rating: ")[1])}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default InfiniteMovingCards;

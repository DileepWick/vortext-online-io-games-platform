import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../libs/util";
import { Plus, Minus, Divide, X } from "lucide-react";
import { Background } from "@cloudinary/url-gen/qualifiers";

const MathIcon = ({ icon: Icon, ...props }) => <Icon {...props} />;

export const BackgroundBeamsWithCollision = ({ children, className }) => {
  const containerRef = useRef(null);
  const parentRef = useRef(null);

  const icons = [
    { Icon: Plus, color: "#4F46E5" },
    { Icon: Minus, color: "#7C3AED" },
    { Icon: Divide, color: "#EC4899" },
    { Icon: X, color: "#06B6D4" },
  ];

  const iconInstances = [
    { initialX: 600, translateX: 600, duration: 30, repeatDelay: 3, delay: 4 },
    { initialX: 400, translateX: 400, duration: 25, repeatDelay: 14, delay: 4 },
    { initialX: 800, translateX: 800, duration: 20, repeatDelay: 2 },
    {
      initialX: 1200,
      translateX: 1200,
      duration: 18,
      repeatDelay: 4,
      delay: 2,
    },

    { initialX: -10, translateX: -10, duration: 30, repeatDelay: 3, delay: 2 },
    {
      initialX: -600,
      translateX: -600,
      duration: 25,
      repeatDelay: 3,
      delay: 4,
    },
    { initialX: -100, translateX: -100, duration: 20, repeatDelay: 7 },
    {
      initialX: -400,
      translateX: -400,
      duration: 18,
      repeatDelay: 14,
      delay: 4,
    },
    { initialX: -800, translateX: -800, duration: 25, repeatDelay: 2 },
    { initialX: -1000, translateX: -1000, duration: 20, repeatDelay: 2 },
    {
      initialX: -1200,
      translateX: -1200,
      duration: 25,
      repeatDelay: 4,
      delay: 2,
    },
    {
      initialX: -1500,
      translateX: -1500,
      duration: 25,
      repeatDelay: 4,
      delay: 2,
    },
  ];

  return (
    <div
      ref={parentRef}
      className={cn(
        "h-96 md:h-[40rem] bg-gradient-to-b from-neutral-950 to-neutral-800 relative flex items-center w-full justify-center overflow-hidden",
        className
      )}
    >
      {iconInstances.map((instance, index) => (
        <MathIconAnimation
          key={instance.initialX + "-icon-" + index}
          iconOptions={instance}
          icon={icons[index % icons.length]}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}
      {children}
      <div
        ref={containerRef}
        className="absolute bottom-0 bg-neutral-100 w-full inset-x-0 pointer-events-none"
        style={{
          boxShadow:
            "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset",
        }}
      ></div>
    </div>
  );
};

const MathIconAnimation = React.forwardRef(
  ({ parentRef, containerRef, iconOptions = {}, icon }, ref) => {
    const iconRef = useRef(null);
    const [collision, setCollision] = useState({
      detected: false,
      coordinates: null,
    });
    const [iconKey, setIconKey] = useState(0);
    const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

    useEffect(() => {
      const checkCollision = () => {
        if (
          iconRef.current &&
          containerRef.current &&
          parentRef.current &&
          !cycleCollisionDetected
        ) {
          const iconRect = iconRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const parentRect = parentRef.current.getBoundingClientRect();

          if (iconRect.bottom >= containerRect.top) {
            const relativeX =
              iconRect.left - parentRect.left + iconRect.width / 2;
            const relativeY = iconRect.bottom - parentRect.top;

            setCollision({
              detected: true,
              coordinates: { x: relativeX, y: relativeY },
            });
            setCycleCollisionDetected(true);
          }
        }
      };

      const animationInterval = setInterval(checkCollision, 50);
      return () => clearInterval(animationInterval);
    }, [cycleCollisionDetected, containerRef]);

    useEffect(() => {
      if (collision.detected && collision.coordinates) {
        setTimeout(() => {
          setCollision({ detected: false, coordinates: null });
          setCycleCollisionDetected(false);
        }, 2000);

        setTimeout(() => {
          setIconKey((prevKey) => prevKey + 1);
        }, 2000);
      }
    }, [collision]);

    return (
      <>
        <motion.div
          key={iconKey}
          ref={iconRef}
          animate="animate"
          initial={{
            translateY: iconOptions.initialY || "-200px", // Start off-screen
            translateX: iconOptions.initialX || "0px",
            rotate: iconOptions.rotate || 0,
          }}
          variants={{
            animate: {
              translateY: iconOptions.translateY || "1800px", // Fall to this position
              translateX: iconOptions.translateX || "0px",
              rotate: iconOptions.rotate || 0,
            },
          }}
          transition={{
            duration: iconOptions.duration || 4, // Shorter duration for falling
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: 0, // Remove delay to start falling immediately
            repeatDelay: iconOptions.repeatDelay || 0,
          }}
          className="absolute"
        >
          <MathIcon icon={icon.Icon} size={24} color={icon.color} />
        </motion.div>
        <AnimatePresence>
          {collision.detected && collision.coordinates && (
            <Explosion
              key={`${collision.coordinates.x}-${collision.coordinates.y}`}
              className=""
              style={{
                left: `${collision.coordinates.x}px`,
                top: `${collision.coordinates.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }
);

MathIconAnimation.displayName = "MathIconAnimation";

const Explosion = ({ ...props }) => {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }));

  return (
    <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
      ></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"
        />
      ))}
    </div>
  );
};

export default BackgroundBeamsWithCollision;

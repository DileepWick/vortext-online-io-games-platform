"use client";

import { cn } from "../../libs/util";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export const TypewriterEffectOneWord = ({
  words,
  className,
  cursorClassName,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [displayedWord, setDisplayedWord] = useState("");
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      const word = words[currentWordIndex].text;
      const typingSpeed = isErasing ? 100 : 50; // Adjust typing speed based on state

      const typeCharacter = () => {
        setDisplayedWord((prev) =>
          isErasing ? prev.slice(0, -1) : prev + word[displayedWord.length]
        );

        if (!isErasing && displayedWord.length === word.length) {
          setIsErasing(true);
          setTimeout(typeCharacter, typingSpeed);
        } else if (isErasing && displayedWord.length === 0) {
          setIsErasing(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        } else {
          setTimeout(typeCharacter, typingSpeed);
        }
      };

      const timer = setTimeout(typeCharacter, 0);
      return () => clearTimeout(timer);
    }
  }, [isInView, currentWordIndex, displayedWord, isErasing]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        <div className="inline-block">
          {displayedWord.split("").map((char, index) => (
            <motion.span
              key={`char-${index}`}
              className={cn(`dark:text-white text-black`)}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectOneWordSmooth = ({
  words,
  className,
  cursorClassName,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedWord, setDisplayedWord] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const currentWord = words[currentWordIndex].text;
    const typingSpeed = 150; // Adjust typing speed (in ms)
    const erasingSpeed = 100; // Adjust erasing speed (in ms)
    const wordDisplayDuration = 1000; // Time the word stays fully visible before erasing

    const typeWord = () => {
      if (isTyping) {
        // If typing, keep adding characters to displayedWord
        if (displayedWord.length < currentWord.length) {
          setDisplayedWord(currentWord.slice(0, displayedWord.length + 1));
          timeoutRef.current = setTimeout(typeWord, typingSpeed);
        } else {
          // Wait for a bit before starting to erase
          timeoutRef.current = setTimeout(
            () => setIsTyping(false),
            wordDisplayDuration
          );
        }
      } else {
        // If erasing, keep removing characters from displayedWord
        if (displayedWord.length > 0) {
          setDisplayedWord(displayedWord.slice(0, -1));
          timeoutRef.current = setTimeout(typeWord, erasingSpeed);
        } else {
          // Once erased, move to the next word and reset typing state
          setIsTyping(true);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    timeoutRef.current = setTimeout(typeWord, 200); // Slight delay before typing starts

    // Clear timeout on cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentWordIndex, displayedWord, isTyping, words]);

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <div className="overflow-hidden pb-2">
        <div
          className="text-white text-xs sm:text-base md:text-xl lg:text:3xl xl:text-7xl "
          style={{ whiteSpace: "nowrap" }}
        >
          {displayedWord}
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "block rounded-sm w-[4px] h-4 sm:h-6 xl:h-16 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

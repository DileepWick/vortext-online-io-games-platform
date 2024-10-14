import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BackgroundBeams } from "../../components/ui/BackgroundBeams";

const AIAssistantSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0, x: -100 }, // Changed x to -100 for left-to-right slide
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 }, // Changed x to -20 for item slide
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="py-16 relative overflow-hidden"
    >
      <BackgroundBeams />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div variants={itemVariants} className="md:w-1/2 mb-8 md:mb-0">
            <motion.h2
              variants={itemVariants}
              className="text-[50px] font-primaryRegular text-white mb-4"
            >
              Meet Gwen <br />
              Your AI Gaming Assistant
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-[30px] text-gray-300 mb-6"
            >
              Get personalized game recommendations, strategy tips, and instant
              answers to your gaming questions.
            </motion.p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-[200px]"
          >
            <div className="bg-white rounded-[200px] p-6 shadow-xl">
              <div className="flex justify-center">
                <img
                  src="https://res.cloudinary.com/dhcawltsr/image/upload/v1727709362/smart-girl-animation-download--unscreen_icm1qe.gif"
                  alt="AI Assistant Gwen"
                  className="rounded-lg w-[300px]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AIAssistantSection;

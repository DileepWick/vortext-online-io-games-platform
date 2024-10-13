import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@nextui-org/react";
import { BackgroundBeams } from "../../components/ui/BackgroundBeams";
import { useNavigate } from "react-router-dom";

const IndieDeveloperSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const handleClick = (path) => {
    navigate(path);
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
              className="text-4xl font-bold text-white mb-4"
            >
              Calling All Indie Developers
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 mb-6"
            >
              Join our platform and showcase your games to a passionate
              community of gamers. We provide the tools and support you need to
              succeed.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Button
                color="success"
                size="lg"
                onClick={() => handleClick("/login")}
              >
                Join as a Developer
              </Button>
            </motion.div>
          </motion.div>
          <motion.div variants={itemVariants} className="md:w-1/2">
            <img
              src="https://res.cloudinary.com/dhcawltsr/image/upload/v1728837460/Video_game_developer_qahcp2.gif"
              alt="Indie Developer"
              className="rounded-lg w-full"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default IndieDeveloperSection;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  Spinner,
  Card,
  Button,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import Chatbot from "../components/Chatbot";
import DoubleArrowDown from "../assets/icons/DoubleArrowDown";
import DoubleArrowUp from "../assets/icons/DoubleArrowUp";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LampContainer } from "../components/ui/lampSupport";
import { Helmet } from "react-helmet-async";
import { FlipWords } from "../components/ui/FlipWords";
import { TypewriterEffectSmooth } from "../components/ui/Typewriter";
import { TracingBeam } from "../components/ui/TracingBeam";
import { BackgroundGradient } from "../components/ui/BackgroundGradient";
import { BackgroundBeams } from "../components/ui/BackgroundBeams";

const Support = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllFAQs, setShowAllFAQs] = useState(false);
  const welcomeRef = useRef(null);

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/contact");
  };

  const words = [
    "Spark your gameplay",
    "Find what you need",
    "Get the answers you need",
    "Get the help you need",
  ];
  const typeWriterWords = [
    {
      text: "Welcome ",
    },
    {
      text: "to ",
    },
    {
      text: "Our ",
    },
    {
      text: "Support ",
    },
    {
      text: "Center!", // No space at the end for the last word
    },
  ];

  const scrollToWelcomeSection = () => {
    if (welcomeRef.current) {
      welcomeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get("http://localhost:8098/faq/fetchFAQ");
        setFaqs(response.data.allFAQs);
      } catch (err) {
        setError("Failed to fetch FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (loading) return <Spinner size="large" />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const displayedFAQs = showAllFAQs ? faqs : faqs.slice(0, 3);

  return (
    <div className="relative min-h-screen bg-slate-950 w-full rounded-md z-0 text-white overflow-hidden">
      <Helmet>
        <title>Support | Vortex</title>
      </Helmet>
      <Header />
      <TracingBeam>
        <LampContainer>
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
          >
            <FlipWords words={words} />
            <br /> with our support!
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
          >
            <div className="text-center">
              <Button
                color="primary"
                onClick={scrollToWelcomeSection}
                variant="light"
                className="text-xl"
              >
                Spark me up
              </Button>
            </div>
          </motion.h1>
        </LampContainer>

        <section ref={welcomeRef} className="pt-10 text-center">
          <div className="flex flex-col items-center  mt-20">
            <p className="text-neutral-600 dark:text-neutral-200 text-4xl sm:text-base md:text-7xl ">
              <TypewriterEffectSmooth words={typeWriterWords} />
            </p>
          </div>
          <p className="text-3xl text-white mt-6 mb-2 font-primaryRegular">
            Find answers to your questions, chat with support, or browse our
            resources.
          </p>
        </section>

        <div className="container mx-auto px-4 py-16 flex flex-wrap justify-center gap-6">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-zinc-900">
            <Card className="bg-zinc-900 text-white text-center hover:scale-105">
              <h3 className="text-3xl m-4">Live Chat</h3>
              <p className="text-lg">
                Chat with our support team for quick help.
              </p>
            </Card>
          </BackgroundGradient>
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-zinc-900">
            <Card className="bg-zinc-900 text-white text-center hover:scale-105">
              <h3 className="text-3xl m-4">Knowledge Base</h3>
              <p className="text-lg">
                Access our extensive library of help articles.
              </p>
            </Card>
          </BackgroundGradient>
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-zinc-900">
            <Card className="bg-zinc-900 text-white text-center hover:scale-105">
              <h3 className="text-3xl m-4">Contact Support</h3>
              <p className="text-lg">
                Get in touch with our support team for assistance.
              </p>
            </Card>
          </BackgroundGradient>
        </div>

        <Chatbot className="absolute bottom-4 right-4 z-50" />

        <div className="container mx-auto px-4 py-16">
          <h2 className="text-5xl text-center text-white mb-8 font-primaryRegular">
            Frequently Asked Questions
          </h2>

          {displayedFAQs.length === 0 ? (
            <p className="text-center text-gray-400 text-lg">
              No FAQs available
            </p>
          ) : (
            <Accordion>
              {displayedFAQs.map((faq) => (
                <AccordionItem
                  key={faq._id}
                  aria-label={faq.question}
                  title={faq.question}
                  classNames={{
                    title: "text-white text-2xl font-primaryRegular",
                    content: "text-white text-xl font-primaryRegular",
                  }}
                >
                  {faq.answer || "No answer available"}
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {faqs.length > 3 && (
            <div className="text-center mt-8">
              <Button
                color="primary"
                onClick={() => setShowAllFAQs(!showAllFAQs)}
                variant="light"
              >
                {showAllFAQs ? <DoubleArrowUp /> : <DoubleArrowDown />}
                {showAllFAQs ? "Show Less" : "Show More"}
              </Button>
            </div>
          )}
        </div>
        <section>
          <div className="h-[40rem] w-full rounded-md  relative flex flex-col items-center justify-center antialiased mb-8">
            <div className="max-w-2xl mx-auto p-4 mt-40">
              <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold">
                Contact Our Support Team
              </h1>
              <p></p>
              <p className="text-neutral-500 max-w-4xl mx-auto my-2 text-xl mt-6 text-center relative z-10">
                Need help? Our support team is here to assist you with any
                questions or issues you may have. Whether you're experiencing
                technical difficulties, have billing inquiries, or need general
                assistance, we're just a message away. Please fill out the form
                below, and we'll get back to you as soon as possible.
              </p>
              <BackgroundBeams />

              <div className="py-40 flex items-center justify-center">
                <button className="p-[3px] relative" onClick={handleNavigate}>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                  <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                    Contact Us
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </TracingBeam>
    </div>
  );
};

export default Support;

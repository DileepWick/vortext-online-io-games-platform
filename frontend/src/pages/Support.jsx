import React, { useState, useEffect } from "react";
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
import { Helmet } from "react-helmet-async";

const Support = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllFAQs, setShowAllFAQs] = useState(false);

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
    <div className="relative min-h-screen bg-customDark text-white">
      <Helmet>
        <title>Support | Vortex</title>
      </Helmet>
      <Header />
      <section className="pt-10 text-center">
        <h1 className="text-5xl text-white mb-8 font-primaryRegular">
          Welcome to Our Support Center
        </h1>
        <p className="text-lg text-white mb-2 font-primaryRegular">
          Find answers to your questions, chat with support, or browse our
          resources.
        </p>
      </section>

      <div className="container mx-auto px-4 py-16 flex flex-wrap justify-center gap-6">
        <Card className="bg-gray-800 rounded-lg shadow-lg text-white p-10 text-center">
          <h3 className="text-3xl">Live Chat</h3>
          <p>Chat with our support team for quick help.</p>
        </Card>
        <Card className="bg-gray-800 rounded-lg shadow-lg text-white p-10 text-center">
          <h3 className="text-3xl">Knowledge Base</h3>
          <p>Access our extensive library of help articles.</p>
        </Card>
        <Card className="bg-gray-800 rounded-lg shadow-lg text-white p-10 text-center">
          <h3 className="text-3xl">Contact Support</h3>
          <p>Get in touch with our support team for assistance.</p>
        </Card>
      </div>

      <Chatbot className="absolute bottom-4 right-4 z-50" />
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-5xl text-center text-white mb-8 font-primaryRegular">
          Frequently Asked Questions
        </h2>

        {displayedFAQs.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">No FAQs available</p>
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
      <Footer />
    </div>
  );
};

export default Support;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner, Card, CardBody, Button } from "@nextui-org/react";
import Chatbot from "../components/Chatbot";

const FAQsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const maxDescriptionLength = 100;

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

  const handleToggleExpand = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="relative min-h-screen bg-customDark text-white">
      <Header />
      <Chatbot className="absolute bottom-4 right-4 z-50" />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl text-center text-white mb-8 font-primaryRegular">
          Frequently Asked Questions
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {faqs.length === 0 ? (
            <p className="text-center text-gray-400">No FAQs available</p>
          ) : (
            faqs.map((faq) => {
              const isLongDescription =
                faq.answer.length > maxDescriptionLength;
              const isExpanded = expandedFAQ === faq._id;

              return (
                <Card
                  isBlurred
                  key={faq._id}
                  className="bg-gray-800 rounded-lg shadow-lg text-white"
                >
                  <CardBody>
                    <h2 className="text-xl font-primaryRegular mb-4">
                      {faq.question}
                    </h2>
                    <p
                      className={`transition-max-height duration-500 ease-in-out ${
                        isExpanded ? "max-h-screen" : "max-h-24 overflow-hidden"
                      }`}
                    >
                      {faq.answer}
                    </p>
                    {isLongDescription && (
                      <button
                        onClick={() => handleToggleExpand(faq._id)}
                        className="mt-2 text-blue-400 hover:text-blue-300"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQsPage;

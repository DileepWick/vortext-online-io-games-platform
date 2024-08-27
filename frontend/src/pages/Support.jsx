import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner, Card, CardBody, Button } from "@nextui-org/react";
import Chatbot from "../components/Chatbot";

const Support = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
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

  const handleToggleExpand = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const displayedFAQs = showAllFAQs ? faqs : faqs.slice(0, 3);

  return (
    <div className="relative min-h-screen bg-customDark text-white">
      <Header />
      <section className="pt-10 text-center">
        <h1 className="text-5xl text-white mb-8 font-primaryRegular">
          Welcome to Our Support Center
        </h1>
        <p className="text-4xs text-white mb-2 font-primaryRegular">
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
        <h2 className="text-4xl text-center text-white mb-8 font-primaryRegular">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedFAQs.length === 0 ? (
            <p className="text-center text-gray-400">No FAQs available</p>
          ) : (
            displayedFAQs.map((faq) => (
              <FAQCard
                key={faq._id}
                faq={faq}
                isExpanded={expandedFAQ === faq._id}
                onToggleExpand={() => handleToggleExpand(faq._id)}
              />
            ))
          )}
        </div>

        {faqs.length > 6 && (
          <div className="text-center mt-8">
            <Button
              color="primary"
              onClick={() => setShowAllFAQs(!showAllFAQs)}
            >
              {showAllFAQs ? "Show Less" : "Show More"}
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const FAQCard = ({ faq, isExpanded, onToggleExpand }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(
        contentRef.current.scrollHeight > contentRef.current.clientHeight
      );
    }
  }, [faq.answer]);

  return (
    <Card className="bg-gray-800 rounded-lg shadow-lg text-white">
      <CardBody>
        <h2 className="text-xl font-primaryRegular mb-4">{faq.question}</h2>
        <div
          ref={contentRef}
          className={`transition-max-height duration-500 ease-in-out ${
            isExpanded ? "max-h-screen" : "max-h-24 overflow-hidden"
          }`}
        >
          <p>{faq.answer || "No answer available"}</p>
        </div>
        {isOverflowing && (
          <button
            onClick={onToggleExpand}
            className="mt-2 text-blue-400 hover:text-blue-300"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </CardBody>
    </Card>
  );
};

export default Support;

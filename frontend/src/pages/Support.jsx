import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner, Card, CardBody } from "@nextui-org/react";
import Chatbot from "../components/Chatbot";

const Support = () => {
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
          {faqs.length === 0 ? (
            <p className="text-center text-gray-400">No FAQs available</p>
          ) : (
            faqs.map((faq) => {
              const isLongDescription =
                faq.answer && faq.answer.length > maxDescriptionLength;
              const isExpanded = expandedFAQ === faq._id;

              return (
                <Card
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
                      {faq.answer || "No answer available"}
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

export default Support;

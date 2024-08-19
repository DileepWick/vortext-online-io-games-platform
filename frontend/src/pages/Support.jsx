import React, { useState } from "react";

// next ui
import { Button } from "@nextui-org/react";

//components
import Header from "../components/header";

const faqs = [
  {
    question: "How do I purchase a game?",
    answer:
      "To purchase a game, navigate to the game’s page and click on the 'Buy' button. You can then proceed to checkout.",
  },
  {
    question: "What is the rental policy?",
    answer:
      "You can rent a game for a specified period. After the rental period expires, the game will no longer be accessible.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can contact support by filling out the form above, or by emailing us directly at support@gamestore.com.",
  },
  {
    question: "Can I cancel a purchase?",
    answer:
      "Cancellations are only available within 24 hours of purchase and if the game hasn't been downloaded.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit cards, PayPal, and other digital payment methods.",
  },
];

const Support = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
          Customer Support
        </h2>
        <div className="support-faq">
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Frequently Asked Questions
          </h3>
          <ul className="space-y-4">
            {faqs.map((faq, index) => (
              <li key={index} className="faq-item">
                <button
                  className="w-full text-left bg-blue-600 text-white py-3 px-4 rounded-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                </button>
                {activeIndex === index && (
                  <div className="mt-3 p-4 bg-gray-100 border-l-4 border-blue-600 rounded-md text-gray-700">
                    {faq.answer}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Support;

import React, { useState } from "react";
import "../style/support.css";

import { Button } from "@nextui-org/react";
import Header from "../components/header";

const faqs = [
  {
    question: "How do I purchase a game?",
    answer:
      "To purchase a game, navigate to the store page and click on the game you like to buy 'Buy' button. You can then proceed to checkout.",
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
    <div className="primary-regular">
      <Header />
      <div className="support-container">
        <h2>Customer Support</h2>
        <div className="support-faq">
          <h3>Frequently Asked Questions</h3>
          <ul>
            {faqs.map((faq, index) => (
              <li key={index} className="faq-item">
                <Button
                  color="primary"
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                </Button>
                {activeIndex === index && (
                  <div className="faq-answer">{faq.answer}</div>
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

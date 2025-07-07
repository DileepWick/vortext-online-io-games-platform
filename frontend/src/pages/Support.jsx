import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { API_BASE_URL } from "../utils/getAPI";
import {
  Card,
  Button,
  Accordion,
  AccordionItem,
  Input,
  Textarea,
} from "@nextui-org/react";
// import Chatbot from "../components/Chatbot";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Loader from "../components/Loader/loader";
import CustomToast from "../components/CustomToast";
import useScrollDirection from "../components/hooks/useScrollDirection";

const Support = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllFAQs, setShowAllFAQs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const location = useLocation();
  const scrollDirection = useScrollDirection();
  const headerRef = useRef(null);
  const welcomeRef = useRef(null);
  const contactRef = useRef(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const categories = [
    { id: "all", name: "All Topics", icon: "🔍" },
    { id: "account", name: "Account & Profile", icon: "👤" },
    { id: "billing", name: "Billing & Payments", icon: "💳" },
    { id: "technical", name: "Technical Support", icon: "🔧" },
    { id: "products", name: "Product Information", icon: "🛍️" },
  ];

  const openChatbot = () => {
    setIsChatbotOpen(true);
  };

  const validateEmail = (value) => {
    return String(value)
      .toLowerCase()
      .match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  };

  const isEmailInvalid = useMemo(() => {
    if (email === "") return true;
    return !validateEmail(email);
  }, [email]);

  const isMessageInvalid = useMemo(() => {
    return message.trim() === "";
  }, [message]);

  const handleEmailChange = (value) => {
    setEmail(value);
    if (value === "") {
      setEmailError("Email is required");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleMessageChange = (value) => {
    setMessage(value);
    if (value.trim() === "") {
      setMessageError("Message is required");
    } else {
      setMessageError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isEmailInvalid || isMessageInvalid || !email || !message.trim()) {
      if (!email) setEmailError("Email is required");
      if (!message.trim()) setMessageError("Message is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/directContactUs/submitDirectMessage`,
        { email, message }
      );
      CustomToast({
        message: response.data.message,
        type: "success",
      });
      setEmail("");
      setMessage("");
      setEmailError("");
      setMessageError("");
    } catch (error) {
      CustomToast({
        message: "Error submitting message. Please try again.",
        type: "error",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = () => {
    navigate("/contact");
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredFAQs = useMemo(() => {
    let filtered = faqs;

    if (searchTerm) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [faqs, searchTerm]);

  useEffect(() => {
    if (location.hash === "#contactForm") {
      setTimeout(() => scrollToSection(contactRef), 1000);
    }
  }, [location]);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/faq/fetchFAQ`);
        setFaqs(response.data.allFAQs);
      } catch (err) {
        setError("Failed to fetch FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  const displayedFAQs = showAllFAQs ? filteredFAQs : filteredFAQs.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Support Center | Vortex</title>
        <meta
          name="description"
          content="Get help with orders, returns, account issues and more. 24/7 support available."
        />
      </Helmet>

      <div
        className={`sticky top-0 z-50 transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <Header ref={headerRef} />
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </a>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Support</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How can we help you today?
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Search our help center, start a live chat, or contact our support
            team
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={openChatbot}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="mr-2">💬</span>
              Live Chat
            </button>
            <button
              onClick={() => scrollToSection(contactRef)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="mr-2">📧</span>
              Contact Support
            </button>
            <button
              onClick={handleNavigate}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="mr-2">🎫</span>
              Submit Ticket
            </button>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section ref={welcomeRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse Help Topics
            </h2>
            <p className="text-lg text-gray-600">
              Find answers organized by category
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories
              .filter((cat) => cat.id !== "all")
              .map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                    selectedCategory === category.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get help with {category.name.toLowerCase()}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Popular Help Articles
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "How to track my order",
              "Return and refund policy",
              "Update payment information",
              "Change shipping address",
              "Reset account password",
              "Product warranty information",
            ].map((article, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{article}</h3>
                <p className="text-gray-600 text-sm">
                  Quick guide and step-by-step instructions
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Read article →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            {searchTerm && (
              <p className="text-gray-600">
                {filteredFAQs.length} result
                {filteredFAQs.length !== 1 ? "s" : ""} for "{searchTerm}"
              </p>
            )}
          </div>

          {displayedFAQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse our help categories
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Accordion variant="splitted">
                  {displayedFAQs.map((faq, index) => (
                    <AccordionItem
                      key={faq._id}
                      aria-label={faq.question}
                      title={faq.question}
                      classNames={{
                        base: "border-b border-gray-100 last:border-b-0",
                        title: "text-gray-900 font-medium text-left py-4",
                        content: "text-gray-600 pb-4",
                        trigger: "py-4 hover:bg-gray-50",
                      }}
                    >
                      <div className="prose prose-sm max-w-none">
                        {faq.answer ||
                          "Answer not available. Please contact support for assistance."}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {filteredFAQs.length > 6 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllFAQs(!showAllFAQs)}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {showAllFAQs
                      ? "Show Less"
                      : `Show ${filteredFAQs.length - 6} More`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section ref={contactRef} className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600">
              Our support team is here to assist you
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Send us a message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    variant="bordered"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    isInvalid={!!emailError}
                    errorMessage={emailError}
                    className="w-full"
                    classNames={{
                      input: "text-gray-900",
                      inputWrapper:
                        "border-gray-300 hover:border-gray-400 focus-within:border-black",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue or question..."
                    variant="bordered"
                    minRows={4}
                    value={message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    isInvalid={!!messageError}
                    errorMessage={messageError}
                    className="w-full"
                    classNames={{
                      input: "text-gray-900",
                      inputWrapper:
                        "border-gray-300 hover:border-gray-400 focus-within:border-black",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isEmailInvalid || isMessageInvalid}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  We typically respond within 24 hours
                </p>
              </form>
            </div>

            {/* Contact Options */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Live Chat
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Get instant help from our support team
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">
                        ● Available now
                      </span>
                      <button
                        onClick={openChatbot}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Start Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📧</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Email Support
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Get detailed help via email
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Response within 24 hours
                      </span>
                      <a
                        href="mailto:support@vortex.com"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        support@vortex.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎫</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Submit a Ticket
                    </h3>
                    <p className="text-gray-600 mb-4">
                      For complex issues requiring detailed assistance
                    </p>
                    <button
                      onClick={handleNavigate}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Create Ticket
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Support Hours
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Live Chat:</span>
                    <span className="text-gray-900">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-900">Mon-Fri 9AM-6PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} /> */}
      <Footer />
    </div>
  );
};

export default Support;

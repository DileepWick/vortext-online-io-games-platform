import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import Header from "../components/header";
import Footer from "../components/footer";
import {
  Spinner,
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  ScrollShadow,
} from "@nextui-org/react";
import Chatbot from "../components/Chatbot";

const FAQsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get("http://localhost:8098/faq/fetchFAQ");
        setFaqs(response.data.allFAQs);
      } catch (err) {
        setError("Failed to fetch FAQs");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const notifySuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Flip,
      progressBarClassName: "bg-gray-800",
      style: { fontFamily: "Rubik" },
    });
  };

  const notifyError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Flip,
      progressBarClassName: "bg-gray-800",
      style: { fontFamily: "Rubik" },
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8098/faq/deleteFAQ/${id}`);
      setFaqs(faqs.filter((faq) => faq._id !== id));
      notifySuccess("FAQ deleted successfully!");
    } catch (err) {
      setError("Failed to delete FAQ");
      notifyError("Failed to delete FAQ.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8098/faq/createFAQ", {
        question: newQuestion,
        answer: newAnswer,
      });
      setFaqs([...faqs, response.data]);
      setNewQuestion("");
      setNewAnswer("");
      notifySuccess("FAQ added successfully!");
    } catch (err) {
      setError("Failed to add new FAQ");
      notifyError("Failed to add new FAQ.");
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-customDark text-white">
      <ToastContainer /> {/* Toast Container */}
      <ScrollShadow hideScrollBar>
        <Header />
        <Chatbot />
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl text-center text-white mb-8 font-primaryRegular">
            Customer Support
          </h1>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-primaryRegular text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {faqs.length === 0 ? (
                <p className="text-center text-gray-400">No FAQs available</p>
              ) : (
                faqs.map((faq) => (
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
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                        className="text-base"
                      />
                    </CardBody>
                    <Button
                      color="danger"
                      onClick={() => handleDelete(faq._id)}
                    >
                      Delete
                    </Button>
                  </Card>
                ))
              )}
            </div>

            <h2 className="text-2xl font-primaryRegular text-white mb-6">
              Add New FAQ
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                required
                className="bg-white text-black"
              />
              <Textarea
                label="Answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                required
                className="bg-white text-black"
              />
              <Button type="submit" color="primary">
                Add FAQ
              </Button>
            </form>
          </div>
        </div>
        <Footer />
      </ScrollShadow>
    </div>
  );
};

export default FAQsPage;

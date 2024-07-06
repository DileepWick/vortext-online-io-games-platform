import React, { useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer"

const GameForm = () => {

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("image", image);

      const response = await axios.post(
        "http://localhost:8098/games/uploadGame",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      setTitle("");
      setPrice("");
      setImage(null);
      setError(null);
    } catch (error) {
      setMessage(null);
      setError("Failed to upload game. Please try again later.");
    }
  };

  return (
    <div className="font-primaryRegular">
      <div>
        <Header />
        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form
          onSubmit={handleFormSubmit}
          className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow-md"
        >
          <div className="mb-4">
            <label htmlFor="title" className="block mb-2 text-gray-700">
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded border border-gray-300"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block mb-2 text-gray-700">
              Price:
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 rounded border border-gray-300"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block mb-2 text-gray-700">
              Cover Image:
            </label>
            <input
              type="file"
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full p-2 rounded border border-gray-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </form>
      </div>
      <Footer/>
    </div>
  );
};

export default GameForm;

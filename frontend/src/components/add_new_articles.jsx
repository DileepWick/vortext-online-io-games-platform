import React, { useState } from "react";
import axios from "axios";


import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";

const AddArticle = () => {
  // Authenticate user
  useAuthCheck();

  const token = getToken();
  const userId = getUserIdFromToken(token);

  const [heading, setHeading] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("uploader", userId);
    formData.append("heading", heading);
    formData.append("articleBody", articleBody);
    formData.append("image", image);

    try {
      const response = await axios.post(
        "http://localhost:8098/articles/createNewArticle",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
      setHeading("");
      setArticleBody("");
      setImage(null);
    } catch (error) {
      console.error("There was an error creating the article!", error);
      setMessage("There was an error creating the article!");
    }
  };

  return (

      <div className="container mx-auto p-4 font-primaryRegular">
        <h2 className="text-3xl font-bold mb-4">Add New Article</h2>
        {message && <p className="mb-4 text-green-500">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="heading"
            >
              Heading
            </label>
            <input
              type="text"
              id="heading"
              name="heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="articleBody"
            >
              Article Body
            </label>
            <textarea
              id="articleBody"
              name="articleBody"
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="image"
            >
              Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddArticle;

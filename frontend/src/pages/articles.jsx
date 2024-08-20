import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import { Button, ButtonGroup } from "@nextui-org/button";

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedArticles, setLikedArticles] = useState({});

  const token = getToken();
  const userId = getUserIdFromToken(token);

  // Get all articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get("http://localhost:8098/articles/getAllArticles");
        const fetchedArticles = response.data.articles;
        setArticles(fetchedArticles);

        // Prepare liked articles object based on fetched articles and current user
        const likedArticlesObj = {};
        fetchedArticles.forEach(article => {
          if (article.likedBy.includes(userId)) {
            likedArticlesObj[article._id] = true;
          }
        });
        setLikedArticles(likedArticlesObj);

        setLoading(false);
      } catch (err) {
        setError("Error fetching articles");
        setLoading(false);
      }
    };

    fetchArticles();
  }, [userId]);

  const handleLikeToggle = async (articleId) => {
    try {
      const response = await axios.put(`http://localhost:8098/articles/toggleLike/${articleId}`, { userId });
      const updatedArticle = response.data;

      // Toggle liked status locally
      setLikedArticles(prevLikedArticles => ({
        ...prevLikedArticles,
        [articleId]: !prevLikedArticles[articleId], // Toggle like status
      }));

      // Update articles state to reflect new like count
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article._id === articleId ? { ...article, likes: updatedArticle.likes } : article
        )
      );
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className=" text-white min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-6">Articles</h2>
        {articles.length === 0 ? (
          <div className="text-center mt-10">No articles found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {article.heading}
                </h3>
                <img
                  src={article.image}
                  alt={article.heading}
                  className="w-full h-100 object-cover mb-4 rounded"
                />
                <p className="text-gray-400">{article.articleBody}</p>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={() => handleLikeToggle(article._id)}
                    className={`px-4 py-2 rounded ${
                      likedArticles[article._id]
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={!userId}
                    
                  >
                    {likedArticles[article._id] ? "Liked" : "Like"}
                  </Button>
                  <span>{article.likes} Likes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ArticleList;

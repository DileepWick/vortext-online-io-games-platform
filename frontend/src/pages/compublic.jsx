import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { User } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { FaHeart, FaRegHeart, FaTrash, FaComments } from "react-icons/fa";
import { API_BASE_URL } from "../utils/getAPI";

const ComPublic = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedArticles, setLikedArticles] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [deletingArticleId, setDeletingArticleId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [user, setUser] = useState(null);

  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/users/profile/${userId}`
        );
        setUser(response.data.profile);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/articles/getAllArticles`
      );
      const fetchedArticles = response.data.articles;
      setArticles(fetchedArticles);

      const likedArticlesObj = {};
      fetchedArticles.forEach((article) => {
        if (article.likedBy.includes(userId)) {
          likedArticlesObj[article._id] = true;
        }
      });
      setLikedArticles(likedArticlesObj);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [userId]);

  const handleLikeToggle = async (articleId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/articles/toggleLike/${articleId}`,
        { userId }
      );
      const updatedArticle = response.data;

      setLikedArticles((prevLikedArticles) => ({
        ...prevLikedArticles,
        [articleId]: !prevLikedArticles[articleId],
      }));

      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article._id === articleId
            ? { ...article, likes: updatedArticle.likes }
            : article
        )
      );
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };

  const handleCommentChange = (articleId, text) => {
    setCommentTexts((prevTexts) => ({
      ...prevTexts,
      [articleId]: text,
    }));
  };

  const handleCommentSubmit = async (articleId) => {
    try {
      const commentText = commentTexts[articleId] || "";

      if (commentText.trim() === "") {
        alert("Please enter a comment before submitting.");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/articles/${articleId}/comments`,
        {
          userId,
          text: commentText,
        }
      );

      if (response.status === 201) {
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article._id === articleId
              ? {
                  ...article,
                  comments: [
                    ...article.comments,
                    {
                      ...response.data.comment,
                      user: { _id: userId, name: user.name },
                    },
                  ],
                }
              : article
          )
        );
        setCommentTexts((prevTexts) => ({
          ...prevTexts,
          [articleId]: "",
        }));
      }
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const handleDeleteComment = async (articleId, commentId) => {
    try {
      setDeletingCommentId(commentId);

      const response = await axios.delete(
        `${API_BASE_URL}/articles/deleteComment/${articleId}/${commentId}`
      );

      if (response.status === 200) {
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article._id === articleId
              ? {
                  ...article,
                  comments: article.comments.filter(
                    (comment) => comment._id !== commentId
                  ),
                }
              : article
          )
        );
        setDeletingCommentId(null);
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (err) {
      setDeletingCommentId(null);
      console.error("Error deleting comment", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      setDeletingArticleId(articleId);
      await axios.delete(
        `${API_BASE_URL}/articles/deleteArticle/${articleId}`,
        {
          data: { userId },
        }
      );

      setArticles((prevArticles) =>
        prevArticles.filter((article) => article._id !== articleId)
      );
      setDeletingArticleId(null);
    } catch (err) {
      setDeletingArticleId(null);
      console.error("Error deleting article", err);
      alert("Failed to delete article. Please try again.");
    }
  };

  const toggleComments = (articleId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-400">Loading...</div>;
  }

  return (
    <div className="font-primaryRegular bg-customDark text-white">
      <h2 className="text-3xl font-bold mb-6">Public Community</h2>
      <p className="mb-6">
        Welcome to the public community area. Everyone can access and view this
        content.
      </p>

      <h3 className="text-2xl font-bold mb-4">Public Posts</h3>
      {articles.length === 0 ? (
        <div className="text-center mt-10">No articles found.</div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <div
              key={article._id}
              className="bg-gray-800 rounded-lg shadow-md p-4 relative"
            >
              {article.uploader._id === userId && (
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                  onClick={() => handleDeleteArticle(article._id)}
                  disabled={deletingArticleId === article._id}
                >
                  {deletingArticleId === article._id ? (
                    <span className="text-sm">Deleting...</span>
                  ) : (
                    <FaTrash size={16} />
                  )}
                </button>
              )}

              <div className="flex mb-4">
                <div className="flex-shrink-0 w-1/3 pr-4">
                  <img
                    src={article.image}
                    alt={article.heading}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">
                    {article.heading}
                  </h3>
                  <p className="text-gray-400">{article.articleBody}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Posted by: {article.uploader.name}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <button onClick={() => handleLikeToggle(article._id)}>
                    {likedArticles[article._id] ? (
                      <FaHeart className="text-red-500 mr-2" />
                    ) : (
                      <FaRegHeart className="text-white mr-2" />
                    )}
                  </button>
                  <span>{article.likes} likes</span>
                </div>
                <button
                  onClick={() => toggleComments(article._id)}
                  className="flex items-center text-gray-400 hover:text-white"
                >
                  <FaComments className="mr-2" />
                  <span>{article.comments.length} comments</span>
                </button>
              </div>

              {expandedComments[article._id] && (
                <div className="mt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCommentSubmit(article._id);
                    }}
                  >
                    <textarea
                      value={commentTexts[article._id] || ""}
                      onChange={(e) =>
                        handleCommentChange(article._id, e.target.value)
                      }
                      placeholder="Add a comment..."
                      className="w-full border-none bg-gray-700 text-white rounded-lg p-2"
                      rows="2"
                    ></textarea>
                    <button
                      type="submit"
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                      disabled={
                        !commentTexts[article._id] ||
                        commentTexts[article._id].trim() === ""
                      }
                    >
                      Comment
                    </button>
                  </form>

                  <div className="mt-4">
                    {article.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="bg-gray-900 p-2 rounded-lg mb-2 flex justify-between items-start"
                      >
                        <div>
                          <div className="flex items-center mb-1">
                            {comment.user && (
                              <User
                                avatarProps={{
                                  src: comment.user.profilePic,
                                  size: "sm",
                                }}
                                name={comment.user.name}
                                className="mr-2"
                              />
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                        {comment.user && comment.user._id === userId && (
                          <button
                            className="text-red-600 hover:text-red-400 text-xs ml-2"
                            onClick={() =>
                              handleDeleteComment(article._id, comment._id)
                            }
                            disabled={deletingCommentId === comment._id}
                          >
                            {deletingCommentId === comment._id ? (
                              "Deleting..."
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComPublic;

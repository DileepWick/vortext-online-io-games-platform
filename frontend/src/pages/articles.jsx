import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { Textarea, User } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import {
  FaHeart,
  FaRegHeart,
  FaTrash,
  FaComments,
  FaFlag,
  FaEdit,
  FaImage,
} from "react-icons/fa";
import { toast, Flip } from "react-toastify";
import Loader from "../components/Loader/loader";
import "react-toastify/dist/ReactToastify.css";
import useAuthCheck from "../utils/authCheck";
import { cn } from "../libs/util";
import { Input } from "../components/ui/Input";
import { API_BASE_URL } from "../utils/getAPI";
import LogoLoader from "./../components/ui/Loader";

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

const CreatePostModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [heading, setHeading] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!heading.trim() || !articleBody.trim() || !image) {
      toast.error("Please fill all fields and select an image", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
      return;
    }

    onSubmit({ heading, articleBody, image });
    setHeading("");
    setArticleBody("");
    setImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-primaryRegular">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-4 mb-6">
            {user && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-300 overflow-hidden">
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                id="heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full border border-gray-800 rounded-lg px-4 py-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-primaryRegular"
              />
            </div>
          </div>

          <div className="mb-6">
            <textarea
              id="articleBody"
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg p-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 font-primaryRegular"
              rows="5"
            ></textarea>
          </div>

          {image && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="w-full h-auto max-h-64 object-contain"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div className="flex flex-col items-center">
                <FaImage className="text-gray-500 mb-2 text-xl" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-black">
                    Upload an image
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {image ? image.name : "PNG, JPG up to 5MB"}
                </p>
              </div>
              <Input
                type="file"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium font-primaryRegular"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!heading && !articleBody}
              className={`px-6 py-2.5 rounded-lg transition duration-200 font-medium font-primaryRegular ${
                !heading && !articleBody
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Articles = () => {
  useAuthCheck();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedArticles, setLikedArticles] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [deletingArticleId, setDeletingArticleId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [reportingArticleId, setReportingArticleId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setError("Error fetching articles");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [userId]);

  const handleSubmit = async ({ heading, articleBody, image }) => {
    setError("");
    setSuccess("");

    if (!heading || !articleBody || !image) {
      setError("Please fill all fields and select an image");
      return;
    }

    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("articleBody", articleBody);
    formData.append("image", image);
    formData.append("uploader", userId);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/articles/createNewArticle`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        toast.success("Article created successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        fetchArticles();
      }
    } catch (err) {
      toast.error("Error creating article. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
      console.error(err);
    }
  };

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
                      user: {
                        _id: userId,
                        name: user.name,
                        profilePic: user.profilePic,
                      },
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

  const handleReportArticle = async (articleId) => {
    try {
      setReportingArticleId(articleId);
      await axios.post(`${API_BASE_URL}/articles/report/${articleId}`, {
        userId,
      });
      alert("Article reported successfully");
      setReportingArticleId(null);
    } catch (err) {
      setReportingArticleId(null);
      console.error("Error reporting article", err);
      alert("Failed to report article. Please try again.");
    }
  };

  const handleEditComment = async (articleId, commentId, newText) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/articles/editComment/${articleId}/${commentId}`,
        {
          userId,
          text: newText,
        }
      );

      if (response.status === 200) {
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article._id === articleId
              ? {
                  ...article,
                  comments: article.comments.map((comment) =>
                    comment._id === commentId
                      ? { ...comment, text: newText, editedAt: new Date() }
                      : comment
                  ),
                }
              : article
          )
        );
        setEditingCommentId(null);
        setEditedCommentText("");
        toast.success("Comment updated successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
    } catch (err) {
      console.error("Error editing comment", err);
      toast.error("Failed to edit comment. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    }
  };

  const toggleComments = (articleId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  console.log("Articles:", articles);

  if (loading) {
    return <LogoLoader isLoading={loading} />;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-black bg-white min-h-screen flex items-center justify-center font-bold text-lg sm:text-xl font-primaryRegular px-4">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vortex Community
              </h1>
              <p className="text-gray-600 mt-2">
                Discover and share your thoughts with the community
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 border border-black hover:bg-gray-700 hover:text-white text-black rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create a Post
            </button>
          </div>
        </div>

        <CreatePostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          user={user}
        />

        {/* Posts Grid */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products listed yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share a product with the community!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition-all"
              >
                List Your First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.heading}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  {article.category && (
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      {article.category}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {article.heading}
                    </h3>
                    {article.price && (
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-3">
                        ${article.price}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.articleBody}
                  </p>

                  {/* User Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
                      <img
                        src={article.uploader.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {article.uploader.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLikeToggle(article._id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        {likedArticles[article._id] ? (
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        )}
                        <span className="text-sm">{article.likes}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(article._id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors ml-3"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span className="text-sm">
                          {article.comments.length}
                        </span>
                      </button>
                    </div>

                    {article.uploader._id === userId ? (
                      <button
                        onClick={() => handleDeleteArticle(article._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={deletingArticleId === article._id}
                      >
                        {deletingArticleId === article._id ? (
                          <span className="text-sm">Deleting...</span>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReportArticle(article._id)}
                        className="text-gray-400 hover:text-orange-500 transition-colors"
                        disabled={reportingArticleId === article._id}
                      >
                        {reportingArticleId === article._id ? (
                          <span className="text-sm">Reporting...</span>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[article._id] && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50">
                    {/* Comment Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCommentSubmit(article._id);
                      }}
                      className="mb-6"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          <img
                            src={
                              user?.profilePic ||
                              "https://via.placeholder.com/40"
                            }
                            alt="Your profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={commentTexts[article._id] || ""}
                            onChange={(e) =>
                              handleCommentChange(article._id, e.target.value)
                            }
                            placeholder="Add a comment..."
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            rows="2"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                              disabled={
                                !commentTexts[article._id] ||
                                commentTexts[article._id].trim() === ""
                              }
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {article.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                <img
                                  src={comment.user.profilePic}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.user.username}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      comment.createdAt
                                    ).toLocaleString()}
                                  </span>
                                </div>

                                {editingCommentId === comment._id ? (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleEditComment(
                                        article._id,
                                        comment._id,
                                        editedCommentText
                                      );
                                    }}
                                    className="space-y-2"
                                  >
                                    <textarea
                                      value={editedCommentText}
                                      onChange={(e) =>
                                        setEditedCommentText(e.target.value)
                                      }
                                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                      rows="2"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="submit"
                                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                                      >
                                        Update
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCommentId(null);
                                          setEditedCommentText("");
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div>
                                    <p className="text-sm text-gray-800">
                                      {comment.text}
                                    </p>
                                    {comment.editedAt && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        (edited)
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {comment.user._id === userId && (
                              <div className="flex gap-1">
                                <button
                                  className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditedCommentText(comment.text);
                                  }}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  onClick={() =>
                                    handleDeleteComment(
                                      article._id,
                                      comment._id
                                    )
                                  }
                                  disabled={deletingCommentId === comment._id}
                                >
                                  {deletingCommentId === comment._id ? (
                                    <span className="text-xs">...</span>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
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
      <Footer />
    </div>
  );
};

export default Articles;

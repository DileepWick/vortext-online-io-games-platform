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
import { Label } from "../components/ui/Lable";
import { TracingBeam } from "../components/ui/TracingBeam";
import { BackgroundBeams } from "../components/ui/BackgroundBeams";
import { WobbleCard } from "../components/ui/wobble-card";

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
    <div className="fixed inset-0 dark flex justify-center items-center z-50">
      <div className="bg-white border-2 border-black rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-black border-b-2 border-black pb-2 font-primaryRegular">
          Create Post
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center mb-6">
            {user && (
              <div className="mr-4 w-12 h-12 rounded-full border-2 border-black overflow-hidden">
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover "
                />
              </div>
            )}
            <Input
              type="text"
              id="heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border-2 border-black rounded-lg p-3 bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black font-primaryRegular"
            />
          </div>
          <div className="mb-6">
            <Label
              htmlFor="articleBody"
              className="mb-2 block text-black font-semibold font-primaryRegular"
            >
              Write something...
            </Label>
            <textarea
              id="articleBody"
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full border-2 border-black bg-white text-black placeholder-gray-600 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-black transition duration-200 font-primaryRegular"
              rows="4"
            ></textarea>
          </div>
          <div className="mb-6">
            <Label
              htmlFor="image"
              className="mb-2 block text-black font-semibold font-primaryRegular"
            >
              Add to your post
            </Label>
            <div className="relative">
              <Input
                type="file"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-black text-black rounded-lg cursor-pointer hover:bg-gray-100 transition duration-200 font-primaryRegular"
              >
                <FaImage className="mr-2 text-black" />
                <span className="font-medium">
                  {image ? image.name : "Choose an image"}
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-black bg-white text-black rounded-lg hover:bg-black hover:text-white transition duration-200 font-medium font-primaryRegular"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200 font-medium font-primaryRegular"
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
          `http://localhost:8098/users/profile/${userId}`
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
        "http://localhost:8098/articles/getAllArticles"
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
        "http://localhost:8098/articles/createNewArticle",
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
        `http://localhost:8098/articles/toggleLike/${articleId}`,
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
        `http://localhost:8098/articles/${articleId}/comments`,
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
        `http://localhost:8098/articles/deleteComment/${articleId}/${commentId}`
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
        `http://localhost:8098/articles/deleteArticle/${articleId}`,
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
      await axios.post(`http://localhost:8098/articles/report/${articleId}`, {
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
        `http://localhost:8098/articles/editComment/${articleId}/${commentId}`,
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

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-black bg-white min-h-screen flex items-center justify-center font-bold text-xl font-primaryRegular">
        {error}
      </div>
    );
  }

  return (
    <div className="dark min-h-screen text-white font-primaryRegular">
      <Header />

      <div className="container mx-auto p-6">
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
        >
          Create New Post
        </Button>
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          user={user}
        />
        <h2 className="font-primaryRegular text-4xl font-bold mb-8 text-black border-b-4 border-black pb-2">
          Posts
        </h2>
        {articles.length === 0 ? (
          <div className="text-center mt-20 text-gray-600 text-xl font-primaryRegular">
            No articles found.
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-white border-4 border-black rounded-lg shadow-2xl p-6 relative"
              >
                {article.uploader._id === userId && (
                  <button
                    className="absolute top-4 right-4 flex items-center justify-center space-x-2 text-black hover:text-gray-600 border-2 border-black rounded-lg px-3 py-2 bg-white hover:bg-gray-100 transition duration-200 font-primaryRegular"
                    onClick={() => handleDeleteArticle(article._id)}
                    disabled={deletingArticleId === article._id}
                  >
                    {deletingArticleId === article._id ? (
                      <span className="text-sm font-medium">Deleting...</span>
                    ) : (
                      <>
                        <FaTrash className="inline-block" size={16} />
                        <span className="font-medium">Delete</span>
                      </>
                    )}
                  </button>
                )}

                {article.uploader._id !== userId && (
                  <button
                    className="absolute top-4 right-4 flex items-center justify-center space-x-2 border-2 border-black rounded-lg px-3 py-2 bg-white hover:bg-gray-100 transition duration-200 font-primaryRegular"
                    onClick={() => handleReportArticle(article._id)}
                    disabled={reportingArticleId === article._id}
                  >
                    {reportingArticleId === article._id ? (
                      <span className="font-medium text-lg">Reporting...</span>
                    ) : (
                      <>
                        <FaFlag className="inline-block" size={16} />
                        <span className="font-medium text-lg">Report</span>
                      </>
                    )}
                  </button>
                )}

                <div className="flex mb-6">
                  <div className="flex-shrink-0 w-1/3 pr-6">
                    <img
                      src={article.image}
                      alt={article.heading}
                      className="w-full h-[300px] object-cover rounded-lg border-2 border-black"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-3xl font-bold mb-6 text-black border-b-2 border-black pb-2 font-primaryRegular">
                      {article.heading}
                    </h3>
                    <p className="text-gray-800 font-medium text-lg leading-relaxed mb-6 font-primaryRegular">
                      {article.articleBody}
                    </p>
                    <div className="flex items-center mt-6">
                      <div className="w-16 h-16 rounded-full border-2 border-black overflow-hidden mr-4">
                        <img
                          src={article.uploader.profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-black font-primaryRegular">
                          {article.uploader.username}
                        </p>
                        <p className="text-gray-600 font-medium font-primaryRegular">
                          {article.uploader.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 border-t-2 border-black pt-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleLikeToggle(article._id)}
                      className="flex items-center space-x-2 px-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-gray-100 transition duration-200"
                    >
                      {likedArticles[article._id] ? (
                        <FaHeart className="text-black text-xl" />
                      ) : (
                        <FaRegHeart className="text-black text-xl" />
                      )}
                    </button>
                    <span className="font-bold text-lg ml-4 text-black font-primaryRegular">
                      {article.likes} Likes
                    </span>
                  </div>
                  <button
                    onClick={() => toggleComments(article._id)}
                    className="flex items-center space-x-2 px-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-gray-100 transition duration-200"
                  >
                    <FaComments className="text-black text-xl" />
                    <span className="font-bold text-lg font-primaryRegular">
                      {article.comments.length} Comments
                    </span>
                  </button>
                </div>

                {expandedComments[article._id] && (
                  <div className="mt-6 border-t-2 border-black pt-6">
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
                        className="w-full mb-4 p-3 border-2 border-black rounded-lg bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black font-medium font-primaryRegular"
                        rows="3"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200 font-medium font-primaryRegular"
                        disabled={
                          !commentTexts[article._id] ||
                          commentTexts[article._id].trim() === ""
                        }
                      >
                        Comment
                      </button>
                    </form>

                    <div className="mt-6 space-y-4">
                      {article.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="bg-gray-100 border-2 border-black p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="w-full">
                              <div className="flex items-center mb-3">
                                {comment.user && (
                                  <>
                                    <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden mr-3">
                                      <img
                                        src={comment.user.profilePic}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-bold text-black font-primaryRegular">
                                        {comment.user.username}
                                      </p>
                                      <p className="text-gray-600 text-sm font-primaryRegular">
                                        {comment.user.role}
                                      </p>
                                    </div>
                                  </>
                                )}
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
                                >
                                  <textarea
                                    value={editedCommentText}
                                    onChange={(e) =>
                                      setEditedCommentText(e.target.value)
                                    }
                                    className="w-full mb-3 p-2 border-2 border-black rounded-lg bg-white text-black font-medium font-primaryRegular"
                                    rows="3"
                                  />
                                  <div className="flex space-x-2">
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200 font-medium font-primaryRegular"
                                    >
                                      Update
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditedCommentText("");
                                      }}
                                      className="px-4 py-2 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition duration-200 font-medium font-primaryRegular"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <p className="text-black font-medium text-base leading-relaxed font-primaryRegular">
                                  {comment.text}
                                </p>
                              )}
                              {comment.editedAt && (
                                <p className="text-sm text-gray-500 mt-2 font-medium font-primaryRegular">
                                  (Edited:{" "}
                                  {new Date(comment.editedAt).toLocaleString()})
                                </p>
                              )}
                            </div>
                            {comment.user && comment.user._id === userId && (
                              <div className="flex space-x-2 ml-4">
                                <button
                                  className="text-black hover:text-gray-600 border-2 border-black rounded-lg p-2 bg-white hover:bg-gray-100 transition duration-200"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditedCommentText(comment.text);
                                  }}
                                >
                                  <FaEdit className="text-base" />
                                </button>
                                <button
                                  className="text-black hover:text-gray-600 border-2 border-black rounded-lg p-2 bg-white hover:bg-gray-100 transition duration-200"
                                  onClick={() =>
                                    handleDeleteComment(
                                      article._id,
                                      comment._id
                                    )
                                  }
                                  disabled={deletingCommentId === comment._id}
                                >
                                  {deletingCommentId === comment._id ? (
                                    <span className="text-sm font-primaryRegular">
                                      ...
                                    </span>
                                  ) : (
                                    <FaTrash className="text-base" />
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

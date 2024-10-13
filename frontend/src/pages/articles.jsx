import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { User } from "@nextui-org/react";
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
import {cn} from "../libs/util";
import  {Input}  from "../components/ui/Input";
import  {Label}  from "../components/ui/Lable";
import { TracingBeam } from "../components/ui/TracingBeam";
import { BackgroundBeams } from "../components/ui/BackgroundBeams";

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    (<div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>)
  );
};
const CreatePost = ({ user, onSubmit }) => {
  const [heading, setHeading] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ heading, articleBody, image });
    setHeading("");
    setArticleBody("");
    setImage(null);
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-400 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Create Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4">
          {user && (
            <User
              avatarProps={{
                src: user.profilePic,
                size: "sm",
              }}
              className="mr-3"
            />
          )}
          <Input
            type="text"
            id="heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="articleBody" className="mb-2 block">
            Write something...
          </Label>
          <textarea
            id="articleBody"
            value={articleBody}
            onChange={(e) => setArticleBody(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white rounded-lg p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
            rows="4"
          ></textarea>
        </div>
        <div className="mb-4">
          <Label htmlFor="image" className="mb-2 block">
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
              className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
            >
              <FaImage className="mr-2" />
              {image ? image.name : "Choose an image"}
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Post
        </button>
      </form>
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
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-customDark min-h-screen text-white font-sans">
      <TracingBeam>
      <Header />

      <div className="container mx-auto p-4">
        <CreatePost user={user} onSubmit={handleSubmit} />

        <h2 className="text-3xl font-bold mb-6">Posts</h2>
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

                {article.uploader._id !== userId && (
                  <button
                    className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-400"
                    onClick={() => handleReportArticle(article._id)}
                    disabled={reportingArticleId === article._id}
                  >
                    {reportingArticleId === article._id ? (
                      <span className="text-sm">Reporting...</span>
                    ) : (
                      <FaFlag size={16} />
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
                      Posted by: {article.uploader.username}
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
                      <Input
                        type="text"
                        value={commentTexts[article._id] || ""}
                        onChange={(e) =>
                          handleCommentChange(article._id, e.target.value)
                        }
                        placeholder="Add a comment..."
                        className="w-full mb-2"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                        disabled={
                          !commentTexts[article._id] ||
                          commentTexts[article._id].trim() === ""
                        }
                      >
                        Comment
                      </button>
                    </form>

                    <div className="mt-4 space-y-2">
                      {article.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="bg-gray-900 p-2 rounded-lg flex justify-between items-start"
                        >
                          <div className="w-full">
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
                                <Input
                                  type="text"
                                  value={editedCommentText}
                                  onChange={(e) =>
                                    setEditedCommentText(e.target.value)
                                  }
                                  className="w-full mb-2"
                                />
                                <div>
                                  <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setEditedCommentText("");
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="text-sm">{comment.text}</p>
                            )}
                            {comment.editedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                (Edited:{" "}
                                {new Date(comment.editedAt).toLocaleString()})
                              </p>
                            )}
                          </div>
                          {comment.user && comment.user._id === userId && (
                            <div className="flex">
                              <button
                                className="text-blue-500 hover:text-blue-400 text-xs mr-2"
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditedCommentText(comment.text);
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-400 text-xs"
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
                            </div>
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
      </TracingBeam>
      <Footer />
    </div>
  );
};

export default Articles;
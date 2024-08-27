import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { User } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";

const Articles = () => {
  const [heading, setHeading] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedArticles, setLikedArticles] = useState({});
  const [commentText, setCommentText] = useState('');
  const [deletingArticleId, setDeletingArticleId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const token = getToken();
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8098/users/profile/${userId}`);
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
      const response = await axios.get("http://localhost:8098/articles/getAllArticles");
      const fetchedArticles = response.data.articles;
      setArticles(fetchedArticles);

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

  useEffect(() => {
    fetchArticles();
  }, [userId]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!heading || !articleBody || !image) {
      setError('Please fill all fields and select an image');
      return;
    }

    const formData = new FormData();
    formData.append('heading', heading);
    formData.append('articleBody', articleBody);
    formData.append('image', image);
    formData.append('uploader', userId);

    try {
      const response = await axios.post('http://localhost:8098/articles/createNewArticle', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSuccess('Article created successfully');
        setHeading('');
        setArticleBody('');
        setImage(null);
        fetchArticles();
      }
    } catch (err) {
      setError('Error creating article');
      console.error(err);
    }
  };

  const handleLikeToggle = async (articleId) => {
    try {
      const response = await axios.put(`http://localhost:8098/articles/toggleLike/${articleId}`, { userId });
      const updatedArticle = response.data;

      setLikedArticles(prevLikedArticles => ({
        ...prevLikedArticles,
        [articleId]: !prevLikedArticles[articleId],
      }));

      setArticles(prevArticles =>
        prevArticles.map(article =>
          article._id === articleId ? { ...article, likes: updatedArticle.likes } : article
        )
      );
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };

  const handleCommentSubmit = async (articleId) => {
    try {
      const response = await axios.post(`http://localhost:8098/articles/${articleId}/comments`, {
        userId,
        text: commentText
      });

      if (response.status === 201) {
        setArticles(prevArticles =>
          prevArticles.map(article =>
            article._id === articleId
              ? {
                  ...article,
                  comments: [
                    ...article.comments,
                    {
                      ...response.data.comment,
                      user: { _id: userId, name: user.name }
                    }
                  ]
                }
              : article
          )
        );
        setCommentText('');
      }
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const handleDeleteComment = async (articleId, commentId) => {
    try {
      setDeletingCommentId(commentId);
      await axios.delete(`http://localhost:8098/articles/deleteComment/${articleId}`, {
        data: { userId, commentId }
      });

      setArticles(prevArticles =>
        prevArticles.map(article =>
          article._id === articleId
            ? { ...article, comments: article.comments.filter(comment => comment._id !== commentId) }
            : article
        )
      );
      setDeletingCommentId(null);
    } catch (err) {
      setDeletingCommentId(null);
      console.error("Error deleting comment", err);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      setDeletingArticleId(articleId);
      await axios.delete(`http://localhost:8098/articles/deleteArticle/${articleId}`, {
        data: { userId }
      });

      setArticles(prevArticles => prevArticles.filter(article => article._id !== articleId));
      setDeletingArticleId(null);
    } catch (err) {
      setDeletingArticleId(null);
      console.error("Error deleting article", err);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-customDark min-h-screen text-white font-sans">
      <Header />
      <div className="container mx-auto p-4">
        <div className="max-w-lg mx-auto bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-2xl font-bold mb-4">Create Post</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-4">
              {user && (
                <User
                  avatarProps={{
                    src: user.profilePic,
                    // Override disableAnimation prop
                    disableAnimation: undefined,
                  }}
                  className="mr-3"
                />
              )}
              <input
                type="text"
                id="heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder=" What's on your mind?"
                className="w-full border-none bg-gray-700 text-white text-lg focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <textarea
                id="articleBody"
                value={articleBody}
                onChange={(e) => setArticleBody(e.target.value)}
                placeholder="Write something..."
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                rows="4"
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="image" className="block text-sm font-medium text-gray-500">Add to your post</label>
              <input
                type="file"
                id="image"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-none file:bg-gray-600 file:text-blue-400 hover:file:bg-gray-700"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Post
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          {success && <p className="text-green-500 mt-4 text-center">{success}</p>}
        </div>

        <h2 className="text-3xl font-bold mb-6">Posts</h2>
        {articles.length === 0 ? (
          <div className="text-center mt-10">No articles found.</div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div key={article._id} className="bg-gray-800 rounded-lg shadow-md p-4 relative">
                {article.uploader === userId && (
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
                    <h3 className="text-xl font-semibold mb-2">{article.heading}</h3>
                    <p className="text-gray-400">{article.articleBody}</p>
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
                </div>

                <div className="mt-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(article._id); }}>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full border-none bg-gray-700 text-white rounded-lg p-2"
                      rows="2"
                    ></textarea>
                    <button
                      type="submit"
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Comment
                    </button>
                  </form>

                  <div className="mt-4">
                    {article.comments.map((comment) => (
                      <div key={comment._id} className="bg-gray-900 p-2 rounded-lg mb-2 flex justify-between items-start">
                        <div>
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs text-gray-500">
                            By {comment.user.name} on {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {comment.user._id === userId && (
                          <button
                            className="text-red-500 hover:text-red-400"
                            onClick={() => handleDeleteComment(article._id, comment._id)}
                            disabled={deletingCommentId === comment._id}
                          >
                            {deletingCommentId === comment._id ? (
                              <span className="text-xs">Deleting...</span>
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
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

export default Articles;
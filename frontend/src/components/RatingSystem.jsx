import React, { useState } from 'react';
import { Button, Textarea } from "@nextui-org/react";

const RatingSystem = ({ gameId, ratings, averageRating, onSubmitRating }) => {
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    onSubmitRating(userRating, comment);
    setUserRating(0);
    setComment('');
  };

  return (
    <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#131213' }}>
      <h3 className="text-2xl font-bold text-white mb-6">User Ratings</h3>

      {/* Main User Rating */}
      <div className="flex items-center mb-6">
        <span className="text-5xl font-bold text-white mr-4">{isNaN(averageRating) ? 'N/A' : averageRating.toFixed(1)}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-8 h-8 ${averageRating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="ml-4 text-gray-400 text-xl">({ratings.length} reviews)</span>
      </div>

      {/* Rating Submission */}
      <div className="mb-6">
        <h4 className="text-xl text-white mb-2">Rate this game:</h4>
        <div className="flex mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setUserRating(star)}
              className={`w-10 h-10 ${
                (hoverRating || userRating) >= star ? 'text-yellow-400' : 'text-gray-500'
              } focus:outline-none transition-colors duration-200`}
            >
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review..."
          className="mb-4"
          css={{
            backgroundColor: '#333333',
            color: '#e0e0e0',
            width: '100%',
            height: '150px', // Adjusted height for the review box
            borderColor: 'gray-600',
          }}
        />
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          className="transition-colors duration-200"
          css={{
            backgroundColor: '#0056cc',
            hoverBackgroundColor: '#003399',
            width: '100%',
            maxWidth: '200px',
          }}
          disabled={userRating === 0}
        >
          Submit Review
        </Button>
      </div>

      {/* User Reviews */}
      <div className="mt-10">
        <h4 className="text-xl font-bold text-white mb-4">User Reviews:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ratings.map((rating, index) => (
            <div key={index} className="p-6 rounded-lg shadow-md" style={{ backgroundColor: '#333333' }}>
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${rating.rating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-400">by {rating.user.username}</span>
              </div>
              <p className="text-white mb-4">{rating.comment}</p>
              <a href="#" className="text-blue-400 hover:underline">Read Full Review</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSystem;


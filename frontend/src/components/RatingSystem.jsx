import React, { useState } from 'react';
import { Button, Textarea } from "@nextui-org/react";

const RatingSystem = ({ gameId, ratings, averageRating, onSubmitRating }) => {
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmitRating(userRating, comment);
    setUserRating(0);
    setComment('');
  };

  return (
    <div>
      <h3 className='text-white font-primaryRegular"'>Average Rating: {averageRating.toFixed(1)} / 5</h3>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setUserRating(star)}
            className={`text-2xl ${userRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        className="mt-2"
      />
      <Button onClick={handleSubmit} color="primary" className="mt-2">
        Submit Rating
      </Button>
      <div className="mt-4">
        <h4>User Reviews:</h4>
        {ratings.map((rating, index) => (
          <div key={index} className="border-b border-gray-200 py-2 text-white font-primaryRegular">
            <p>Rating: {rating.rating} / 5</p>
            <p>{rating.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingSystem;
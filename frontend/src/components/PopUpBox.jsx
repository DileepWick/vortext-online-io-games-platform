import React, { useState } from "react";

const PopupBox = ({ message, imageUrl, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!message) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black opacity-50 fixed inset-0" onClick={onClose}></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-10">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Popup Image"
            style={{ display: imageLoaded ? "block" : "none" }}
            onLoad={handleImageLoad}
            height="300"
            width="300"
          />
        )}
        {!imageLoaded && <div className="placeholder-image"></div>}
        <p>{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PopupBox;




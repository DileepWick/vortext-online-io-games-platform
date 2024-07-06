import React, { useState } from "react";

const confirmationBox = ({ message, imageUrl, onConfirm, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!message) return null;

  const handleConfirm = () => {
    onConfirm(true);
    onClose();
  };

  const handleCancel = () => {
    onConfirm(false);
    onClose();
  };

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
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Yes
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default confirmationBox;


import React, { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const [lockRotation, setLockRotation] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const interval = setInterval(() => {
      setLockRotation((prev) => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
    setTimeout(() => setIsUnlocked(false), 2000);
  };

  const handleGoHome = () => {
    navigate("/"); // Navigate to homepage
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-6xl font-bold mb-8">401</div>
      <div className="text-4xl mb-8">Unauthorized Access</div>
      <div className="relative mb-8">
        {isUnlocked ? (
          <Unlock size={100} className="text-green-500 animate-bounce" />
        ) : (
          <Lock
            size={100}
            className="text-red-500 cursor-pointer hover:text-red-400 transition-colors"
            style={{ transform: `rotate(${lockRotation}deg)` }}
            onClick={handleUnlock}
          />
        )}
      </div>
      <p className="text-xl mb-4 text-center max-w-md">
        {isUnlocked
          ? "Nice try! But you'll need more than a click to get through."
          : "Oops! Looks like you've wandered into restricted territory."}
      </p>
      <p className="text-lg text-gray-400 mb-6">
        {isUnlocked
          ? "Relocking in progress..."
          : "Click the lock to try your luck!"}
      </p>

      {/* Back to Home Button */}
      <button
        onClick={handleGoHome}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
};

export default UnauthorizedPage;

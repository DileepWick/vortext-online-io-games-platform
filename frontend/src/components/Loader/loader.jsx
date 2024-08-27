import React, { useState, useEffect } from 'react';

const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 10000); // 10000 milliseconds = 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-customDark">
      {isLoading ? (
        <div className="w-16 h-16 border-4 border-t-customPink border-transparent border-solid rounded-full animate-spin"></div>
      ) : (
        <div className="text-white">
          <h1>Main Content Here</h1>
        </div>
      )}
    </div>
  );
};

export default Loader;

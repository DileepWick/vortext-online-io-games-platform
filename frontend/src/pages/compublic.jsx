import React from "react";
import Header from '../components/header';

const ComPublic = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Public Community</h1>
        <p>Welcome to the public community area. Everyone can access and view this content.</p>
        {/* Add your public community content here */}
      </div>
    </>
  );
};

export default ComPublic;
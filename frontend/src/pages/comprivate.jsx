import React from "react";
import Header from '../components/header';

const ComPrivate = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Private Community</h1>
        <p>This is the private community area. Only authorized users can access this content.</p>
        {/* Add your private community content here */}
      </div>
    </>
  );
};

export default ComPrivate;
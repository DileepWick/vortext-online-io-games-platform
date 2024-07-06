import React, { useState } from "react";

const ShootButton = () => {
  // State variables
  const [direction, setDirection] = useState("Enter direction");
  const [power, setPower] = useState("Enter power");

  // Function to handle shooting
  const shoot = () => {
    emptyFields();
    alert(`Nice Shot towards ${direction} with ${power} power.!`);
  };

  //Function to empty input  fields
  const emptyFields = () =>{
    setDirection("Enter power");
    setPower("Enter power");
  }

  // Return segment that displays elements
  return (
    <div className="p-4 space-y-4">
      <label className="block text-gray-700">Direction</label>
      <input
        type="text"
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
      />

      <label className="block text-gray-700">Power</label>
      <input
        type="text"
        value={power}
        onChange={(e) => setPower(e.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
        

      />

      <button
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
        onClick={shoot}
      >
        Shoot Now
      </button>
    </div>
  );
};

export default ShootButton;

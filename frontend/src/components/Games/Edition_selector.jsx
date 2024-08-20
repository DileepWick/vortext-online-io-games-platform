import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@nextui-org/react"; // Import Button component from NextUI or use a standard button
import { PlayIcon } from "../../assets/icons/playIcon";
import AddNewEdition from "../Games/Add_new_edition";

const EditionSelector = ({ onSelectEdition }) => {
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8098/spookeyEditons/"
        );
        setEditions(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load editions.");
        setLoading(false);
      }
    };

    fetchEditions();
  }, []);

  const handlePlayButtonClick = (editionId) => {
    onSelectEdition(editionId); // Pass the edition ID to the callback
  };

  if (loading) {
    return <p>Loading editions...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="edition-selector">
      <h2 className="text-xl mb-4 mt-4">Available Editions</h2>
      <AddNewEdition/>
      <div className="edition-buttons-container grid grid-cols-4 gap-4 mt-4">
        {editions.map((edition) => (
          <Button
            size="sm"
            key={edition._id}
            onClick={() => handlePlayButtonClick(edition._id)} // Pass the ID of the selected edition
            variant="shadow"
            color="default"
            className="font-primaryRegular text-md"
          >
            {edition.title} <PlayIcon />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EditionSelector;

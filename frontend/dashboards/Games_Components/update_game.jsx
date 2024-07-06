import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Progress, Input, Button, Textarea } from "@nextui-org/react";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";

const UpdateGame = ({ updatingGame, callBackFunction1, callBackFunction2 }) => {
  if (!updatingGame) {
    return <p>No game selected for updating.</p>;
  }

  // Initialize selected categories based on updatingGame.Genre
  let initialCategories = [];
  if (updatingGame.Genre) {
    if (Array.isArray(updatingGame.Genre)) {
      initialCategories = updatingGame.Genre.map((cat) => cat.toLowerCase());
    } else if (typeof updatingGame.Genre === "string") {
      initialCategories = updatingGame.Genre.toLowerCase().split(",");
    }
  }

  const [game, setGame] = useState(updatingGame);
  const [selectedCategories, setSelectedCategories] =
    useState(initialCategories);
  const [title, setTitle] = useState(updatingGame.title);
  const [description, setDescription] = useState(updatingGame.Description);
  const [coverPhoto, setCoverPhoto] = useState(updatingGame.coverPhoto);
  const [trailerVideo, setTrailerVideo] = useState(updatingGame.TrailerVideo);
  const [isLoading, setLoading] = useState(false);

  // Fixed categories list
  const categoriesList = [
    { _id: "action", categoryName: "Action" },
    { _id: "adventure", categoryName: "Adventure" },
    { _id: "racing", categoryName: "Racing" },
  ];


  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setLoading(true); // Stop loading
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("Category", selectedCategories.join(","));
      if (coverPhoto) formData.append("image", coverPhoto);
      if (trailerVideo) formData.append("video", trailerVideo);

      const response = await axios.put(
        `http://localhost:8098/games//updateGame/${game._id}`,
        formData
      );

      // Handle success
      toast.success("Game Updated Successfully", {
        style: { fontFamily: "Rubik" },
      });
      if (callBackFunction1 && callBackFunction2) {
        callBackFunction1();
        callBackFunction2();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update game");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Separate selected and other categories
  const selectedCategoriesDisplay = selectedCategories.map((cat) => (
    <li defaultSelected key={cat}>
      {cat}
    </li>
  ));

  const otherCategoriesCheckboxes = categoriesList.map((cat) => (
    <label key={cat._id}>
      <Checkbox
        type="checkbox"
        checked={selectedCategories.includes(cat.categoryName.toLowerCase())}
        onChange={() => handleCategoryChange(cat.categoryName.toLowerCase())}
      />
      {cat.categoryName}
    </label>
  ));

  return (
    <div>
      {isLoading ? (
        <div className="loading">
          <Progress
            label="Updating..."
            size="sm"
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
          />
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="p-4">
          <div className="form-section">
            <h3>Game Information</h3>
            <Input
              label="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label>
              About Game:
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label>Change Cover photo</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverPhoto(e.target.files[0])}
            />
            {coverPhoto && (
              <img src={coverPhoto} alt="Game Cover" width="240" />
            )}
          </div>

          <div className="form-section">
            <label>
              Trailer Video:
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setTrailerVideo(e.target.files[0])}
              />
            </label>
            {trailerVideo && <video src={trailerVideo} controls width="300" />}

            <div>
              <h4>Current Categories</h4>
              {selectedCategoriesDisplay}
            </div>

            <div>
              <h4>Select other categories:</h4>
              {otherCategoriesCheckboxes}
            </div>
          </div>

          <Button type="submit" color="primary" size="lg">
            Update
          </Button>
        </form>
      )}
    </div>
  );
};

export default UpdateGame;

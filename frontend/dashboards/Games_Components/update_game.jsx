import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Progress, Input, Button, Textarea, Chip } from "@nextui-org/react";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import { ScrollShadow } from "@nextui-org/react";

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
    { _id: "Action", categoryName: "Action" },
    { _id: "Adventure", categoryName: "Adventure" },
    { _id: "Racing", categoryName: "Racing" },
    { _id: "Puzzle", categoryName: "Puzzle" },
    { _id: "Fighting", categoryName: "Fighting" },
    { _id: "Strategy", categoryName: "Strategy" },
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
    <Chip color ="danger"    defaultSelected key={cat}>
      {cat}
    </Chip>
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
            label="Saving Changes"
            size="lg"
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
          />
        </div>
      ) : (
        <ScrollShadow className="w-[700px] h-[400px]" hideScrollBar>
          <Chip color="primary" className="ml-4">{title}</Chip>
          <form
            onSubmit={handleUpdate}
            className="space-y-6 p-6 bg-white rounded-lg shadow-lg"
          >
            {/* Title Section */}
            <div className="form-section">
              <h3 className="text-sm font-semibold text-black mb-4">
                Change Title
              </h3>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter game title"
                className="w-full  text-white"
              />
            </div>

            {/* Description Section */}
            <div className="form-section">
              <label className="text-sm font-semibold text-black mb-4">
                Change Description (max 390)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={390}
                placeholder="Write a brief description of the game..."
                className="w-full  rounded-lg text-white"
              />
            </div>

            {/* Cover Photo Section */}
            <div className="form-section">
              <label className="text-sm font-semibold text-black mb-4">
                Change Cover Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverPhoto(e.target.files[0])}
                className="block w-full text-sm text-gray-400 file:py-2 file:px-4 file:border file:border-gray-700 file:rounded-lg file:bg-gray-800 file:text-white file:cursor-pointer"
              />
            </div>

            {/* Trailer Video Section */}
            <div className="form-section">
              <label className="text-sm font-semibold text-black mb-4">
                Change Trailer Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setTrailerVideo(e.target.files[0])}
                className="block w-full text-sm text-gray-400 file:py-2 file:px-4 file:border file:border-gray-700 file:rounded-lg file:bg-gray-800 file:text-white file:cursor-pointer"
              />
            </div>

            {/* Current Categories Section */}
            <div className="form-section mb-4">
              <h4 className="text-sm font-semibold text-black mb-4">
                Current Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCategoriesDisplay}
                
              </div>
            </div>

            {/* Select Other Categories Section */}
            <div className="form-section  rounded-lg ">
              <h4 className="text-sm font-semibold text-black">
                Select Other Categories
              </h4>
              <p className="text-gray-400 mb-4">
                Tick the boxes to add or remove categories
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherCategoriesCheckboxes}
              </div>
            </div>

            {/* Button Section */}
            <div className="flex justify-start">
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700 mt-8"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </ScrollShadow>
      )}
    </div>
  );
};

export default UpdateGame;

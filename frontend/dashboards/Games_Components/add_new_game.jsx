import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Progress,
  Input,
  Button,
  Textarea,
  Select,
  SelectItem,
  ScrollShadow,
} from "@nextui-org/react";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import { Label } from "recharts";

const UploadGame = ({ FunctionToCallAfterUpload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ageGroup, setAgeGroup] = useState(""); // New state for AgeGroup
  const [playLink, setPlayLink] = useState(""); // New state for PlayLink
  const [isLoading, setLoading] = useState(false); // Loading state

  // Fixed categories list
  const categoriesList = [
    { _id: "Action", categoryName: "Action ⚔️" },
    { _id: "Adventure", categoryName: "Adventure 🐾" },
    { _id: "Racing", categoryName: "Racing 🏎️" },
    { _id: "Puzzle", categoryName: "Puzzle 🧩" },
    { _id: "Fighting", categoryName: "Fighting 🥷🏻" },
    { _id: "Strategy", categoryName: "Strategy 🙄" },
    { _id: "Sport", categoryName: "Sport 🏅" },
  ];

  // Fixed age groups list
  const ageGroups = [
    { value: "Everyone", label: "Everyone" },
    { value: "Teen", label: "Teen" },
    { value: "Mature", label: "Mature" },
  ];

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "image") {
      setImage(files[0]);
    } else if (name === "video") {
      setVideo(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const formData = new FormData();
    formData.append("title", title);
    formData.append("Description", description);
    formData.append("image", image);
    formData.append("video", video);
    formData.append("Genre", selectedCategories);
    formData.append("AgeGroup", ageGroup);
    formData.append("PlayLink", playLink); // Add PlayLink to formData

    try {
      const response = await axios.post(
        "http://localhost:8098/games/uploadGame",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        // Handle success
        toast.success("Game Added Successfully", {
          style: { fontFamily: "Rubik" },
        });
        if (FunctionToCallAfterUpload) {
          FunctionToCallAfterUpload();
        }
        setTitle("");
        setDescription("");
        setImage(null);
        setVideo(null);
        setSelectedCategories([]);
        setAgeGroup(""); // Reset AgeGroup
        setPlayLink(""); // Reset PlayLink
      } else {
        // Handle unexpected response
        toast.error("Unexpected server response");
      }
    } catch (error) {
      console.error("Error uploading game:", error);
      toast.error("Error uploading game:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      {isLoading ? (
        <Progress
          label="Uploading..."
          size="md"
          isIndeterminate
          aria-label="Loading..."
          className="max-w-md"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <ScrollShadow className="w-[480px] h-[400px]" >
            <div>
              <Input
                label="Enter Game Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                size="lg"
                className="mb-4 w-[400px]"
              />
            </div>
            <div>
              <Textarea
                label="Enter About The Game (max 390)"
                variant="bordered"
                placeholder="About the game"
                disableAnimation
                maxLength={390}
                size="lg"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mb-4 w-[400px]"
              ></Textarea>
            </div>
            <div>
              <CheckboxGroup
                value={selectedCategories}
                onChange={setSelectedCategories}
                label="Select categories"
                className="mb-4 ml-2"
              >
                {categoriesList.map((cat) => (
                  <Checkbox key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>
            <div className="mb-4">
              <label>Upload Cover Image</label>
              <input
                label="Cover image"
                labelPlacement="outside-left"
                type="file"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                required
              />
            </div>
            <div className="mb-8">
            <label>Upload Trailer Video</label>
              <input
                label="Trailer Video"
                labelPlacement="outside-left"
                type="file"
                name="video"
                onChange={handleFileChange}
                accept="video/*"
                required
              />
            </div>
            <div>
              <Select
                label="Select Age Group"
                value={ageGroup}
                onChange={setAgeGroup}
                required
                className="mb-4 w-[300px]"
                
              >
                {ageGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value} className="font-primaryRegular">
                    {group.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Input
                label="Enter Hosting Link"
                type="text"
                value={playLink}
                onChange={(e) => setPlayLink(e.target.value)}
                required
                className="mb-4 w-[400px]"
                
              />
            </div>
            <div>
              <Button
                type="submit"
                
                color="primary"
                size="lg"
              >
                Upload Game
              </Button>
            </div>
          </ScrollShadow>
        </form>
      )}
    </div>
  );
};

export default UploadGame;

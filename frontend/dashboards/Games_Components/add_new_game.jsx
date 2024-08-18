import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Progress, Input, Button, Textarea, Select, SelectItem } from "@nextui-org/react";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";

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
    { _id: "Action", categoryName: "Action" },
    { _id: "Adventure", categoryName: "Adventure" },
    { _id: "Racing", categoryName: "Racing" },
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
          <div>
            <Input
              label="Game Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Textarea
              label="Description"
              variant="bordered"
              placeholder="About the game"
              disableAnimation
              disableAutosize
              classNames={{
                base: "max-w-xs",
                input: "resize-y min-h-[40px]",
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></Textarea>
          </div>
          <div>
            <CheckboxGroup
              value={selectedCategories}
              onChange={setSelectedCategories}
              label="Select categories"
            >
              {categoriesList.map((cat) => (
                <Checkbox key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </div>
          <div>
            <Input
              label="Cover image"
              labelPlacement="outside-left"
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
          </div>
          <div>
            <Input
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
              label="Age Group"
              value={ageGroup}
              onChange={setAgeGroup}
              required
            >
              {ageGroups.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Input
              label="Play Link"
              type="text"
              value={playLink}
              onChange={(e) => setPlayLink(e.target.value)}
              required
            />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full p-2 rounded "
              color="primary"
              size="lg"
            >
              Upload Game
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UploadGame;

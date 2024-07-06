import React, { useState } from "react";
import axios from "axios";
import { toast, Flip } from "react-toastify";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";

const AddNewStock = ({ gameForTheStock ,callBackFunction}) => {
  // State Variables
  const [game] = useState(gameForTheStock);
  const [title] = useState(gameForTheStock.title);
  const [platform, setPlatform] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [edition, setEdition] = useState("");
  const [discount, setDiscount] = useState("");

  // Arrays for platform and edition options
  const platforms = ["Windows", "PS5", "Xbox", "Nintendo"];
  const editions = ["Standard", "Gold", "Ultimate"];

  const handleAddNewStock = async (e) => {
    e.preventDefault();
    try {
      const newStock = {
        Platform: platform,
        Edition: edition,
        NumberOfUnits: quantity,
        UnitPrice: price,
        discount: discount,
        AssignedGame: game._id,
      };

      console.log("New Stock Data:", newStock); // Log new stock data for debugging

      const response = await axios.post(
        `http://localhost:8098/gameStocks/createGameStock`,
        newStock
      );

      if (response.status === 201) {
        toast.success(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        if(callBackFunction)
          {
            callBackFunction();
          }
      } else if (response.status === 400 || response.status === 405) {
        toast.error(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.warning(error.response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response received from server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Error adding new stock.");
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleAddNewStock} className="space-y-4">
        <div className="form-group space-y-4">
          <Input
            type="text"
            value={title}
            label="Game"
            readOnly
            className="w-full"
          />
          <div className="w-full">
            <Select
              label="Select Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="font-primaryRegular"
            >
              {platforms.map((platformOption) => (
                <SelectItem
                  key={platformOption}
                  value={platformOption}
                  className="font-primaryRegular"
                >
                  {platformOption}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="w-full">
            <Select
              label="Select Edition"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="font-primaryRegular"
            >
              {editions.map((editionOption) => (
                <SelectItem
                  key={editionOption}
                  value={editionOption}
                  className="font-primaryRegular"
                >
                  {editionOption}
                </SelectItem>
              ))}
            </Select>
          </div>
          <Input
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full"
          />
          <Input
            type="number"
            label="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full"
            placeholder="0.00"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">$</span>
              </div>
            }
          />
          <Input
            type="number"
            label="Discount"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full"
          />

          <Button type="submit" color="primary" size="lg" className="mt-4">
            Add New Stock
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewStock;

import React, { useState } from "react";
import axios from "axios";
import { toast, Flip } from "react-toastify";
import { Input, Button, Chip } from "@nextui-org/react";
import { Image } from "@nextui-org/react";

const AddNewStock = ({ gameForTheStock, callBackFunction }) => {
  // State Variables
  const [game] = useState(gameForTheStock);
  const [title] = useState(gameForTheStock.title);
  const [cover] = useState(gameForTheStock.coverPhoto);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState("");

  const handleAddNewStock = async (e) => {
    e.preventDefault();
    try {
      const newStock = {
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
        if (callBackFunction) {
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
          <Chip color="primary" size="sm" radius="none">
            {title}
          </Chip>
          <Image
            isZoomed
            width={100}
            alt="Game Cover Photo"
            src={cover}
            className="rounded-lg shadow-md"
          />
          <p className="text-sm text-pink-500 border border-pink-500 p-2 rounded">
            Set price and discount to publish the game. <br />
            After publishing, the game will appear in the shop.
          </p>

          <Input
            type="number"
            label="SET PRICE FOR THE GAME"
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
            label="ADD DISCOUNT"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full"
          />
          <Button
            type="submit"
            color="primary"
            size="md"
            className="mt-8 text-center"
          >
            Publish
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewStock;

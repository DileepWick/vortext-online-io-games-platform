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
  const [price, setPrice] = useState(0.1); // Initial price set to 0.1
  const [discount, setDiscount] = useState(0); // Initial discount set to 0
  
  // Ensure the price is always >= 0.1
  const handlePriceInput = (e) => {
    const inputValue = Number(e.target.value);
    if (inputValue >= 0.1 || e.target.value === "") {
      setPrice(inputValue);
    }
  };

  // Ensure the discount is always between 0 and 100
  const handleDiscountInput = (e) => {
    const inputValue = Number(e.target.value);
    if (inputValue >= 0 && inputValue <= 100 || e.target.value === "") {
      setDiscount(inputValue);
    }
  };

  const handleAddNewStock = async (e) => {
    e.preventDefault();

    try {
      const newStock = {
        UnitPrice: price,
        discount: discount,
        AssignedGame: game._id,
      };

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
      } else {
        toast.error(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
    } catch (error) {
      if (error.response) {
        toast.warning(error.response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } else if (error.request) {
        toast.error("No response received from server.");
      } else {
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
            onInput={handlePriceInput} // Restricts price entry
            className="w-full"
            placeholder="0.1"
            min={0.1}
            step={0.01}
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
            onInput={handleDiscountInput} // Restricts discount entry
            className="w-full"
            min={0}
            max={100}
            step={1}
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

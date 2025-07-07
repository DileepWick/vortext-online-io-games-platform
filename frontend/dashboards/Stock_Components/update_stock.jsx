import { Chip, Tooltip } from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  useDisclosure,
  Button,
} from "@nextui-org/react";

import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../src/utils/getAPI";

export const update_stock = ({ updatingStock, callBackFunction }) => {
  // State variables
  const [newPrice, setNewPrice] = useState(updatingStock.UnitPrice); // Set default value to the current price
  const [newDiscount, setNewDiscount] = useState(updatingStock.discount); // Set default value to the current discount

  // Modal
  const {
    isOpen: isPricingModalOpen,
    onOpen: onPricingModalOpen,
    onClose: onPricingModalClose,
  } = useDisclosure();

  // Input Restrictions
  const handlePriceInput = (e) => {
    const inputValue = Number(e.target.value);
    if (inputValue >= 0.1 || e.target.value === "") {
      setNewPrice(inputValue);
    }
  };

  const handleDiscountInput = (e) => {
    const inputValue = Number(e.target.value);
    if ((inputValue >= 0 && inputValue <= 100) || e.target.value === "") {
      setNewDiscount(inputValue);
    }
  };

  // Update Stock Function
  const updateStock = async (e) => {
    e.preventDefault();

    const newPricing = {
      UnitPrice: newPrice,
      discount: newDiscount,
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/gameStocks/updateGameStock/${updatingStock._id}`,
        newPricing
      );

      if (response.status === 200) {
        toast.success(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        callBackFunction();
        onPricingModalClose();
      } else if (response.status === 400 || response.status === 404) {
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

    // Set values to null after
    setNewDiscount(updatingStock.discount);
    setNewPrice(updatingStock.UnitPrice);
  };

  // Handle Pricing Button
  const handlePricingButton = function () {
    onPricingModalOpen();
  };

  return (
    <div>
      <Tooltip
        content="Set Pricings"
        showArrow
        color="warning"
        className="font-primaryRegular"
        placement="top-end"
      >
        <Button
          color="warning"
          variant="bordered"
          onClick={handlePricingButton}
          size="sm"
        >
          Pricing $
        </Button>
      </Tooltip>
      {/* Modal */}
      <Modal
        isOpen={isPricingModalOpen}
        onOpenChange={onPricingModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular text-black">
          <ModalHeader>
            Edit Pricings For{" "}
            <span className="text-customPink ml-2">
              {updatingStock.AssignedGame.title}
            </span>
          </ModalHeader>
          <ModalBody className="p-4">
            <form onSubmit={updateStock}>
              <p>Current Price {updatingStock.UnitPrice}$</p>
              <Input
                label="New Price"
                type="number"
                value={newPrice}
                onInput={handlePriceInput} // Restrict input for price
                min={0.1}
                step={0.01}
              />
              <br />
              <p>Current Discount {updatingStock.discount}%</p>
              <Input
                label="New Discount"
                type="number"
                value={newDiscount}
                onInput={handleDiscountInput} // Restrict input for discount
                min={0}
                max={100}
                step={1}
              />
              <br />
              <Button type="submit" color="primary">
                Save Changes
              </Button>
              <br />
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default update_stock;

import { Chip, Tooltip } from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import { EditIcon } from "../../src/assets/icons/EditIcon";
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

export const update_stock = ({ updatingStock, callBackFunction }) => {
  // State variables
  const [newPrice, setNewPrice] = useState();
  const [newDiscount, setNewDiscount] = useState();

  // Modal
  const {
    isOpen: isPricingModalOpen,
    onOpen: onPricingModalOpen,
    onClose: onPricingModalClose,
  } = useDisclosure();

  // Update Stock Function
  const updateStock = async (e) => {
    e.preventDefault();

    const newPricing = {
      UnitPrice: newPrice,
      discount: newDiscount,
    };

    try {
      const response = await axios.put(
        `http://localhost:8098/gameStocks/updateGameStock/${updatingStock._id}`,
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

    // Set values to null after
    setNewDiscount();
    setNewPrice();
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
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Edit Pricings For <span className="text-customPink ml-2">{updatingStock.AssignedGame.title}</span></ModalHeader>
          <ModalBody className="p-4">
            
            <form onSubmit={updateStock}>
              <p>Current Price {updatingStock.UnitPrice}$</p>
              <Input
                label="New Price"
                type="Number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              ></Input>
              <br></br>
              <p>Current Discount {updatingStock.discount}%</p>
              <Input
                label="New Discount"
                type="Number"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
              ></Input>
              <br></br>
              <Button type="submit" color="primary">
                Save Changes
              </Button>
              <br></br>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default update_stock;

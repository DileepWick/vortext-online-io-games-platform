
import { toast, Flip } from "react-toastify";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Chip,
  Input,
  useDisclosure,
  Button,
} from "@nextui-org/react";

import React, { useState } from "react";
import axios from "axios";


const Restock = ({ stockForRestock, callBackFunction }) => {
  // State variables
  const [restockValue, setRestockValue] = useState();

  // Restock Modal
  const {
    isOpen: isRestockModalOpen,
    onOpen: onRestockModalOpen,
    onClose: onRestockModalClose,
  } = useDisclosure();

  // Restock function
  const reStock = async (e) => {
    e.preventDefault();

    const RestockBody = {
      NumberOfUnits: restockValue,
    };

    try {
      const response = await axios.put(
        `http://localhost:8098/gameStocks/restockGameStock/${stockForRestock._id}`,
        RestockBody
      );

      if (response.status === 200) {
        toast.success(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });

        onRestockModalClose();
        callBackFunction();

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

    setRestockValue();
  };

  // Handle Restock Button
  const handleRestock = () => {
    onRestockModalOpen();
  };

  return (
    <div>
      <Button variant="ghost" size="sm" color="primary" onClick={handleRestock}>
        Restock
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onOpenChange={onRestockModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Restocking</ModalHeader>
          <ModalBody>
            <form onSubmit={reStock}>
            Current Stock <Chip color="success" variant="bordered">{stockForRestock.NumberOfUnits}</Chip>
            <br></br><br></br>
              <Input
                label="Number of units"
                value={restockValue}
                onChange={(e) => setRestockValue(Number(e.target.value))}
                type="number"
                min="0"
              />
              <br />
              <Button type="submit" color="primary">Update</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Restock;

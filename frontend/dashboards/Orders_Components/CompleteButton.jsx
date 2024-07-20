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

const CompleteOrderButton = ({ order, callBackFunction }) => {
  // State variable for order token
  const [orderTokenValue, setOrderTokenValue] = useState("");

  // Modal handlers
  const {
    isOpen: isCompleteOrderModalOpen,
    onOpen: onCompleteOrderModalOpen,
    onClose: onCompleteOrderModalClose,
  } = useDisclosure();

  // Complete Order function
  const completeOrder = async (e) => {
    e.preventDefault();

    const completeOrderBody = {
      token: orderTokenValue,
    };

    try {
      const response = await axios.put(
        `http://localhost:8098/orders/completeOrder/${order._id}`,
        completeOrderBody
      );

      if (response.status === 200) {
        toast.success(response.data.message, {
          theme: "light",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });

        onCompleteOrderModalClose();
        callBackFunction();

      } else if (response.status === 400 || response.status === 404) {
        toast.error(response.data.message, {
          theme: "light",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
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
        toast.error("Error completing the order.");
        console.error("Error:", error.message);
      }
    }

    setOrderTokenValue("");
  };

  // Handle Complete Order Button
  const handleCompleteOrder = () => {
    onCompleteOrderModalOpen();
  };

  return (
    <div>
      <Button variant="ghost" size="sm" color="primary" onClick={handleCompleteOrder}>
        Complete Order
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isCompleteOrderModalOpen}
        onOpenChange={onCompleteOrderModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Complete Order</ModalHeader>
          <ModalBody>
            <form onSubmit={completeOrder}>
              <Input
                label="Enter Token"
                value={orderTokenValue}
                onChange={(e) => setOrderTokenValue(e.target.value)}
                type="text"
              />
              <br />
              <Button type="submit" color="primary">Complete</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CompleteOrderButton;

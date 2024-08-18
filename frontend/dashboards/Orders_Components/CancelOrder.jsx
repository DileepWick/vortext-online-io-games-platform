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

const CancelOrder = ({ orderForCancellation, callBackFunction }) => {
  // State variables
  const [cancellationReason, setCancellationReason] = useState("");

  // Cancellation Modal
  const {
    isOpen: isCancellationModalOpen,
    onOpen: onCancellationModalOpen,
    onClose: onCancellationModalClose,
  } = useDisclosure();

  // Cancel order function
  const cancelOrder = async (e) => {
    e.preventDefault();

    const cancellationBody = {
      reason: cancellationReason,
    };

    try {
      const response = await axios.put(
        `http://localhost:8098/orders/cancelOrder/${orderForCancellation._id}`,
        cancellationBody
      );

      if (response.status === 200) {
        toast.success(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });

        onCancellationModalClose();
        callBackFunction();

      } else if (response.status === 404 || response.status === 500) {
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
        toast.error("Error canceling order.");
        console.error("Error:", error.message);
      }
    }

    setCancellationReason("");
  };

  // Handle Cancel Button
  const handleCancel = () => {
    onCancellationModalOpen();
  };

  return (
    <div>
      <Button variant="ghost" size="lg" color="danger" onClick={handleCancel}>
        Cancel
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isCancellationModalOpen}
        onOpenChange={onCancellationModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Order Cancellation</ModalHeader>
          <ModalBody>
            <form onSubmit={cancelOrder}>
              <Input
                label="Reason for cancellation"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                type="text"
                required
              />
              <br />
              <Button type="submit" color="primary">Cancel Order</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CancelOrder;

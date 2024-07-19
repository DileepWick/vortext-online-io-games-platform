import { Tooltip } from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import axios from "axios"; // Import axios
import React from "react";

const ApproveOrder = ({ approvingOrder, callBackFunction }) => {
  // Approve Modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Approve function
  const approveOrder = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8098/orders/approveOrder/${approvingOrder._id}`
      );

      if (response.status === 200) {
        toast.success(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        onClose();
      } else {
        toast.error(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
      callBackFunction();
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
        toast.error("Error approving the order.");
        console.error("Error:", error.message);
      }
    }
  };

  // Handle Approve Button
  const handleApprove = () => {
    onOpen();
  };

  return (
    <div>
      <Button onClick={handleApprove} size="sm" color="success" variant="bordered">Approve</Button>

      {/* Modal  */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Confirm Approval</ModalHeader>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" onClick={approveOrder}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ApproveOrder;

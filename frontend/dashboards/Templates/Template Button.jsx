import { DeleteIcon } from "../../src/assets/icons/DeleteIcon";
import { Tooltip } from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@nextui-org/react";

import React from "react";
import axios from "axios";

const delete_Template = ({ deletingObject, callBackFunction }) => {
  //Delete Modal
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  //Delete function
  const deleteStock = async (req, res) => {
    try {
      const DeletionStatus = await axios.delete(
        `eg- localhost/1212/deleteBook${deletingObject._id}`
      );

      if (response.status === 400) {
        toast.success(DeletionStatus.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });

        onDeleteModalClose();
      } else if (response.status === 400 || response.status === 404) {
        toast.error(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
      callBackFunction();
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

  

  //Handle Delete Button
  const handleDelete = function () {
    onDeleteModalOpen();
  };

  return (
    <div>
      <Tooltip
        content="Remove stock"
        showArrow
        color="danger"
        className="font-primaryRegular"
        placement="top-start"
      >
        <span
          className="text-lg text-default-400 cursor-pointer active:opacity-20"
          onClick={() => handleDelete()}
        >
          <DeleteIcon />
        </span>
      </Tooltip>
      {/* Modal  */}
      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onDeleteModalClose}>
              Cancel
            </Button>
            <Button color="primary" onClick={deleteStock}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default delete_Template;

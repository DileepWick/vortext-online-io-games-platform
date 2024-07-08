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

      if (DeletionStatus.data) {
        toast.success(DeletionStatus.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });

        onDeleteModalClose();
      } else {
        onDeleteModalClose();
        toast.error("Error Message");
      }
      callBackFunction();
    } catch (error) {
        console.log(error);
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
      {/* Delete Game  */}
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

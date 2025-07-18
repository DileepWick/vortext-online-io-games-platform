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
import { API_BASE_URL } from "../../src/utils/getAPI";

const delete_stock = ({ deletingStock, callBackFunction }) => {
  //Delete Stock
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  //Delete Stock function
  const deleteStock = async (req, res) => {
    try {
      const DeletionStatus = await axios.delete(
        `${API_BASE_URL}/gameStocks/deleteGameStock/${deletingStock._id}`
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
        toast.error("Game Stock Not Deleted");
      }
      callBackFunction();
    } catch (error) {}
  };

  //Handle Delete Button
  const handleDelete = function () {
    onDeleteModalOpen();
  };

  return (
    <div>
      <Tooltip
        content="Remove from shop"
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
        size="small"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
        className="text-black p-4"
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>
            Confirm Removal Of {deletingStock.AssignedGame.title} From Shop
          </ModalHeader>
          <ModalFooter>
            <Button color="primary" onClick={deleteStock}>
              Confirm
            </Button>
            <Button color="danger" variant="ghost" onPress={onDeleteModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default delete_stock;

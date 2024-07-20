import { Tooltip } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Textarea,
} from "@nextui-org/react";

import React from "react";
import { EyeIcon } from "../../src/assets/icons/EyeIcon";

const ViewReason = ({ order }) => {
  // View Order Details Modal
  const {
    isOpen: isOrderModalOpen,
    onOpen: onOrderModalOpen,
    onClose: onOrderModalClose,
  } = useDisclosure();

  // Handle View Button
  const handleView = () => {
    onOrderModalOpen();
  };

  return (
    <div>
      <Tooltip
        content="View details"
        showArrow
        color="primary"
        className="font-primaryRegular"
        placement="top-start"
      >
        <Button
          size="sm"
          variant="bordered"
          color="default"
          onClick={handleView}
        >
          VIEW
          <EyeIcon />
        </Button>
      </Tooltip>
      {/* Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onOpenChange={onOrderModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Cancellation Reason</ModalHeader>
          <ModalBody>
            <Textarea
              isReadOnly
              variant="bordered"
              labelPlacement="outside"
              defaultValue={order.cancellationReason}
              className="max-w-xs"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={onOrderModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewReason;

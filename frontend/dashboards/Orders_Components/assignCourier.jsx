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
  User,
  Select,
  SelectItem,
  Avatar,
  Chip
} from "@nextui-org/react";

import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignCourier = ({
  AssigningOrder,
  callBackFunction,
  ReleventRegion,
}) => {
  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose,
  } = useDisclosure();

  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("");

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/users/couriers/${ReleventRegion}`
        );
        setCouriers(response.data.couriers);
      } catch (error) {
        toast.error("Error fetching couriers.");
      }
    };

    if (AssigningOrder && AssigningOrder.region) {
      fetchCouriers();
    } else {
      console.error("AssigningOrder or AssigningOrder.region is not defined.");
    }
  }, [AssigningOrder]);

  const handleAssignCourier = async () => {
    try {
      const assignStatus = await axios.put(
        `http://localhost:8098/orders/assignCourier/${AssigningOrder._id}`,
        {
          courierId: selectedCourier,
        }
      );

      if (assignStatus.status === 200) {
        toast.success(assignStatus.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        onAssignModalClose();
        callBackFunction();
      } else {
        toast.error(assignStatus.data.message, {
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
        toast.error("Error assigning courier.");
        console.error("Error:", error.message);
      }
    }
  };

  const handleAssign = () => {
    onAssignModalOpen();
  };

  return (
    <div>
      <Button
        onClick={handleAssign}
        size="sm"
        color="primary"
        variant="bordered"
      >
        Assign Courier
      </Button>

      <Modal
        isOpen={isAssignModalOpen}
        onOpenChange={onAssignModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Available Couriers</ModalHeader>
          <ModalBody>
            {couriers.length === 0 ? (
              <p>No couriers available</p>
            ) : (
              <Select
                placeholder="Select a courier"
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
                className="font-primaryRegular"
                label="Assigned to"
                labelPlacement="outside"
              >
                {couriers.map((courier) => (
                  <SelectItem key={courier._id} textValue={courier.username}>
                    <div className="flex gap-2 items-center font-primaryRegular">
                      <Avatar
                        alt={courier.username}
                        className="flex-shrink-0"
                        size="sm"
                        src={courier.profilePic}
                      />
                      
                      <div className="flex flex-col">
                        <span className="text-small">{courier.username}</span>
                        
                        <span className="text-tiny text-default-400">
                          {courier.email}
                        </span>
                      </div>
                      <Chip color="success" variant="dot">Available</Chip>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onAssignModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleAssignCourier}
              disabled={couriers.length === 0}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AssignCourier;

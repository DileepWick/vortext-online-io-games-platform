import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Input,
} from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import { EyeIcon } from "../../assets/icons/EyeIcon";
import { Card, CardBody, Chip } from "@nextui-org/react";

const View_Products = ({ orderObject }) => {
  const {
    isOpen: isViewModalOpen,
    onOpen: onViewModalOpen,
    onClose: onViewModalClose,
  } = useDisclosure();
  const [orderItems, setOrderItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrderItems = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8098/orderItems/order/${orderId}`
      );
      setOrderItems(response.data);
      setFilteredItems(response.data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Error fetching order items"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isViewModalOpen) {
      fetchOrderItems(orderObject._id);
    }
  }, [isViewModalOpen]);

  useEffect(() => {
    const filtered = orderItems.filter((item) =>
      item.stockid.AssignedGame.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, orderItems]);

  const handleViewProducts = () => {
    onViewModalOpen();
  };

  return (
    <div>
      <Button
        onClick={handleViewProducts}
        variant="flat"
        color="default"
        size="lg"
        
      >
        View Products <EyeIcon />
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onOpenChange={onViewModalClose}
        size="5xl"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular bg-customDark">
          <ModalHeader className="text-white text-2xl">
            Order Products
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[500px]" // Adjust the width as needed
                  classNames={{
                    label: "text-white",
                    input: "bg-customDark text-white",
                    innerWrapper: "bg-customDark",
                    inputWrapper: "bg-customDark",
                  }}
                  variant="bordered"
                  label=" Search Products..."
                  size="sm"
                />

                {filteredItems.length > 0 ? (
                  <ScrollShadow
                    hideScrollBar
                    className="w-full h-[500px] bg-customDark overflow-auto"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                      {filteredItems.map((item) => (
                        <Card
                          key={item.stockid._id}
                          className="relative bg-customDark"
                        >
                          <div className="flex flex-col items-center">
                            <Image
                              isBlurred
                              radius="none"
                              removeWrapper
                              alt={item.stockid.AssignedGame.title}
                              className="w-[300px] h-[320px] object-cover rounded-t-lg"
                              src={item.stockid.AssignedGame.coverPhoto}
                            />
                            <CardBody className="p-4 text-white">
                              <p className="text-editionColor font-primaryRegular text-sm">
                                {item.stockid.Edition} Edition
                              </p>
                              <h2 className="text-xl font-primaryRegular text-white mb-2">
                                {item.stockid.AssignedGame.title}
                              </h2>
                              <h2 className="text-md font-primaryRegular text-white mb-2">
                                LKR {item.stockid.UnitPrice}
                              </h2>
                              {item.stockid.discount > 0 && (
                                <div className="mb-2">
                                  <Chip
                                    color="primary"
                                    radius="none"
                                    className="font-primaryRegular mr-2"
                                    size="sm"
                                  >
                                    {item.stockid.discount}% off
                                  </Chip>
                                </div>
                              )}
                              <div className="mb-2">
                                <span className="mr-2">Number Of Copies</span>
                                <Chip
                                  color="primary"
                                  className="font-primaryRegular"
                                  size="sm"
                                >
                                  {item.quantity}
                                </Chip>
                              </div>
                              <div className="flex flex-wrap gap-2 text-white">
                                {item.stockid.AssignedGame.Genre.flatMap(
                                  (genre) =>
                                    genre.includes(",")
                                      ? genre.split(",")
                                      : genre
                                ).map((genre, index) => (
                                  <Chip
                                    key={index}
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    radius="none"
                                    className="font-primaryRegular text-white"
                                  >
                                    {genre.trim()}
                                  </Chip>
                                ))}
                              </div>
                            </CardBody>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollShadow>
                ) : (
                  <p>No items found for this order.</p>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onViewModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default View_Products;

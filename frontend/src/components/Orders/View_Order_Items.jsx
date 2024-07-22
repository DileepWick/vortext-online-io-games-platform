import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Pagination,
} from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import { EyeIcon } from "../../assets/icons/EyeIcon";

const View_Products = ({ orderObject }) => {
  const {
    isOpen: isViewModalOpen,
    onOpen: onViewModalOpen,
    onClose: onViewModalClose,
  } = useDisclosure();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 2;

  const fetchOrderItems = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8098/orderItems/order/${orderId}`
      );
      setOrderItems(response.data);
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

  const handleViewProducts = () => {
    onViewModalOpen();
  };

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return orderItems.slice(start, end);
  }, [page, orderItems]);

  return (
    <div>
      <Button onClick={handleViewProducts} variant="ghost" color="default" size="sm">
        View Products <EyeIcon />
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onOpenChange={onViewModalClose}
        size="full"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular">
          <ModalHeader>Order Products</ModalHeader>
          <ModalBody>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : orderItems.length > 0 ? (
              <>
                <Table
                  isHeaderSticky
                  aria-label="Example table with client side pagination"
                  className="font-primaryRegular"
                  bottomContent={
                    <div className="flex w-full justify-center font-primaryRegular">
                      <Pagination
                        isCompact
                        loop
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={Math.ceil(orderItems.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                  classNames={{
                    wrapper: "min-h-[222px]",
                  }}
                >
                  <TableHeader>
                    <TableColumn>PRODUCT</TableColumn>
                    <TableColumn>COVER</TableColumn>
                    <TableColumn>PLATFORM</TableColumn>
                    <TableColumn>PRICE</TableColumn>
                    <TableColumn>DISCOUNT</TableColumn>
                    <TableColumn>QUANTITY</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.stockid.AssignedGame.title}</TableCell>
                        <TableCell>
                          <Image
                            width={100}
                            height={100}
                            radius="none"
                            src={item.stockid.AssignedGame.coverPhoto}
                            fallbackSrc="https://via.placeholder.com/300x200"
                            alt="NextUI Image with fallback"
                          />
                          
                        </TableCell>
                        <TableCell>{item.stockid.Platform}</TableCell>
                        <TableCell>
                          {item.stockid.UnitPrice !== undefined
                            ? `$${item.stockid.UnitPrice}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{item.stockid.discount}%</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p>No items found for this order.</p>
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

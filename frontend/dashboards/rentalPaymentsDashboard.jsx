import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  User,
  Chip,
} from "@nextui-org/react";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../src/utils/getAPI";
const DEVELOPER_SHARE_PERCENTAGE = 0.7; // 70% share for the developer

const RentalPaymentsDash = () => {
  const [rentalPayments, setRentalPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [distributedPayments, setDistributedPayments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const rowsPerPage = 7;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    fetchRentalPayments();
    fetchDistributedPayments();
  }, []);

  const fetchRentalPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rentalPayments/`);
      if (response.data && response.data.rentalPayments) {
        setRentalPayments(response.data.rentalPayments);
      }
    } catch (error) {
      console.error("Error fetching rental payments:", error);
      toast.error("Failed to fetch rental payment data");
    }
  };

  const fetchDistributedPayments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/distributed-payments/all`
      );
      const distributedPayments = response.data.reduce((acc, payment) => {
        acc[payment.paymentId] = payment.amount;
        return acc;
      }, {});
      setDistributedPayments(distributedPayments);
    } catch (error) {
      console.error("Error fetching distributed payments:", error);
      toast.error("Failed to fetch distributed payments");
    }
  };

  const filteredItems = useMemo(() => {
    return rentalPayments.filter((item) =>
      item.game?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rentalPayments, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
  };

  const handleDistributePayment = (item) => {
    setSelectedItem(item);
    onOpen();
  };

  const updateDeveloperIncome = async (developerId, amount) => {
    try {
      const updateResponse = await axios.put(
        `${API_BASE_URL}/users/update-income/${developerId}`,
        { saleAmount: amount }
      );
      return updateResponse.data;
    } catch (error) {
      console.error("Error updating developer income:", error);
      throw error;
    }
  };

  const saveDistributedPayment = async (paymentId, developerId, amount) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/distributed-payments/save`,
        {
          paymentId,
          developerId,
          amount,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error saving distributed payment:", error);
      throw error;
    }
  };

  const handleDistribute = async () => {
    if (selectedItem) {
      setIsLoading(true);
      try {
        const saleAmount = selectedItem.amount * DEVELOPER_SHARE_PERCENTAGE;
        const developerId = selectedItem.game?.developer?._id;

        if (!developerId) {
          throw new Error("Developer ID not found");
        }

        await updateDeveloperIncome(developerId, saleAmount);
        await saveDistributedPayment(selectedItem._id, developerId, saleAmount);

        setDistributedPayments((prev) => ({
          ...prev,
          [selectedItem._id]: saleAmount,
        }));

        toast.success("Payment distributed successfully");
        onOpenChange(false);
      } catch (error) {
        console.error("Error distributing payment:", error);
        toast.error(`Failed to distribute payment: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <Input
        className="ml-2 font-primaryRegular w-48 sm:w-64"
        placeholder="Search by GAME . . ."
        startContent={<SearchIcon />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <Table
        isHeaderSticky
        aria-label="Rental Payments table with client-side pagination"
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
              total={Math.ceil(filteredItems.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="GAME">GAME</TableColumn>
          <TableColumn key="CUSTOMER">CUSTOMER</TableColumn>
          <TableColumn key="AMOUNT">AMOUNT (LKR)</TableColumn>
          <TableColumn key="DATE">DATE</TableColumn>
          <TableColumn key="DEVELOPER">DEVELOPER</TableColumn>
          <TableColumn key="DEVFUNDS">DevFUNDS (70%)</TableColumn>
          <TableColumn key="ACTIVE">ACTIVE STATUS</TableColumn>
          <TableColumn key="ACTIONS">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody className="text-black">
          {paginatedItems.map((item) => (
            <TableRow key={item._id} className="text-black">
              <TableCell>{item.game?.title || "N/A"}</TableCell>
              <TableCell>
                <User
                  name={item.user?.username || "N/A"}
                  description={item.user?.email || "N/A"}
                  avatarProps={{
                    src: item.user?.profilePic,
                  }}
                />
              </TableCell>
              <TableCell>Rs.{item.amount?.toFixed(2) || "N/A"}</TableCell>
              <TableCell>
                {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
              </TableCell>
              <TableCell>
                <User
                  name={item.game?.developer?.username || "N/A"}
                  description={item.game?.developer?.email || "N/A"}
                  avatarProps={{
                    src: item.game?.developer?.profilePic || "N/A",
                  }}
                />
              </TableCell>
              <TableCell>
                {distributedPayments[item._id] ? (
                  <span style={{ color: "#00008B" }}>
                    Rs.{distributedPayments[item._id].toFixed(2)}
                  </span>
                ) : (
                  <span style={{ color: "red" }}>Not Paid Yet</span>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  color={item.rental?._id ? "success" : "warning"}
                  variant="flat"
                >
                  {item.rental?._id ? "Active" : "Expired"}
                </Chip>
              </TableCell>
              <TableCell>
                {distributedPayments[item._id] ? (
                  <Tooltip
                    content="Payment already distributed"
                    className="text-yellow-500"
                  >
                    <span className="text-green-500">Done</span>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    color="danger"
                    onPress={() => handleDistributePayment(item)}
                  >
                    Distribute Payment
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent className="text-black">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Distribute Payment
              </ModalHeader>
              <ModalBody>
                {selectedItem && (
                  <div>
                    <p>
                      You are about to distribute payment of Rs.
                      {(
                        selectedItem.amount * DEVELOPER_SHARE_PERCENTAGE
                      ).toFixed(2)}{" "}
                      to {selectedItem.game?.developer?.username}
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isLoading}
                  onPress={handleDistribute}
                >
                  Distribute Payment
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RentalPaymentsDash;

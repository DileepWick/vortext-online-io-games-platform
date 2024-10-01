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
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8098";

const AllPayments = () => {
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [distributedPayments, setDistributedPayments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const rowsPerPage = 7;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchTableData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orderItems`);
      if (response.data && response.data.orderHistory) {
        setTableData(response.data.orderHistory);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch payment data");
    }
  };

  useEffect(() => {
    fetchTableData();

    // Load distributed payments from local storage
    const storedPayments = localStorage.getItem("distributedPayments");
    if (storedPayments) {
      setDistributedPayments(JSON.parse(storedPayments));
    }
  }, []);

  const filteredItems = useMemo(() => {
    return tableData.filter((item) =>
      item.stockid?.AssignedGame?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [tableData, searchQuery]);

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
      const getDeveloperResponse = await axios.get(
        `${API_BASE_URL}/users/profile/${developerId}`
      );
      const developer = getDeveloperResponse.data;
  
      const updateResponse = await axios.put(
        `${API_BASE_URL}/users/update-income/${developerId}`,
        {
          saleAmount: amount,
        }
      );
  
      return updateResponse.data;
    } catch (error) {
      console.error("Error updating developer income:", error);
      throw error;
    }
  };

  const handleReducePrice = async () => {
    if (selectedItem) {
      setIsLoading(true);
      try {
        const saleAmount = selectedItem.order.paymentAmount * 0.7;
        const developerId = selectedItem.stockid?.AssignedGame?.developer?._id;

        if (!developerId) {
          throw new Error("Developer ID not found");
        }

        await updateDeveloperIncome(developerId, saleAmount);

        // Update distributed payments state
        setDistributedPayments((prev) => {
          const updatedPayments = { ...prev, [selectedItem._id]: saleAmount };
          // Save updated payments to local storage
          localStorage.setItem("distributedPayments", JSON.stringify(updatedPayments));
          return updatedPayments;
        });

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
        aria-label="Payment table with client-side pagination"
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
          <TableColumn key="RETAILPRICE">RETAIL PRICE</TableColumn>
          <TableColumn key="DISCOUNT">DISCOUNT</TableColumn>
          <TableColumn key="SALEPRICE">SALE PRICE</TableColumn>
          <TableColumn key="DATE">DATE</TableColumn>
          <TableColumn key="DEVELOPER">DEVELOPER</TableColumn>
          <TableColumn key="DEVFUNDS">DevFUNDS (70%)</TableColumn>
          <TableColumn key="STATUS">PAYMENT STATUS</TableColumn>
          <TableColumn key="ACTIONS">Actions</TableColumn>
        </TableHeader>
        <TableBody className="text-black">
          {paginatedItems.map((item) => (
            <TableRow key={item._id} className="text-black">
              <TableCell>{item.stockid?.AssignedGame?.title || "N/A"}</TableCell>
              <TableCell>
                <User
                  name={item.order?.user?.username || "N/A"}
                  description={item.order?.user?.email || "N/A"}
                  avatarProps={{
                    src: item.order?.user?.profilePic,
                  }}
                />
              </TableCell>
              <TableCell>Rs.{item.stockid?.UnitPrice || "N/A"}</TableCell>
              <TableCell>{item.stockid?.discount || "N/A"} %</TableCell>
              <TableCell>Rs.{item.order?.paymentAmount || "N/A"}</TableCell>
              <TableCell>
                {item.date
                  ? new Date(item.date).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <User
                  name={
                    item.stockid?.AssignedGame?.developer?.username || "N/A"
                  }
                  description={
                    item.stockid?.AssignedGame?.developer?.email || "N/A"
                  }
                  avatarProps={{
                    src:
                      item.stockid?.AssignedGame?.developer?.profilePic ||
                      "N/A",
                  }}
                />
              </TableCell>
              <TableCell>Rs.{item.order?.paymentAmount ? (item.order?.paymentAmount * 0.7).toFixed(2) : "N/A"}</TableCell>
              <TableCell>{item.paymentCompletion || "NA"}</TableCell>
              <TableCell>
                {distributedPayments[item._id] ? (
                  <Tooltip content="Payment already distributed">
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
        <ModalContent>
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
                      {(selectedItem.order?.paymentAmount * 0.7).toFixed(2)} to{" "}
                      {selectedItem.stockid?.AssignedGame?.developer?.username}
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleReducePrice}
                  isLoading={isLoading}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AllPayments;

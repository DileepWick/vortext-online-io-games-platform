import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Tooltip,
  Pagination,
} from "@nextui-org/react";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { DeleteIcon } from "../src/assets/icons/DeleteIcon";

const RentalPaymentsDash = () => {
  const [rentalPayments, setRentalPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    fetchRentalPayments();
  }, []);

  const fetchRentalPayments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8098/rentalPayments/");
      setRentalPayments(response.data.rentalPayments || []);
      setError("");
    } catch (error) {
      console.error("Error fetching rental payments:", error);
      setError("Failed to fetch rental payments. Please try again.");
      toast.error("Failed to fetch rental payments. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (payment) => {
    if (payment.rental?._id) {
      toast.error("Cannot delete an active rental payment.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this rental payment?")) {
      try {
        await axios.delete(`http://localhost:8098/rentalPayments/${payment._id}`);
        await fetchRentalPayments();
        toast.success("Rental payment deleted successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } catch (error) {
        console.error("Error deleting rental payment:", error);
        toast.error("Failed to delete rental payment. Please try again.", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
    }
  };

  const filteredItems = useMemo(() => {
    return rentalPayments.filter((payment) => {
      const searchFields = [
        payment.user?.username,
        payment.game?.title,
        payment.rental?._id ? 'active' : 'expired',
      ].filter(Boolean);
      
      const searchString = searchFields.join(' ').toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });
  }, [rentalPayments, searchQuery]);

  const items = useMemo(() => {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Rental Payments Dashboard</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          className="w-64"
          placeholder="Search payments by user..."
          startContent={<SearchIcon />}
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
        />
      </div>
      <Table
        aria-label="Rental Payments table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
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
          <TableColumn>USER</TableColumn>
          <TableColumn>GAME</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>AMOUNT (LKR)</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((payment) => (
            <TableRow key={payment._id}>
              <TableCell>
                <span className="text-blue-500 font-medium">
                  {payment.user?.username || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-green-500 font-medium">
                  {payment.game?.title || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <Chip color={payment.rental?._id ? "success" : "warning"} variant="flat">
                  {payment.rental?._id ? 'Active' : 'Expired'}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="text-primary font-medium">
                  LKR {payment.amount ? payment.amount.toFixed(2) : 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-primary font-medium">
                  {payment.date ? new Date(payment.date).toLocaleString() : 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Tooltip 
                    content={payment.rental?._id ? "Cannot delete active rental" : "Delete payment"} 
                    color={payment.rental?._id ? "default" : "danger"} 
                    className="font-primaryRegular"
                  >
                    <span
                      className={`text-lg cursor-pointer active:opacity-50 ${
                        payment.rental?._id ? "text-gray-400" : "text-danger"
                      }`}
                      onClick={() => handleDelete(payment)}
                    >
                      <DeleteIcon />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RentalPaymentsDash;
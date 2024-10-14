import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast, Flip } from "react-toastify";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Chip,
} from "@nextui-org/react";
import { SearchIcon } from "lucide-react";

const RentalHistory = () => {
  useAuthCheck();

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
      const token = getToken();
      const userId = getUserIdFromToken(token);

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const response = await axios.get(
        `http://localhost:8098/rentalPayments/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API Response:", response.data);

      setRentalPayments(response.data.userPayments || []);
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

  const filteredItems = useMemo(() => {
    return rentalPayments.filter(
      (payment) =>
        payment &&
        payment.game &&
        payment.game.title &&
        payment.game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-customDark min-h-screen font-sans text-white">
      <Header />
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-primaryRegular mb-6">
          RENTAL HISTORY
        </h1>
        <div className="flex justify-between items-center mb-4">
          <Input
            className="w-64"
            placeholder="Search by game title..."
            startContent={<SearchIcon />}
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />
        </div>
        {rentalPayments.length > 0 ? (
          <Table
            aria-label="Rental Payment History table"
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
              <TableColumn>GAME</TableColumn>
              <TableColumn>AMOUNT (LKR)</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>RENTAL STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {items.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>
                    <span className="text-primary font-medium">
                      {payment.game ? payment.game.title : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip color="success" variant="flat">
                      LKR {payment.amount.toFixed(2)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span style={{ color: "black" }}>
                      {formatDate(payment.date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={payment.rental ? "primary" : "default"}
                      variant="flat"
                    >
                      {payment.rental ? "Active" : "Expired"}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No rental payments found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RentalHistory;

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input, Link, Tabs, Tab } from "@nextui-org/react";
import { SearchIcon } from "lucide-react";

const TransactionHistory = () => {
  useAuthCheck();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("purchase");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);
        const response = await axios.get(
          `http://localhost:8098/orderItems/useOrders/${userId}`
        );
        setOrderItems(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to fetch order items.");
      }
    };

    fetchOrderItems();
  }, []);

  const filteredItems = useMemo(() => {
    return orderItems.filter((item) =>
      item.stockid.AssignedGame.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orderItems, searchQuery]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-customDark flex flex-col min-h-screen">
        <Header />
        <p className="text-center text-white font-primaryRegular text-5xl mt-[100px]">
          {error}
        </p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-customDark min-h-screen font-sans text-white">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-5xl font-primaryRegular mb-6">Transactions</h1>
        <p className="mb-4">Your account payment details, transactions, and earned Vortex Rewards.</p>
        <div className="mb-4">
          <Link href="#" className="text-blue-500 mr-4">Vortex Games Refund Policy</Link>
          <Link href="#" className="text-blue-500">Vortex FAQ</Link>
        </div>
        <Tabs
          aria-label="Transaction Tabs"
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          className="mb-6"
        >
          <Tab key="purchase" title="Purchase" />
          <Tab key="rentals" title="Rentals" />
          <Tab key="subscription" title="Refunds" />
        </Tabs>
        <Input
          className="mb-4 w-full max-w-xs"
          placeholder="Search by game title..."
          startContent={<SearchIcon />}
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Table
          aria-label="Transaction history table"
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
            <TableColumn>Date</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>UnitPrice</TableColumn>
            <TableColumn>Discount</TableColumn>
            <TableColumn>Total</TableColumn>
          </TableHeader>
          <TableBody className="text-black">
            {items.map((transaction) => (
              <TableRow key={transaction.id} className="text-black">
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.stockid.AssignedGame.title}</TableCell>
                <TableCell>Rs.{transaction.price}</TableCell>
                <TableCell>{transaction.stockid.discount}%</TableCell>
                <TableCell>Rs.{transaction.order.paymentAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Footer />
    </div>
  );
};

export default TransactionHistory;
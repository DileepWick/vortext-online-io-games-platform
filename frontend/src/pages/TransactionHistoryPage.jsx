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
import RentalTableHistory from "./RentalTableHistory";

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
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const token = getToken();
        const id = getUserIdFromToken(token);
        setUserId(id);
        const response = await axios.get(
          `http://localhost:8098/orderItems/useOrders/${id}`
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
    return <div className="text-center mt-10 text-black">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-customDark flex flex-col min-h-screen">
        <Header />
        <p className="text-center text-black font-primaryRegular text-5xl mt-[100px]">
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
       
        <Tabs
          aria-label="Transaction Tabs"
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          className="mb-6"
        >
          <Tab key="purchase" title="Purchase" />
          <Tab key="rentals" title="Rentals" />
        </Tabs>
        {activeTab === "purchase" && (
          <>
            <Input
              className="mb-4 w-full max-w-xs text-black"
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
                <TableColumn className="text-black">Cover</TableColumn>
                <TableColumn className="text-black">Date</TableColumn>
                <TableColumn className="text-black">Game</TableColumn>
                <TableColumn className="text-black">UnitPrice</TableColumn>
                <TableColumn className="text-black">Discount</TableColumn>
                <TableColumn className="text-black">Total</TableColumn>
              </TableHeader>
              <TableBody>
                {items.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <img 
                        src={transaction.stockid.AssignedGame.coverPhoto} 
                        alt={transaction.stockid.AssignedGame.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell className="text-black">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-black">{transaction.stockid.AssignedGame.title}</TableCell>
                    <TableCell className="text-black">Rs.{transaction.price}</TableCell>
                    <TableCell className="text-black">{transaction.stockid.discount}%</TableCell>
                    <TableCell className="text-black">Rs.{transaction.order.paymentAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
        {activeTab === "rentals" && userId && (
          <RentalTableHistory userId={userId} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TransactionHistory;
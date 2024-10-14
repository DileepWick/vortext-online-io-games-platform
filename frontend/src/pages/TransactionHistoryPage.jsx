import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input, Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import { SearchIcon, CreditCard, Clock } from "lucide-react";
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
    return (
      <div className="flex justify-center items-center h-screen bg-customDark">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-customDark flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <Card className="bg-red-900 border-red-700 text-red-200 p-4 rounded-lg shadow-lg">
            <CardBody>
              <p className="text-center font-primaryRegular text-2xl">{error}</p>
            </CardBody>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-customDark min-h-screen font-sans text-white">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-6xl font-primaryRegular mb-6 text-center text-purple-400">Transactions</h1>
        <p className="mb-8 text-center text-lg text-gray-300">Your account payment details, transactions, and earned Vortex Rewards.</p>
       
        <Tabs 
          aria-label="Transaction Tabs"
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          className="mb-6"
          color="secondary"
          variant="bordered"
        >
          <Tab 
            key="purchase" 
            title={
              <div className="flex items-center space-x-2">
                <CreditCard />
                <span>Purchase</span>
              </div>
            }
          />
          <Tab 
            key="rentals" 
            title={
              <div className="flex items-center space-x-2">
                <Clock />
                <span>Rentals</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === "purchase" && (
          <>
            <Input
              className="mb-6 w-full max-w-md mx-auto"
              placeholder="Search by game title..."
              startContent={<SearchIcon className="text-gray-400" />}
              value={searchQuery}
              onChange={handleSearchChange}
              size="lg"
            />
            <Card className="bg-gray-900 shadow-xl">
              <CardBody>
                <Table
                  aria-label="Transaction history table"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="secondary"
                        page={page}
                        total={Math.ceil(filteredItems.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                  classNames={{
                    wrapper: "min-h-[222px]",
                    th: "text-black font-bold", 
                    td: "text-black",  // Changing table body text color to black

                  }}
                >
                  <TableHeader>
                    <TableColumn>Cover</TableColumn>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Game</TableColumn>
                    <TableColumn>UnitPrice</TableColumn>
                    <TableColumn>Discount</TableColumn>
                    <TableColumn>Total</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {items.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-purple-900/30 transition-colors">
                        <TableCell>
                          <img 
                            src={transaction.stockid.AssignedGame.coverPhoto} 
                            alt={transaction.stockid.AssignedGame.title}
                            className="w-16 h-16 object-cover rounded-lg shadow-md hover:scale-110 transition-transform duration-200"
                          />
                        </TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold">{transaction.stockid.AssignedGame.title}</TableCell>
                        <TableCell>Rs.{transaction.price}</TableCell>
                        <TableCell>
                          <span className="bg-green-600 text-green-100 px-2 py-1 rounded-full text-xs">
                            {transaction.stockid.discount}% OFF
                          </span>
                        </TableCell>
                        <TableCell className="text-red-500 font-bold">Rs.{transaction.order.paymentAmount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
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
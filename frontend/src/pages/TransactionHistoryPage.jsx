import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Tabs,
  Tab,
  Card,
  CardBody,
} from "@nextui-org/react";
import { SearchIcon, CreditCard, Clock } from "lucide-react";
import RentalTableHistory from "./RentalTableHistory";
import { API_BASE_URL } from "../utils/getAPI";
import LogoLoader from "../components/ui/Loader";

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
          `${API_BASE_URL}/orderItems/useOrders/${id}`
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
      item.stockid.AssignedGame.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
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
    return <LogoLoader isLoading={loading} />;
  }

  if (error) {
    return (
      <div className="bg-black flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center p-4">
          <Card className="bg-gray-900 border-gray-700 text-white p-4 rounded-lg shadow-lg max-w-md w-full">
            <CardBody>
              <p className="text-center font-primaryRegular text-lg md:text-2xl">
                {error}
              </p>
            </CardBody>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Mobile Card Component for transactions
  const MobileTransactionCard = ({ transaction }) => (
    <Card className="bg-white mb-4 shadow-md">
      <CardBody className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={transaction.stockid.AssignedGame.coverPhoto}
            alt={transaction.stockid.AssignedGame.title}
            className="w-16 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-black text-sm md:text-base truncate">
              {transaction.stockid.AssignedGame.title}
            </h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="bg-black text-white px-2 py-1 rounded text-xs">
                {transaction.stockid.discount}% OFF
              </span>
              <span className="text-gray-700 text-xs">
                Unit: Rs.{transaction.price}
              </span>
            </div>
            <div className="mt-2">
              <span className="font-bold text-black text-sm md:text-base">
                Total: Rs.{transaction.order.paymentAmount}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-white">
      <Header />
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl md:text-6xl font-primaryRegular mb-4 md:mb-6 text-center text-black">
          Transactions
        </h1>
        <p className="mb-6 md:mb-8 text-center text-sm md:text-lg text-gray-300 px-4">
          Your account payment details, transactions, and earned Vortex Rewards.
        </p>

        <Tabs
          aria-label="Transaction Tabs"
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          className="mb-6"
          color="default"
          variant="bordered"
        >
          <Tab
            key="purchase"
            title={
              <div className="flex items-center space-x-2">
                <CreditCard size={16} />
                <span className="text-sm md:text-base">Purchase</span>
              </div>
            }
          />
          <Tab
            key="rentals"
            title={
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span className="text-sm md:text-base">Rentals</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === "purchase" && (
          <>
            <Input
              className="mb-6 w-full max-w-md mx-auto"
              placeholder="Search by game title..."
              startContent={<SearchIcon className="text-gray-400" size={16} />}
              value={searchQuery}
              onChange={handleSearchChange}
              size="lg"
              classNames={{
                input: "text-black",
                inputWrapper: "bg-white",
              }}
            />

            {/* Mobile View - Cards */}
            <div className="block md:hidden">
              {items.length > 0 ? (
                <>
                  {items.map((transaction) => (
                    <MobileTransactionCard
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                  <div className="flex justify-center mt-6">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="default"
                      page={page}
                      total={Math.ceil(filteredItems.length / rowsPerPage)}
                      onChange={(page) => setPage(page)}
                      classNames={{
                        wrapper: "gap-0 overflow-visible h-8",
                        item: "w-8 h-8 text-small rounded-none bg-white text-black border-gray-300",
                        cursor: "bg-black text-white border-black",
                      }}
                    />
                  </div>
                </>
              ) : (
                <Card className="bg-white">
                  <CardBody className="text-center py-8">
                    <p className="text-gray-600">No transactions found.</p>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Desktop View - Table */}
            <Card className="bg-white shadow-xl hidden md:block">
              <CardBody>
                <Table
                  aria-label="Transaction history table"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="default"
                        page={page}
                        total={Math.ceil(filteredItems.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                        classNames={{
                          wrapper: "gap-0 overflow-visible h-8",
                          item: "w-8 h-8 text-small rounded-none bg-white text-black",
                          cursor: "bg-black text-white  font-primaryRegular",
                        }}
                      />
                    </div>
                  }
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
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors font-primaryRegular"
                      >
                        <TableCell>
                          <img
                            src={transaction.stockid.AssignedGame.coverPhoto}
                            alt={transaction.stockid.AssignedGame.title}
                            className="w-16 h-16 object-cover rounded-lg shadow-md hover:scale-110 transition-transform duration-200"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {transaction.stockid.AssignedGame.title}
                        </TableCell>
                        <TableCell>Rs.{transaction.price}</TableCell>
                        <TableCell>
                          <span className="bg-black text-white px-2 py-1 rounded-full text-xs">
                            {transaction.stockid.discount}% OFF
                          </span>
                        </TableCell>
                        <TableCell className="font-bold">
                          Rs.{transaction.order.paymentAmount}
                        </TableCell>
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

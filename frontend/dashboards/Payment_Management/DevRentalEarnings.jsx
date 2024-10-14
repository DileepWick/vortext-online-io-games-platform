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
  User,
  Chip,
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8098";
const DEVELOPER_SHARE_PERCENTAGE = 0.7; // 70% share for the developer

const DevRentalEarnings = () => {
  const [rentalPayments, setRentalPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [distributedPayments, setDistributedPayments] = useState({});
  const rowsPerPage = 7;

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
      const response = await axios.get(`${API_BASE_URL}/api/distributed-payments/all`);
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
        aria-label="Developer Rental Earnings table with client-side pagination"
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
          <TableColumn key="AMOUNT">AMOUNT (LKR)</TableColumn>
          <TableColumn key="DATE">DATE</TableColumn>
          <TableColumn key="DEVELOPER">DEVELOPER</TableColumn>
          <TableColumn key="EARNINGS">EARNINGS</TableColumn>
        </TableHeader>
        <TableBody className="text-black">
          {paginatedItems.map((item) => (
            <TableRow key={item._id} className="text-black">
              <TableCell>{item.game?.title || "N/A"}</TableCell>
              <TableCell>Rs.{item.amount?.toFixed(2) || "N/A"}</TableCell>
              <TableCell>
                {item.date
                  ? new Date(item.date).toLocaleDateString()
                  : "N/A"}
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
                {distributedPayments[item._id] 
                  ? <span style={{ color: '#00008B' }}>Rs.{distributedPayments[item._id].toFixed(2)}</span>
                  : <span style={{ color: 'red' }}>Not paid yet</span>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DevRentalEarnings;
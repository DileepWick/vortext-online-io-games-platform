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
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8098";

const DevEarningsOfPurchased = () => {
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [distributedPayments, setDistributedPayments] = useState({});
  const rowsPerPage = 7;

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

  const fetchTableData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orderItems`);
      if (response.data && response.data.orderHistory) {
        setTableData(response.data.orderHistory);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch earnings data");
    }
  };

  useEffect(() => {
    fetchTableData();
    fetchDistributedPayments();
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
        aria-label="Earnings of Purchased Games"
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
          <TableColumn key="DATE">DATE</TableColumn>
          <TableColumn key="DEVELOPER">DEVELOPER</TableColumn>
          <TableColumn key="EARNINGS">EARNINGS</TableColumn>
        </TableHeader>
        <TableBody className="text-black">
          {paginatedItems.map((item) => (
            <TableRow key={item._id} className="text-black">
              <TableCell>{item.stockid?.AssignedGame?.title || "N/A"}</TableCell>
              
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

export default DevEarningsOfPurchased;
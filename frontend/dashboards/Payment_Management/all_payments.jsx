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
  Button
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import { User } from "@nextui-org/react";

const AllPayments = () => {
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 7; // Adjusted rowsPerPage for more data per page

  // Get Allpayments
  const getTableData = async () => {
    try {
      const response = await axios.get("http://localhost:8098/orderItems");
      if (response.data && response.data.orderHistory) {
        setTableData(response.data.orderHistory);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  // Search filter (example for stock)
  const filteredItems = useMemo(() => {
    return tableData.filter((item) =>
      item.stockid?.AssignedGame?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [tableData, searchQuery]);

  //Pagination Next UI
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  // Handle Search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  // Clear Search
  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1); // Reset page to 1 when search query is cleared
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
        aria-label="Example table with client-side pagination"
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
          <TableColumn key="RETAILPRICE">RETAIL PRICE</TableColumn>
          <TableColumn key="DISCOUNT">DISCOUNT</TableColumn>
          <TableColumn key="RETAILPRICE">SALE PRICE</TableColumn>
          <TableColumn key="CUSTOMER">DATE</TableColumn>
          <TableColumn key="CUSTOMER">CUSTOMER</TableColumn>
          <TableColumn key="CUSTOMER">Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item._id}>
              <TableCell>
                {item.stockid?.AssignedGame?.title || "N/A"}
              </TableCell>
              <TableCell>Rs.{item.stockid?.UnitPrice || "N/A"}</TableCell>
              <TableCell>{item.stockid?.discount || "N/A"} %</TableCell>
              <TableCell>Rs.{item.order?.paymentAmount || "N/A"}</TableCell>
              <TableCell>
                {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
              </TableCell>

              <TableCell>
                <User
                  name={item.order?.user?.username || "N/A"}
                  description={item.order?.user?.email || "N/A"}
                  avatarProps={{
                    src: item.order?.user?.profilePic,
                  }}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" color="danger">Distribute Payment</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllPayments;

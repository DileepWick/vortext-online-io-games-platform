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
  Chip,
  Input,
  Button,
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import { EyeIcon } from "../../src/assets/icons/EyeIcon";
import ViewDetails from "./View_Address_Button";
import ViewReason from "./View_Reason_Button";

const CanceledOrdersTable = () => {
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 7; // Adjusted rowsPerPage for more data per page

  // Get All Orders
  const getTableData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8098/orders/allCanceledOrders"
      );
      if (response.data.allOrders) {
        setTableData(response.data.allOrders);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  // Search filter
  const filteredItems = useMemo(() => {
    return tableData.filter((order) =>
      order._id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tableData, searchQuery]);

  // Pagination Next UI
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
        placeholder="Search by REF NO . . ."
        startContent={<SearchIcon />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <Table
        isHeaderSticky
        aria-label="Example table with client side pagination"
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
          <TableColumn key="REF">REF NO</TableColumn>

          <TableColumn key="REGION">REGION</TableColumn>
          <TableColumn key="AMOUNT">AMOUNT</TableColumn>
          <TableColumn key="TOKEN">TOKEN</TableColumn>
          <TableColumn key="DATE">PLACEMENT DATE</TableColumn>
          <TableColumn key="STATUS">STATUS</TableColumn>
          <TableColumn key="ADDRESS">ADDRESS</TableColumn>
          <TableColumn key="REASON">REASON</TableColumn>
        </TableHeader>

        <TableBody>
          {items.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order._id}</TableCell>

              <TableCell>
                <Chip color="default" variant="flat">
                  {order.region}
                </Chip>
              </TableCell>
              <TableCell>{order.paymentAmount}$</TableCell>
              <TableCell>
                <Chip color="warning" variant="bordered">
                  {order.orderCompletionCode}
                </Chip>
              </TableCell>
              <TableCell>
                {new Date(order.orderPlacementDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip color="danger" variant="dot">
                  {order.orderStatus}
                </Chip>
              </TableCell>
              <TableCell>
                <ViewDetails order={order} />
              </TableCell>
              <TableCell>
                <ViewReason order={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CanceledOrdersTable;

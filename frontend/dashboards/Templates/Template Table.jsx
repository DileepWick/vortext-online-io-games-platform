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
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import Restock from "./restock";
import UpdateStock from "./update_stock";

//Stock Components
import DeleteStock from "./delete_stock";

const TableTemp = () => {


  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 4; // Adjusted rowsPerPage for more data per page

  // Get All Stocks
  const getTableData = async () => {
    try {
      const response = await axios.get(
        "api call"
      );
      if (response.data.allGameStocks) {
        setStocks(response.data.allGameStocks);
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
    return stocks.filter((stock) =>
      stock.AssignedGame.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stocks, searchQuery]);

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
          <TableColumn key="GAME">GAME</TableColumn>
          <TableColumn key="PLATFORM">PLATFORM</TableColumn>
          <TableColumn key="EDITION">EDITION</TableColumn>
          <TableColumn key="QUANTITY">QUANTITY</TableColumn>
          <TableColumn key="PRICE">PRICE</TableColumn>
          <TableColumn key="DISCOUNT">DISCOUNT</TableColumn>
          <TableColumn key="ACTIONS">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell>{stock.AssignedGame.title}</TableCell>
              <TableCell>
                <Chip color="default" variant="flat">
                  {stock.Platform}
                </Chip>
              </TableCell>
              <TableCell>{stock.Edition}</TableCell>
              <TableCell>
                {stock.NumberOfUnits < 5 ? (
                  <div>Low on stock</div>
                ) : (
                  stock.NumberOfUnits
                )}
              </TableCell>
              <TableCell>{stock.UnitPrice}$</TableCell>
              <TableCell>{stock.discount}%</TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "10px" }}>
                  <UpdateStock updatingStock={stock} callBackFunction={getAllStocks}/>

                  <Restock
                    stockForRestock={stock}
                    callBackFunction={getAllStocks}
                  />
                  <DeleteStock
                    deletingStock={stock}
                    callBackFunction={getAllStocks}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableTemp;

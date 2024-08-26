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
  Tooltip,
  Input,
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import UpdateStock from "./update_stock";

//Stock Components
import DeleteStock from "./delete_stock";

const StockTable = () => {
  const [stocks, setStocks] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 5; // Adjusted rowsPerPage for more data per page

  // Get All Stocks
  const getAllStocks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8098/gameStocks/allGameStock"
      );
      if (response.data.allGameStocks) {
        setStocks(response.data.allGameStocks);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  useEffect(() => {
    getAllStocks();
  }, []);

  // Search filter
  const filteredItems = useMemo(() => {
    return stocks.filter((stock) =>
      stock.AssignedGame.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stocks, searchQuery]);

  // Pagination
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
        className="ml-2 font-primaryRegular w-[300px] mb-8"
        placeholder="SEARCH BY GAME"
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
          <TableColumn key="PRICE">PRICE</TableColumn>
          <TableColumn key="DISCOUNT">DISCOUNT</TableColumn>
          <TableColumn key="ACTIONS">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell>{stock.AssignedGame.title}</TableCell>

              <TableCell>{stock.UnitPrice}$</TableCell>
              <TableCell>{stock.discount}%</TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "10px" }}>
                  <UpdateStock
                    updatingStock={stock}
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

export default StockTable;

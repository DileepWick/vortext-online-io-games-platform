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
} from "@nextui-org/react";
import { SearchIcon } from "lucide-react";

const RentalTableHistory = ({ userId }) => {
  const [rentals, setRentals] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 4;

  const getRentals = async () => {
    try {
      const response = await axios.get(`http://localhost:8098/Rentals/getRentalsByUser/${userId}`);
      if (response.data) {
        setRentals(response.data);
      }
    } catch (error) {
      console.error("Error fetching rental data:", error);
    }
  };

  useEffect(() => {
    getRentals();
  }, [userId]);

  const filteredItems = useMemo(() => {
    return rentals.filter((rental) =>
      rental.game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rentals, searchQuery]);

  const items = useMemo(() => {
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
    <div className="text-black">
      <Input
        className="ml-2 font-primaryRegular w-48 sm:w-64 mb-4 text-black"
        placeholder="Search by game title..."
        startContent={<SearchIcon size={18} />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <Table
        aria-label="Rental table with pagination"
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
          <TableColumn className="text-black" key="COVER">COVER</TableColumn>
          <TableColumn className="text-black" key="GAME">GAME</TableColumn>         
          <TableColumn className="text-black" key="TIME">TIME (Seconds)</TableColumn>
          <TableColumn className="text-black" key="PRICE">PRICE</TableColumn>
          <TableColumn className="text-black" key="DATE">RENTAL DATE</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((rental) => (
            <TableRow key={rental._id} className="text-black">
            <TableCell>
                <img 
                  src={rental.game.coverPhoto} 
                  alt={rental.game.title}
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              </TableCell>
            <TableCell>{rental.game.title}</TableCell>
              
              <TableCell>{rental.time}</TableCell>
              <TableCell>Rs.{rental.price}</TableCell>
              <TableCell>{new Date(rental.insertDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RentalTableHistory;
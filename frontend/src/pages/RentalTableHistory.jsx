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
  Card,
  CardBody
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
    <div className="text-white">
      <Input
        className="mb-6 w-full max-w-md mx-auto"
        placeholder="Search by game title..."
        startContent={<SearchIcon className="text-gray-400" />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
        size="lg"
      />
      <Card className="bg-gray-900 shadow-xl">
        <CardBody>
          <Table
            aria-label="Rental table with pagination"
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
              th: "text-black font-bold",  // Make table headers black and bold
              td:"text-black",   // Make table body text black and bold
            }}
            
          >
            <TableHeader>
              <TableColumn key="COVER">COVER</TableColumn>
              <TableColumn key="GAME">GAME</TableColumn>         
              <TableColumn key="TIME">TIME (Seconds)</TableColumn>
              <TableColumn key="PRICE">PRICE</TableColumn>
              <TableColumn key="DATE">RENTAL DATE</TableColumn>
            </TableHeader>
            <TableBody>
              {items.map((rental) => (
                <TableRow key={rental._id} className="hover:bg-purple-900/30 transition-colors">
                  <TableCell>
                    <img 
                      src={rental.game.coverPhoto} 
                      alt={rental.game.title}
                      className="w-16 h-16 object-cover rounded-lg shadow-md hover:scale-110 transition-transform duration-200"
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{rental.game.title}</TableCell>
                  <TableCell>{rental.time}</TableCell>
                  <TableCell className="text-red-500 font-bold">Rs.{rental.price}</TableCell>
                  <TableCell>{new Date(rental.insertDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default RentalTableHistory;
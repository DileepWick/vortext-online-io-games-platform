import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast, Flip } from "react-toastify";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from "@nextui-org/react";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { DeleteIcon } from "../src/assets/icons/DeleteIcon";

const RentedGamesSection = () => {
  const [rentedGames, setRentedGames] = useState([]);
  const [rentedGamesSearchQuery, setRentedGamesSearchQuery] = useState("");
  const [rentedGamesPage, setRentedGamesPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");

  const rowsPerPage = 4;

  useEffect(() => {
    fetchRentedGames();
  }, []);

  const fetchRentedGames = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8098/Rentals/getAllRentals`);
      console.log("API response:", response.data);
      setRentedGames(response.data || []);
      setError("");
    } catch (error) {
      console.error("Error fetching rented games:", error);
      setError("Failed to fetch rented games. Please try again.");
      toast.error("Failed to fetch rented games. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRentedGame = async (id) => {
    if (window.confirm("Are you sure you want to delete this rented game?")) {
      setIsLoading(true);
      try {
        await axios.delete(`http://localhost:8098/Rentals/deleteRentalByID/${id}`);
        await fetchRentedGames();
        toast.success("Rented game deleted successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } catch (error) {
        console.error("Error deleting rented game:", error);
        setError("Failed to delete rented game. Please try again.");
        toast.error("Failed to delete rented game. Please try again.", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const uniqueUsers = useMemo(() => {
    const users = new Set(rentedGames.map(game => game.user?.username));
    return ["all", ...Array.from(users)];
  }, [rentedGames]);

  const filteredRentedGames = useMemo(() => {
    return rentedGames.filter((rentedGame) => {
      const matchesSearch = rentedGame.game?.title?.toLowerCase().includes(rentedGamesSearchQuery.toLowerCase());
      const matchesUser = selectedUser === "all" || rentedGame.user?.username === selectedUser;
      return matchesSearch && matchesUser;
    });
  }, [rentedGames, rentedGamesSearchQuery, selectedUser]);

  const rentedGamesItems = useMemo(() => {
    const start = (rentedGamesPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRentedGames.slice(start, end);
  }, [rentedGamesPage, filteredRentedGames]);

  const handleRentedGamesSearchChange = (event) => {
    setRentedGamesSearchQuery(event.target.value);
    setRentedGamesPage(1);
  };

  const handleClearRentedGamesSearch = () => {
    setRentedGamesSearchQuery("");
    setRentedGamesPage(1);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setRentedGamesPage(1);
  };

  if (isLoading) {
    return <div>Loading rented games...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Input
          className="w-64"
          placeholder="Search by game title..."
          startContent={<SearchIcon />}
          value={rentedGamesSearchQuery}
          onChange={handleRentedGamesSearchChange}
          onClear={handleClearRentedGamesSearch}
        />
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="bordered" 
              className="capitalize"
            >
              {selectedUser === "all" ? "All Users" : selectedUser}
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Sort by user"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedUser])}
            onSelectionChange={(keys) => handleUserSelect(Array.from(keys)[0])}
          >
            {uniqueUsers.map((user) => (
              <DropdownItem key={user}>
                {user === "all" ? "All Users" : user}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Table
        aria-label="Rented Games table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={rentedGamesPage}
              total={Math.ceil(filteredRentedGames.length / rowsPerPage)}
              onChange={(page) => setRentedGamesPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn>GAME</TableColumn>
          <TableColumn>USER</TableColumn>
          <TableColumn>TIME (MINUTES)</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>RENTAL DATE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {rentedGamesItems.length === 0 ? (
            <TableRow>
              <TableCell>No rented games found</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          ) : (
            rentedGamesItems.map((rentedGame) => (
              <TableRow key={rentedGame._id}>
                <TableCell>{rentedGame.game?.title || 'N/A'}</TableCell>
                <TableCell>{rentedGame.user?.username || 'N/A'}</TableCell>
                <TableCell>{rentedGame.time || 'N/A'}</TableCell>
                <TableCell>${rentedGame.price || 'N/A'}</TableCell>
                <TableCell>{new Date(rentedGame.insertDate).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Tooltip
                      content="Remove rented game"
                      color="danger"
                      className="font-primaryRegular"
                    >
                      <span
                        className="text-lg text-danger cursor-pointer active:opacity-50"
                        onClick={() => handleDeleteRentedGame(rentedGame._id)}
                      >
                        <DeleteIcon />
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default RentedGamesSection;
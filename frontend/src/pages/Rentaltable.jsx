import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import { API_BASE_URL } from "../utils/getAPI";

const Renttable = () => {
  useAuthCheck();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 4; // Adjusted rowsPerPage for more data per page

  const fetchRentals = useCallback(async () => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      const response = await axios.get(
        `${API_BASE_URL}/Rentals/getRentalsByUser/${userId}`
      );
      setRentals(response.data);
    } catch (err) {
      console.error(
        "Error fetching rentals:",
        err.response ? err.response.data : err.message
      );
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

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
    setPage(1); // Reset page to 1 when search query changes
  };

  const openModal = useCallback((rental) => {
    setCurrentGame(rental);
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setCurrentGame(null);
  }, []);

  // Other modal handling and payment handling methods remain unchanged...

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-customDark min-h-screen font-sans text-white">
      <Header />
      <div className="relative">
        <div className="container mx-auto p-6">
          <div className="text-2xl font-primaryRegular mb-6">
            MY RENTED GAMES
          </div>

          <Input
            className="ml-2 font-primaryRegular w-48 sm:w-64 mb-4"
            placeholder="Search by GAME . . ."
            value={searchQuery}
            onChange={handleSearchChange}
          />

          <Table
            isHeaderSticky
            aria-label="Rented Games Table"
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
          >
            <TableHeader>
              <TableColumn key="GAME">GAME</TableColumn>
              <TableColumn key="RENTAL TIME">RENTAL TIME</TableColumn>
              <TableColumn key="ACTIONS">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {items.map((rental) => (
                <TableRow key={rental._id}>
                  <TableCell>{rental.game.title}</TableCell>
                  <TableCell>{formatTime(rental.time)}</TableCell>
                  <TableCell>
                    <Button onClick={() => openModal(rental)} color="primary">
                      Start Session
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modals for starting session and others remain unchanged */}
        <Modal isOpen={isModalVisible} onClose={closeModal} backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span style={{ color: "#0072F5", fontWeight: "bold" }}>
                    Start Session
                  </span>
                </ModalHeader>
                <ModalBody>
                  {currentGame ? (
                    <span style={{ color: "#0072F5" }}>
                      <p>
                        Are you sure you want to start a session for{" "}
                        {currentGame.game.title}?
                      </p>
                      <p>Rental Time: {currentGame.time}</p>
                    </span>
                  ) : (
                    <p>Loading game details...</p>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleStartSession}>
                    Start Session
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Footer remains unchanged */}
      </div>
      <Footer />
    </div>
  );
};

export default Renttable;

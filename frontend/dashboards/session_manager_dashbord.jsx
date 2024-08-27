import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import { toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Pagination,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { DeleteIcon } from "../src/assets/icons/DeleteIcon";
import { EditIcon } from "../src/assets/icons/EditIcon";
import { PlusIcon } from "../src/assets/icons/PlusIcon";
import RentedGamesSection from "./rentedGamesDash";

const SessionManagerDash = () => {
  const [rentalTimes, setRentalTimes] = useState([]);
  const [games, setGames] = useState([]);
  const [formData, setFormData] = useState({
    gameId: "",
    gameName: "",
    duration: "",
    price: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("rentalTimes");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [page, setPage] = useState(1);

  const rowsPerPage = 4;

  useEffect(() => {
    fetchRentalTimes();
    fetchGames();
  }, []);

  const fetchRentalTimes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8098/rentalDurations/getalltimes`
      );
      setRentalTimes(response.data.rentalTimes || []);
      setError("");
    } catch (error) {
      console.error("Error fetching rental times:", error);
      setError("Failed to fetch rental times. Please try again.");
      toast.error("Failed to fetch rental times. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await axios.get("http://localhost:8098/games/allGames");
      if (response.data && Array.isArray(response.data.allGames)) {
        setGames(response.data.allGames);
      } else {
        console.error("Unexpected games data structure:", response.data);
        setGames([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setError("Failed to fetch games. Please try again.");
      toast.error("Failed to fetch games. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGameSelect = (e) => {
    const selectedGame = games.find((game) => game._id === e.target.value);
    setFormData({
      ...formData,
      gameId: selectedGame._id,
      gameName: selectedGame.title,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!formData.gameId || !formData.duration || !formData.price) {
        throw new Error("Game, duration, and price are required");
      }

      const dataToSend = {
        gameId: formData.gameId,
        duration: parseInt(formData.duration, 10),
        price: parseFloat(formData.price),
      };

      const existingRentalTime = rentalTimes.find(
        (rt) =>
          rt.game._id === formData.gameId &&
          rt.duration === parseInt(formData.duration, 10)
      );

      if (existingRentalTime && !editingId) {
        setError(
          "A rental time with this duration already exists for the selected game"
        );
        toast.error(
          "A rental time with this duration already exists for the selected game",
          {
            theme: "dark",
            transition: Flip,
            style: { fontFamily: "Rubik" },
          }
        );
        setIsLoading(false);
        return;
      }

      let response;
      if (editingId) {
        response = await axios.put(
          `http://localhost:8098/rentalDurations/update/${editingId}`,
          dataToSend
        );
        toast.success("Rental time updated successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } else {
        response = await axios.post(
          "http://localhost:8098/rentalDurations/create",
          dataToSend
        );
        toast.success("New rental time added successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }

      await fetchRentalTimes();
      setFormData({ gameId: "", gameName: "", duration: "", price: "" });
      setEditingId(null);
      setError("");
      onClose();
    } catch (error) {
      console.error("Error saving rental time:", error);
      setError(`Failed to save rental time. Error: ${error.message}`);
      toast.error(`Failed to save rental time: ${error.message}`, {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (rentalTime) => {
    setFormData({
      gameId: rentalTime.game._id,
      gameName: rentalTime.game.title,
      duration: rentalTime.duration.toString(),
      price: rentalTime.price.toString(),
    });
    setEditingId(rentalTime._id);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rental time?")) {
      setIsLoading(true);
      try {
        await axios.delete(
          `http://localhost:8098/rentalDurations/delete/${id}`
        );
        await fetchRentalTimes();
        toast.success("Rental time deleted successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } catch (error) {
        console.error("Error deleting rental time:", error);
        setError("Failed to delete rental time. Please try again.");
        toast.error("Failed to delete rental time. Please try again.", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredItems = useMemo(() => {
    return rentalTimes.filter((rentalTime) =>
      rentalTime.game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rentalTimes, searchQuery]);

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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4">
        <div className="flex w-full flex-col">
          <div className="flex items-center p-4 font-primaryRegular">
            <Tabs
              aria-label="Session Manager Tabs"
              className="flex-1"
              onSelectionChange={setActiveTab}
              selectedKey={activeTab}
              size="lg"
              color="primary"
            >
              <Tab key="rentalTimes" title="Rental Times" />
              <Tab key="rentedGames" title="Rented Games" />
            </Tabs>
          </div>
          {activeTab === "rentalTimes" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <Input
                  className="w-64"
                  placeholder="Search by game title..."
                  startContent={<SearchIcon />}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClear={handleClearSearch}
                />
                <Button
                  color="primary"
                  onPress={() => {
                    setFormData({
                      gameId: "",
                      gameName: "",
                      duration: "",
                      price: "",
                    });
                    setEditingId(null);
                    setError("");
                    onOpen();
                  }}
                  startContent={<PlusIcon />}
                >
                  Add New Rental Time
                </Button>
              </div>
              <Table
                aria-label="Rental Times table"
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
                  <TableColumn>GAME</TableColumn>
                  <TableColumn>DURATION (MINUTES)</TableColumn>
                  <TableColumn>PRICE (LKR)</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {items.map((rentalTime) => (
                    <TableRow key={rentalTime._id}>
                      <TableCell>{rentalTime.game.title}</TableCell>
                      <TableCell>
                        <Chip color="default" variant="flat">
                          {rentalTime.duration}
                        </Chip>
                      </TableCell>
                      <TableCell>LKR {rentalTime.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Tooltip
                            content="Edit rental time"
                            color="warning"
                            className="font-primaryRegular"
                          >
                            <span
                              className="text-lg text-warning cursor-pointer active:opacity-50"
                              onClick={() => handleEdit(rentalTime)}
                            >
                              <EditIcon />
                            </span>
                          </Tooltip>
                          <Tooltip
                            content="Remove rental time"
                            color="danger"
                            className="font-primaryRegular"
                          >
                            <span
                              className="text-lg text-danger cursor-pointer active:opacity-50"
                              onClick={() => handleDelete(rentalTime._id)}
                            >
                              <DeleteIcon />
                            </span>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
          {activeTab === "rentedGames" && (
            <RentedGamesSection />
          )}
        </div>
      </main>
      <Footer />

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setError("");
        }}
      >
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {editingId ? "Edit Rental Time" : "Add New Rental Time"}
            </ModalHeader>
            <ModalBody>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <div className="mb-4">
                <Select
                  label="Game"
                  placeholder="Select a game"
                  selectedKeys={formData.gameId ? [formData.gameId] : []}
                  onChange={handleGameSelect}
                  required
                >
                  {games.map((game) => (
                    <SelectItem key={game._id} value={game._id}>
                      {game.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="mb-4">
                <Input
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Price (LKR)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  setFormData({
                    gameId: "",
                    gameName: "",
                    duration: "",
                    price: "",
                  });
                  setEditingId(null);
                  setError("");
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit">
                {editingId ? "Update" : "Add"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SessionManagerDash;
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
import SessionAnalytics from "./sessionAnalytics";
import useAuthCheck from "../src/utils/authCheck";
import { API_BASE_URL } from "../src/utils/getAPI";

const SessionManagerDash = () => {
  useAuthCheck("Session_Manager");
  const [rentalTimes, setRentalTimes] = useState([]);
  const [pricePerMinute, setPricePerMinute] = useState(5);
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
        `${API_BASE_URL}/rentalDurations/getalltimes`
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
      const response = await axios.get(`${API_BASE_URL}/games/allGames`);
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
    if (name === "duration") {
      const durationValue = parseInt(value, 10);
      const calculatedPrice = durationValue * pricePerMinute;
      setFormData({
        ...formData,
        [name]: value,
        price: calculatedPrice.toString(),
      });
    } else if (name === "pricePerMinute") {
      const newPricePerMinute = parseFloat(value);
      setPricePerMinute(newPricePerMinute);
      if (formData.duration) {
        const durationValue = parseInt(formData.duration, 10);
        const calculatedPrice = durationValue * newPricePerMinute;
        setFormData({
          ...formData,
          price: calculatedPrice.toString(),
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
        duration: parseInt(formData.duration, 10) * 60, // Convert minutes to seconds
        price: parseFloat(formData.price),
      };

      const existingRentalTime = rentalTimes.find(
        (rt) =>
          rt.game &&
          rt.game._id === formData.gameId &&
          rt.duration === parseInt(formData.duration, 10) * 60 // Compare in seconds
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
          `${API_BASE_URL}/rentalDurations/update/${editingId}`,
          dataToSend
        );
        toast.success("Rental time updated successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      } else {
        response = await axios.post(
          `${API_BASE_URL}/rentalDurations/create`,
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
      duration: (rentalTime.duration / 60).toString(), // Convert seconds to minutes for display
      price: rentalTime.price.toString(),
    });
    setEditingId(rentalTime._id);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rental time?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/rentalDurations/delete/${id}`);
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
    return rentalTimes.filter((rentalTime) => {
      if (rentalTime && rentalTime.game && rentalTime.game.title) {
        return rentalTime.game.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return false;
    });
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
    <div className="flex flex-col min-h-screen bg-white">
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
              <Tab key="analytics" title="Analytics" />
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
                <div className="p-4 shadow-lg rounded-lg border border-gray-200 bg-white flex flex-col w-52">
                  <label className="text-sm font-medium text-primary mb-1">
                    Price per Minute (LKR)
                  </label>
                  <Input
                    className="w-full"
                    name="pricePerMinute"
                    type="number"
                    value={pricePerMinute}
                    onChange={handleInputChange}
                  />
                </div>
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
                      <TableCell>
                        <span className="text-primary font-medium">
                          {rentalTime.game?.title || "Unknown game"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip color="default" variant="flat">
                          {rentalTime.duration / 60} min
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-primary font-medium">
                          LKR {rentalTime.price.toFixed(2)}
                        </span>
                      </TableCell>
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
          {activeTab === "rentedGames" && <RentedGamesSection />}
          {activeTab === "analytics" && <SessionAnalytics />}
        </div>
      </main>
      <Footer />

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setPricePerMinute(5);
        }}
      >
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <h3 className="text-xl font-bold text-primary">
                {editingId ? "Edit Rental Time" : "Add New Rental Time"}
              </h3>
            </ModalHeader>
            <ModalBody>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <div className="mb-4">
                {editingId ? (
                  <Input
                    label="Game"
                    value={formData.gameName}
                    readOnly
                    classNames={{
                      label: "text-primary",
                      input: "text-primary",
                    }}
                  />
                ) : (
                  <Select
                    label="Game"
                    placeholder="Select a game"
                    selectedKeys={formData.gameId ? [formData.gameId] : []}
                    onChange={handleGameSelect}
                    required
                    classNames={{
                      label: "text-primary",
                      trigger: "text-primary",
                      listbox: "text-primary",
                      popover: "text-primary",
                    }}
                  >
                    {games.map((game) => (
                      <SelectItem
                        key={game._id}
                        value={game._id}
                        className="text-primary"
                      >
                        {game.title}
                      </SelectItem>
                    ))}
                  </Select>
                )}
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
                  readOnly
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
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

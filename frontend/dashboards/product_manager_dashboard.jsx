import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";

// Components
import Header from "../src/components/header";
import UploadGame from "./Games_Components/add_new_game";
import UpdateGame from "./Games_Components/update_game";
import AddNewStock from "./Games_Components/add_new_stock";
import Footer from "../src/components/footer";
import VideoPlayer from "../src/components/videoPlayer";

//Stock Components
import StockTable from "./Stock_Components/stock_table";

// Next UI
import { Tabs, Tab, Button, Input, User, Chip, Image } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { EditIcon } from "../src/assets/icons/EditIcon";
import { EyeIcon } from "../src/assets/icons/EyeIcon";
import { DeleteIcon } from "../src/assets/icons/DeleteIcon";
import { Tooltip } from "@nextui-org/react";
import { PlusIcon } from "../src/assets/icons/PlusIcon";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { toast, Flip } from "react-toastify";

const Blogger = () => {
  //Add New Game Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  //Details Modal
  const {
    isOpen: isDetailsModalOpen,
    onOpen: onDetailsModalOpen,
    onClose: onDetailsModalClose,
  } = useDisclosure();

  //Delete Game Modal
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  //Update Game Modal
  const {
    isOpen: isUpdateModalOpen,
    onOpen: onUpdateModalOpen,
    onClose: onUpdateModalClose,
  } = useDisclosure();

  //Add New Stock Modal
  const {
    isOpen: isAddStockModalOpen,
    onOpen: onAddStockModalOpen,
    onClose: onAddStockModalClose,
  } = useDisclosure();

  const [activeTab, setActiveTab] = useState("stats");
  const [page, setPage] = useState(1);
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const rowsPerPage = 5;

  //Search filter
  const filteredItems = useMemo(() => {
    return games.filter((game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  //Pagination Next UI
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  //Get all games function
  useEffect(() => {
    getAllGames();
  }, []);

  const getAllGames = async () => {
    try {
      const response = await axios.get(`http://localhost:8098/games/allGames`);
      if (response.data.allGames) {
        setGames(response.data.allGames);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  //Handle Search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  //Clear Search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  //Handle View
  const handleEyeIconClick = (game) => {
    setSelectedGame(game);
    onDetailsModalOpen();
  };

  //Set deleted game
  const handleGameDeletion = (game) => {
    setSelectedGame(game);
    onDeleteModalOpen();
  };

  //Set updating game
  const handleEditIconClick = (game) => {
    console.log("Edit game:", game);
    setSelectedGame(game);
    onUpdateModalOpen();
  };

  //Set New Stock Game
  const handleAddNewStock = (game) => {
    console.log("Stocking game:", game);
    setSelectedGame(game);
    onAddStockModalOpen();
  };

  //Handle deleting
  const deleteSelectedGame = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8098/games/deleteGame/${selectedGame._id}`
      );
      if (response.data.message) {
        setGames(games.filter((game) => game.id !== selectedGame.id));
        toast.success("Game Deleted", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        onDeleteModalClose(); // Close the deletion modal after successful deletion

        // Refetch games list
        getAllGames();
      } else {
        alert("Failed to delete game."); // Show error message if deletion fails
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      alert("An error occurred while deleting the game."); // Handle error
    }
  };

  //Call back function
  const handleUploadComplete = () => {
    getAllGames();
  };

  return (
    <div className="flex w-full flex-col text-black bg-white">
      <div className="relative">
        <Header />
      </div>
      <div className="flex items-center p-4 font-primaryRegular bg-inputColor">
        <Tabs
          aria-label="Blogger Tabs"
          className="flex-1"
          onSelectionChange={setActiveTab}
          selectedKey={activeTab}
          size="lg"
          variant="bordered"
          color="primary"
        >
          <Tab key="analytics" title="Analytics" />
          <Tab key="products" title="Unpublished Games" />
          <Tab key="stock" title="Published Games" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "analytics" && (
          <div className="bg-white flex flex-col min-h-screen">

            <p className="text-center text-black font-primaryRegular text-5xl mt-[100px]">
              STATS 
            </p>
           
          </div>
        )}
        {/*PRODUCTS*/}
        {activeTab === "products" && (
          <>
            <div className="flex justify-between mb-4 bg-inputColor">
              <Input
                className="ml-2 font-primaryRegular w-[300px] bg-inputColor"
                placeholder="SEARCH BY GAME"
                startContent={<SearchIcon />}
                value={searchQuery}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
              />
              <Button
                className="font-primaryRegular"
                color="primary"
                variant="shadow"
                endContent={<PlusIcon />}
                size="lg"
                onPress={onAddModalOpen}
              >
                Add New
              </Button>
            </div>
            {/*Product Table*/}
            <Table
              isHeaderSticky
              aria-label="Example table with client side pagination "
              className="font-primaryRegular bg-inputColor"
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
              <TableHeader className="bg-foreground">
                <TableColumn key="name">TITLE</TableColumn>
                <TableColumn key="date">RELEASE DATE</TableColumn>
                <TableColumn key="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody className="bg-inputColor">
                {items.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>{game.title}</TableCell>
                    <TableCell>
                      {new Date(game.insertDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="relative flex items-center gap-2 space-x-4">
                        <Tooltip
                          content="Show details"
                          showArrow
                          className="font-primaryRegular"
                          color="default"
                          placement="top-end"
                        >
                          <span
                            className="text-lg text-default-400 cursor-pointer active:opacity-20"
                            onClick={() => handleEyeIconClick(game)}
                          >
                            <EyeIcon />
                          </span>
                        </Tooltip>
                        <Tooltip
                          content="Edit details"
                          showArrow
                          className="font-primaryRegular"
                          color="primary"
                        >
                          <span
                            className="text-lg text-default-400 cursor-pointer active:opacity-20"
                            onClick={() => handleEditIconClick(game)}
                          >
                            <EditIcon />
                          </span>
                        </Tooltip>
                        <Tooltip
                          content="Delete game"
                          showArrow
                          color="danger"
                          className="font-primaryRegular"
                          placement="top-start"
                        >
                          <span
                            className="text-lg text-default-400 cursor-pointer active:opacity-20"
                            onClick={() => handleGameDeletion(game)}
                          >
                            <DeleteIcon />
                          </span>
                        </Tooltip>
                        <Tooltip
                          content="Publish This Games"
                          showArrow
                          color="default"
                          className="font-primaryRegular"
                        >
                          <Button
                            color="primary"
                            variant="ghost"
                            onClick={() => handleAddNewStock(game)}
                          >
                            Publish
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Show Game Details */}
            <Modal
              isOpen={isDetailsModalOpen}
              size="2xl"
              onOpenChange={onDetailsModalClose}
              classNames={{
                backdrop:
                  "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
              className="p-4"
            >
              <ModalContent className="font-primaryRegular bg-white">
                <ModalHeader>Game Information</ModalHeader>
                <ModalBody>
                  {selectedGame && (
                    <div className="flex flex-col gap-4">
                      <Chip color="primary">{selectedGame.title}</Chip>

                      <div className="flex gap-4 items-start">
                        <div>
                          <Image
                            isZoomed
                            width={300}
                            alt="Game Cover Photo"
                            src={selectedGame.coverPhoto}
                            className="rounded-lg shadow-md"
                          />
                        </div>
                        {selectedGame.TrailerVideo && (
                          <div className="w-[700px] h-[100px] mb-8">
                            <VideoPlayer
                              videoUrl={selectedGame.TrailerVideo}
                              autoPlay
                              controls
                              className="w-[400px] h-[300px]"
                              muted
                            />
                          </div>
                        )}
                      </div>

                      <p className="text-black text-[16px] mt-8">
                        {selectedGame.Description}
                      </p>

                      <p className="text-gray-600">
                        Release Date <br />
                        <Chip radius="none" color="default">
                          {new Date(selectedGame.insertDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </Chip>
                      </p>
                    </div>
                  )}
                </ModalBody>

                <ModalFooter>
                  <Button
                    color="danger"
                    variant="ghost"
                    size="sm"
                    onPress={onDetailsModalClose}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Add New Game  */}
            <Modal
              isOpen={isAddModalOpen}
              size="lg"
              onOpenChange={onAddModalClose}
              classNames={{
                backdrop:
                  "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
            >
              <ModalContent className="font-primaryRegular">
                <ModalHeader>Add New Game</ModalHeader>
                <ModalBody>
                  <UploadGame
                    FunctionToCallAfterUpload={handleUploadComplete}
                  />
                </ModalBody>
                <ModalFooter></ModalFooter>
              </ModalContent>
            </Modal>

            {/* Delete Game  */}
            <Modal
              isOpen={isDeleteModalOpen}
              onOpenChange={onDeleteModalClose}
              classNames={{
                backdrop:
                  "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
            >
              <ModalContent className="font-primaryRegular">
                <ModalHeader>Confirm Game Deletion</ModalHeader>
                <ModalBody>
                  <p>
                    Deleting Game : {selectedGame ? selectedGame.title : ""}
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onDeleteModalClose}
                  >
                    Cancel
                  </Button>
                  <Button color="primary" onClick={deleteSelectedGame}>
                    Confirm
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Update Game Details */}
            <Modal
              isOpen={isUpdateModalOpen}
              size="3xl"
              onOpenChange={onUpdateModalClose}
              classNames={{
                backdrop:
                  "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
            >
              <ModalContent className="font-primaryRegular">
                <ModalBody className="bg-white text-black">
                  <ModalHeader>Update Game</ModalHeader>

                  <UpdateGame
                    updatingGame={selectedGame}
                    callBackFunction1={onUpdateModalClose}
                    callBackFunction2={handleUploadComplete}
                  />
                </ModalBody>
                <ModalFooter className="bg-white ">
                  <Button
                    color="danger"
                    variant="ghost"
                    onPress={onUpdateModalClose}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/*Add New Stock Modal*/}
            <Modal
              isOpen={isAddStockModalOpen}
              size="lg"
              onOpenChange={onAddStockModalClose}
              classNames={{
                backdrop:
                  "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
            >
              <ModalContent className="font-primaryRegular">
                <ModalHeader>Publish Game</ModalHeader>
                <ModalBody>
                  <AddNewStock
                    gameForTheStock={selectedGame}
                    callBackFunction={onAddStockModalClose}
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}
        {activeTab === "stock" && <StockTable />}
      </div>
      <Footer />
    </div>
  );
};

export default Blogger;

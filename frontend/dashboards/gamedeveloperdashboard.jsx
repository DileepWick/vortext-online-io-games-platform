import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";

// Components
import Header from "../src/components/header";
import Footer from "../src/components/footer";

// Next UI
import { Tabs, Tab, Button, Input, Tooltip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { EditIcon } from "../src/assets/icons/EditIcon";
import { EyeIcon } from "../src/assets/icons/EyeIcon";
import { DeleteIcon } from "../src/assets/icons/DeleteIcon";
import { PlusIcon } from "../src/assets/icons/PlusIcon";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { toast, Flip } from "react-toastify";
import DeveloperHeader from "../src/components/developerHeader";

const GameDeveloperDashboard = () => {
  // Modals
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isUpdateModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();

  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const rowsPerPage = 5;

  // Search filter
  const filteredItems = useMemo(() => {
    return products.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Pagination
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  // Fetch all products
  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:8098/products/allProducts`);
      if (response.data.allProducts) {
        setProducts(response.data.allProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Handle Search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  // Clear Search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Handle actions
  const handleEyeIconClick = (product) => {
    setSelectedProduct(product);
    onDetailsModalOpen();
  };

  const handleEditIconClick = (product) => {
    setSelectedProduct(product);
    onUpdateModalOpen();
  };

  const handleProductDeletion = (product) => {
    setSelectedProduct(product);
    onDeleteModalOpen();
  };

  const deleteSelectedProduct = async () => {
    try {
      const response = await axios.delete(`http://localhost:8098/products/deleteProduct/${selectedProduct._id}`);
      if (response.data.message) {
        setProducts(products.filter((product) => product.id !== selectedProduct.id));
        toast.success("Product Deleted", {
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
        getAllProducts(); // Refetch products list
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product.");
    }
  };

  const handleUploadComplete = () => {
    getAllProducts();
  };

  return (
    <div className="flex w-full flex-col dark text-foreground bg-background">
      <div className="relative">
        <Header />
      </div>
      <div className="flex items-center p-4 font-primaryRegular bg-inputColor">
        <Tabs
          aria-label="Game Developer Dashboard Tabs"
          className="flex-1"
          onSelectionChange={setActiveTab}
          selectedKey={activeTab}
          size="lg"
          variant="bordered"
          color="primary"
        >
          <Tab key="overview" title="Overview" />
          <Tab key="products" title="Product List" />
          <Tab key="sales" title="Sales Reports" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "overview" && (
          <>
            <h1>Overview</h1>
            {/* Add your overview content here */}
          </>
        )}
        {activeTab === "products" && (
          <>
            <div className="flex justify-between mb-4 bg-inputColor">
              <Input
                className="ml-2 font-primaryRegular w-[300px] bg-inputColor"
                placeholder="SEARCH BY PRODUCT"
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
            <Table
              isHeaderSticky
              aria-label="Products table with pagination"
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
                <TableColumn key="price">PRICE</TableColumn>
                <TableColumn key="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody className="bg-inputColor">
                {items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.price}</TableCell>
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
                            onClick={() => handleEyeIconClick(product)}
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
                            onClick={() => handleEditIconClick(product)}
                          >
                            <EditIcon />
                          </span>
                        </Tooltip>
                        <Tooltip
                          content="Delete product"
                          showArrow
                          color="danger"
                          className="font-primaryRegular"
                          placement="top-start"
                        >
                          <span
                            className="text-lg text-default-400 cursor-pointer active:opacity-20"
                            onClick={() => handleProductDeletion(product)}
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

            {/* Show Product Details */}
            <Modal
              isOpen={isDetailsModalOpen}
              size="2xl"
              onOpenChange={onDetailsModalClose}
              classNames={{
                backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
              className="p-4"
            >
              <ModalContent className="font-primaryRegular bg-black">
                <ModalHeader>
                  <h2>Product Details</h2>
                </ModalHeader>
                <ModalBody>
                  {selectedProduct && (
                    <div>
                      <h3>{selectedProduct.title}</h3>
                      <p>
                        <strong>Price:</strong> ${selectedProduct.price}
                      </p>
                      {/* Add more product details here */}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onDetailsModalClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Add New Product */}
            <Modal
              isOpen={isAddModalOpen}
              size="2xl"
              onOpenChange={onAddModalClose}
              classNames={{
                backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
              className="p-4"
            >
              <ModalContent className="font-primaryRegular bg-black">
                <ModalHeader>
                  <h2>Add New Product</h2>
                </ModalHeader>
                <ModalBody>
                  {/* Add product form here */}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onAddModalClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Update Product */}
            <Modal
              isOpen={isUpdateModalOpen}
              size="2xl"
              onOpenChange={onUpdateModalClose}
              classNames={{
                backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
              className="p-4"
            >
              <ModalContent className="font-primaryRegular bg-black">
                <ModalHeader>
                  <h2>Update Product</h2>
                </ModalHeader>
                <ModalBody>
                  {/* Update product form here */}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onUpdateModalClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Delete Product */}
            <Modal
              isOpen={isDeleteModalOpen}
              size="sm"
              onOpenChange={onDeleteModalClose}
              classNames={{
                backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              }}
              className="p-4"
            >
              <ModalContent className="font-primaryRegular bg-black">
                <ModalHeader>
                  <h2>Confirm Deletion</h2>
                </ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete this product?</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" onPress={deleteSelectedProduct}>
                    Delete
                  </Button>
                  <Button color="primary" onPress={onDeleteModalClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        )}
        {activeTab === "sales" && (
          <>
            <h1>Sales Reports</h1>
            {/* Add sales reports content here */}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GameDeveloperDashboard;

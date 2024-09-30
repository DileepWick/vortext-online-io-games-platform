import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
import { SearchIcon } from "../../src/assets/icons/SearchIcon";

const DeveloperDashboard = () => {
  const [developers, setDevelopers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const rowsPerPage = 4;

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await axios.get("http://localhost:8098/users/allDevelopers");
        if (response.data.allUsers && Array.isArray(response.data.allUsers)) {
          setDevelopers(response.data.allUsers);
        } else {
          console.error("Unexpected response format:", response.data);
          toast.error("Failed to fetch developers. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching developers:", error);
        toast.error("Failed to fetch developers. Please try again later.");
      }
    };

    fetchDevelopers();
  }, []);

  const filteredDevelopers = useMemo(() => {
    const sortedDevelopers = [...developers].sort((a, b) => {
      const aStatus = a.developerAttributes?.status || "unknown";
      const bStatus = b.developerAttributes?.status || "unknown";
      
      if (aStatus === "pending" && bStatus !== "pending") return -1;
      if (aStatus !== "pending" && bStatus === "pending") return 1;
      return 0;
    });

    return sortedDevelopers.filter((developer) =>
      developer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      developer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [developers, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDevelopers.slice(start, end);
  }, [page, filteredDevelopers]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const openApproveModal = (developer) => {
    setSelectedDeveloper(developer);
    setApproveModalOpen(true);
  };

  const openRejectModal = (developer) => {
    setSelectedDeveloper(developer);
    setRejectModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      await axios.put(`http://localhost:8098/users/developers/approve/${selectedDeveloper._id}`);
      toast.success("Developer approved!");

      setDevelopers((prevDevelopers) =>
        prevDevelopers.map((developer) =>
          developer._id === selectedDeveloper._id ? { ...developer, developerAttributes: { ...developer.developerAttributes, status: "approved" }} : developer
        )
      );
      setApproveModalOpen(false);
    } catch (error) {
      console.error("Error approving developer:", error);
      toast.error("Failed to approve the developer. Please try again later.");
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(`http://localhost:8098/users/developers/reject/${selectedDeveloper._id}`);
      toast.success("Developer rejected.");

      setDevelopers((prevDevelopers) =>
        prevDevelopers.map((developer) =>
          developer._id === selectedDeveloper._id ? { ...developer, developerAttributes: { ...developer.developerAttributes, status: "rejected" }} : developer
        )
      );
      setRejectModalOpen(false);
    } catch (error) {
      console.error("Error rejecting developer:", error);
      toast.error("Failed to reject the developer. Please try again later.");
    }
  };

  return (
    <div>
      <Input
        className="ml-2 font-primaryRegular w-48 sm:w-64"
        placeholder="Search by Developer..."
        startContent={<SearchIcon />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={() => handleSearchChange({ target: { value: "" } })}
      />
      <Table
        className="text-black"
        isHeaderSticky
        aria-label="Developer Requests Table with Pagination"
        bottomContent={
          <div className="flex w-full justify-center font-primaryRegular">
            <Pagination
              isCompact
              loop
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(filteredDevelopers.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>FULL NAME</TableColumn>
          <TableColumn>USERNAME</TableColumn>
          <TableColumn>PORTFOLIO LINK</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>

        <TableBody>
          {paginatedItems.map((developer) => (
            <TableRow key={developer._id}>
              <TableCell>{developer.firstname + " " + developer.lastname}</TableCell>
              <TableCell>{developer.username}</TableCell>
              <TableCell>{developer.portfolioLink}</TableCell>
              <TableCell>{developer.email}</TableCell>
              <TableCell>
                <Chip
                  color={
                    developer.developerAttributes?.status === "approved"
                      ? "success"
                      : developer.developerAttributes?.status === "rejected"
                      ? "error"
                      : "default"
                  }
                  variant="flat"
                >
                  {developer.developerAttributes?.status || "unknown"}
                </Chip>
              </TableCell>
              <TableCell>
                {developer.developerAttributes?.status === "pending" && (
                  <>
                    <Button onClick={() => openApproveModal(developer)} color="success">
                      Approve
                    </Button>
                    <Button onClick={() => openRejectModal(developer)} variant="ghost" color="danger">
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setApproveModalOpen(false)}
      >
        <ModalContent className="text-black">
          <ModalHeader>Approve Developer</ModalHeader>
          <ModalBody>
            Are you sure you want to approve {selectedDeveloper?.username}?
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onClick={() => setApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="success" onClick={handleApprove}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
      >
        <ModalContent className="text-black">
          <ModalHeader>Reject Developer</ModalHeader>
          <ModalBody>
            Are you sure you want to reject {selectedDeveloper?.username}?
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="flat"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onClick={handleReject}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DeveloperDashboard;
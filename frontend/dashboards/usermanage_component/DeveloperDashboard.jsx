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
  Input,
  Button,
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";

const DeveloperDashboard = () => {
  const [developers, setDevelopers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 4;

  // Fetch developers when component mounts
  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await axios.get("http://localhost:8098/users/allDevelopers");

        // Extract the `allUsers` array from the response
        if (response.data.allUsers && Array.isArray(response.data.allUsers)) {
          setDevelopers(response.data.allUsers);
        } else {
          console.error("Unexpected response format:", response.data);
          alert("Failed to fetch developers. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching developers:", error);
        alert("Failed to fetch developers. Please try again later.");
      }
    };

    fetchDevelopers();
  }, []);

  // Filter developers based on search query
  const filteredDevelopers = useMemo(() => {
    return developers.filter((developer) =>
      developer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      developer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [developers, searchQuery]);

  // Paginate the filtered developers
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDevelopers.slice(start, end);
  }, [page, filteredDevelopers]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  // Approve Developer
  const handleApprove = async (id) => {
    try {
      const confirmation = window.confirm("Are you sure you want to approve this developer?");
      if (confirmation) {
        // Call the approve route
        await axios.put(`http://localhost:8098/users/developers/approve/${id}`);
        alert("Developer approved!");

        // Update local state to reflect the change
        setDevelopers((prevDevelopers) =>
          prevDevelopers.map((developer) =>
            developer._id === id ? { ...developer, developerAttributes: { ...developer.developerAttributes, status: "approved" }} : developer
          )
        );
      }
    } catch (error) {
      console.error("Error approving developer:", error);
      alert("Failed to approve the developer. Please try again later.");
    }
  };

  // Reject Developer
  const handleReject = async (id) => {
    try {
      const confirmation = window.confirm("Are you sure you want to reject this developer?");
      if (confirmation) {
        // Call the reject route
        await axios.put(`http://localhost:8098/users/developers/reject/${id}`);
        alert("Developer rejected.");

        // Update local state to reflect the change
        setDevelopers((prevDevelopers) =>
          prevDevelopers.map((developer) =>
            developer._id === id ? { ...developer, developerAttributes: { ...developer.developerAttributes, status: "rejected" }} : developer
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting developer:", error);
      alert("Failed to reject the developer. Please try again later.");
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
          <TableColumn>FLLNAME</TableColumn>
          <TableColumn>USERNAME</TableColumn>
          <TableColumn>PORTOFOLIO LINK</TableColumn>
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
                    <Button onClick={() => handleApprove(developer._id)} color="success">
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(developer._id)} variant="ghost" color="danger">
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeveloperDashboard;

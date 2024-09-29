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
  Link,
  Button,
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";

const DeveloperInfoTable = () => {
  const [developers, setDevelopers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateId, setUpdateId] = useState(null); // ID of the developer to update
  const [updateData, setUpdateData] = useState({ firstName: "", lastName: "", username: "", email: "" });
  const rowsPerPage = 5;

  // Fetch All Developers
  const getAllDevelopers = async () => {
    try {
      const response = await axios.get("http://localhost:8098/developers/all");
      console.log("Fetched all developers:", response.data.allDevelopers);
      setDevelopers(response.data.allDevelopers);
    } catch (error) {
      console.error("Error fetching all developers:", error);
    }
  };

  useEffect(() => {
    getAllDevelopers();
  }, []);

  // Search filter for developers
  const filteredDevelopers = useMemo(() => {
    return developers.filter((dev) =>
      dev.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [developers, searchQuery]);

  // Pagination logic
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDevelopers.slice(start, end);
  }, [page, filteredDevelopers]);

  // Handle Search Input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  // Handle Update Developer
  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8098/developers/${id}`, updateData);
      console.log("Updated developer:", response.data);
      setDevelopers((prev) =>
        prev.map((dev) => (dev._id === id ? { ...dev, ...updateData } : dev))
      );
      setUpdateId(null); // Clear update ID after update
      setUpdateData({ firstName: "", lastName: "", username: "", email: "" }); // Clear update form
    } catch (error) {
      console.error("Error updating developer:", error);
    }
  };

  // Handle Delete Developer
  const handleDelete = async (id) => {
    const confirmation = window.confirm("Are you sure you want to delete this developer?");
    if (confirmation) {
      try {
        await axios.delete(`http://localhost:8098/developers/${id}`);
        setDevelopers((prevDevelopers) => prevDevelopers.filter((developer) => developer._id !== id));
        alert("Developer deleted successfully.");
      } catch (error) {
        console.error("Error deleting developer:", error);
        alert("Failed to delete developer. Please try again later.");
      }
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
        isHeaderSticky
        aria-label="All Developers Information Table"
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
              total={Math.ceil(filteredDevelopers.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>FIRST NAME</TableColumn>
          <TableColumn>LAST NAME</TableColumn>
          <TableColumn>USERNAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>PORTFOLIO</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((developer) => (
            <TableRow key={developer._id}>
              <TableCell>
                {updateId === developer._id ? (
                  <Input
                    value={updateData.firstName}
                    onChange={(e) => setUpdateData({ ...updateData, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                ) : (
                  developer.firstName
                )}
              </TableCell>
              <TableCell>
                {updateId === developer._id ? (
                  <Input
                    value={updateData.lastName}
                    onChange={(e) => setUpdateData({ ...updateData, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                ) : (
                  developer.lastName
                )}
              </TableCell>
              <TableCell>
                {updateId === developer._id ? (
                  <Input
                    value={updateData.username}
                    onChange={(e) => setUpdateData({ ...updateData, username: e.target.value })}
                    placeholder="Username"
                  />
                ) : (
                  developer.username
                )}
              </TableCell>
              <TableCell>
                {updateId === developer._id ? (
                  <Input
                    value={updateData.email}
                    onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                    placeholder="Email"
                  />
                ) : (
                  developer.email
                )}
              </TableCell>
              <TableCell>
                {developer.portfolioLinks.length > 0 ? (
                  developer.portfolioLinks.map((link, index) => (
                    <Link key={index} href={link} target="_blank" className="block text-blue-500 underline">
                      {link}
                    </Link>
                  ))
                ) : (
                  "No Portfolio"
                )}
              </TableCell>
              <TableCell>
                <Chip
                  color={developer.status === "approved" ? "success" : developer.status === "rejected" ? "error" : "default"}
                  variant="flat"
                >
                  {developer.status}
                </Chip>
              </TableCell>
              <TableCell>
                {updateId === developer._id ? (
                  <Button onClick={() => handleUpdate(developer._id)} color="success">
                    Save
                  </Button>
                ) : (
                  <Button onClick={() => { setUpdateId(developer._id); setUpdateData({ firstName: developer.firstName, lastName: developer.lastName, username: developer.username, email: developer.email }); }}>
                    Update
                  </Button>
                )}
                <Button onClick={() => handleDelete(developer._id)} color="error">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeveloperInfoTable;

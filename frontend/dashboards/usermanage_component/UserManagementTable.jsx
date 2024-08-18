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
  Button
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";

const UserManagementTable = ({ users, setUsers }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 4; // Adjust rows per page if necessary

  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [page, filteredUsers]);

  // Handle Search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  // Clear Search
  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1); // Reset page to 1 when search query is cleared
  };

  // Update user (placeholder function)
  const handleUpdate = (user) => {
    console.log("Update user:", user);
    // Implement the update logic here
  };

  // Delete user
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:8098/users/delete/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      <Input
        className="ml-2 font-primaryRegular w-48 sm:w-64"
        placeholder="Search by username..."
        startContent={<SearchIcon />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <Table
        isHeaderSticky
        aria-label="User Management Table"
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
              total={Math.ceil(filteredUsers.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="ID">ID</TableColumn>
          <TableColumn key="USERNAME">Username</TableColumn>
          <TableColumn key="EMAIL">Email</TableColumn>
          <TableColumn key="AGE">Age</TableColumn>
          <TableColumn key="ACTIONS">Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.age}</TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button auto flat color="primary" onClick={() => handleUpdate(user)}>
                    Update
                  </Button>
                  <Button auto flat color="error" onClick={() => handleDelete(user.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementTable;

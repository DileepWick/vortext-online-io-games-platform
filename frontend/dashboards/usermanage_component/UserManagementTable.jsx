import React, { useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Avatar } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";

const UserManagementTable = ({ users, setUsers }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPlayerType, setSelectedPlayerType] = useState("All");
  const rowsPerPage = 8;

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedPlayerType === "All" || user.playerType === selectedPlayerType)
    );
  }, [users, searchQuery, selectedPlayerType]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [page, filteredUsers]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
  };
  const handlePlayerTypeSelect = (playerType) => {
    setSelectedPlayerType(playerType);
    setPage(1);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8098/users/profile/update/${selectedUser._id}`,
        selectedUser
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id ? response.data : user
        )
      );
      setEditModalOpen(false);
      toast.success("User updated successfully", {
        style: { fontFamily: "Rubik" },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user", {
        style: { fontFamily: "Rubik" },
      });
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8098/users/delete/${selectedUser._id}`
      );
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== selectedUser._id)
      );
      setDeleteModalOpen(false);
      toast.success("User deleted successfully", {
        style: { fontFamily: "Rubik" },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user", {
        style: { fontFamily: "Rubik" },
      });
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          className="ml-2 font-primaryRegular w-48 sm:w-64"
          placeholder="Search by username..."
          startContent={<SearchIcon />}
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
        />
        <Dropdown>
          <DropdownTrigger>
            <Button light>
              {selectedPlayerType === "All"
                ? "Filter by Player Type"
                : selectedPlayerType}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Player Type Selection"
            onAction={(key) => handlePlayerTypeSelect(key)}
          >
            <DropdownItem key="All">All</DropdownItem>
            <DropdownItem key="Kid">Kid</DropdownItem>
            <DropdownItem key="Teenager">Teenager</DropdownItem>
            <DropdownItem key="Adult">Adult</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Table
        aria-label="User Management Table"
        className="font-primaryRegular"
        bottomContent={
          <div className="flex w-full justify-center font-primaryRegular">
            <Pagination
              isCompact
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
          <TableColumn>Fullname</TableColumn>
          <TableColumn>Profile Image</TableColumn>
          <TableColumn>Username</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Age</TableColumn>
          <TableColumn>Player Type</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.firstname + " " + user.lastname}</TableCell>
              <TableCell>
                <Avatar src={user.profilePic} />
              </TableCell>

              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.age}</TableCell>
              <TableCell>{user.playerType}</TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    auto
                    flat
                    color="primary"
                    onClick={() => openEditModal(user)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="ghost"
                    color="danger"
                    onClick={() => openDeleteModal(user)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              label="Username"
              value={selectedUser?.username || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, username: e.target.value })
              }
            />
            <Input
              fullWidth
              label="Email"
              value={selectedUser?.email || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
            />
            <Input
              fullWidth
              label="Age"
              type="number"
              value={selectedUser?.age || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, age: e.target.value })
              }
            />
            <Input
              fullWidth
              label="Player Type"
              value={selectedUser?.playerType || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, playerType: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="error" flat onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleUpdate}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Delete User</ModalHeader>
          <ModalBody>
            Are you sure you want to delete {selectedUser?.username}?
          </ModalBody>
          <ModalFooter>
            <Button
              color="error"
              flat
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleDelete}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserManagementTable;

import React, { useState, useEffect } from "react";
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
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";

const DeveloperInfoTable = () => {
  const [approvedDevelopers, setApprovedDevelopers] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(4);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchApprovedDevelopers();
  }, []);

  const fetchApprovedDevelopers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8098/users/approvedDevelopers"
      );
      setApprovedDevelopers(response.data.approvedDevelopers);
    } catch (error) {
      console.error("Error fetching approved developers:", error);
      toast.error("Failed to fetch approved developers. Please try again later.");
    }
  };

  const paginatedItems = approvedDevelopers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const openEditModal = (developer) => {
    setSelectedDeveloper(developer);
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8098/users/developers/update/${selectedDeveloper._id}`,
        selectedDeveloper
      );
      setEditModalOpen(false);
      fetchApprovedDevelopers(); // Refresh the list
      toast.success("Developer updated successfully");
    } catch (error) {
      console.error("Error updating developer:", error);
      toast.error("Failed to update the developer. Please try again later.");
    }
  };

  const openDeleteModal = (developer) => {
    setSelectedDeveloper(developer);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8098/users/developers/delete/${selectedDeveloper._id}`);
      setDeleteModalOpen(false);
      setApprovedDevelopers((prevDevelopers) =>
        prevDevelopers.filter((dev) => dev._id !== selectedDeveloper._id)
      );
      toast.success("Developer deleted successfully");
    } catch (error) {
      console.error("Error deleting developer:", error);
      toast.error("Failed to delete the developer. Please try again later.");
    }
  };

  return (
    <div>
      <Table
        aria-label="Approved Developers Table"
        className="font-primaryRegular"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              loop
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(approvedDevelopers.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>FULL NAME</TableColumn>
          <TableColumn>USERNAME</TableColumn>
          <TableColumn>PROFILE PICTURE</TableColumn>
          <TableColumn>BIRTHDAY</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>

        <TableBody className="text-black">
          {paginatedItems.map((developer) => (
            <TableRow key={developer._id} className="text-black">
              <TableCell>{`${developer.firstname || ''} ${developer.lastname || ''}`}</TableCell>
              <TableCell>{developer.username}</TableCell>
              <TableCell>
                <img src={developer.profilePic} alt="Profile" width="50" height="50" />
              </TableCell>
              <TableCell>
                {new Date(developer.birthday).toLocaleDateString()}
              </TableCell>
              <TableCell>{developer.email}</TableCell>
              <TableCell>
                <Button
                  onClick={() => openEditModal(developer)}
                  color="primary"
                >
                  Update
                </Button>
                <Button
                  onClick={() => openDeleteModal(developer)}
                  color="danger"
                  variant="ghost"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Edit Developer</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              label="Username"
              value={selectedDeveloper?.username || ""}
              onChange={(e) =>
                setSelectedDeveloper({ ...selectedDeveloper, username: e.target.value })
              }
            />
            <Input
              fullWidth
              label="Email"
              value={selectedDeveloper?.email || ""}
              onChange={(e) =>
                setSelectedDeveloper({ ...selectedDeveloper, email: e.target.value })
              }
            />
            <Input
              fullWidth
              label="First Name"
              value={selectedDeveloper?.firstname || ""}
              onChange={(e) =>
                setSelectedDeveloper({ ...selectedDeveloper, firstname: e.target.value })
              }
            />
            <Input
              fullWidth
              label="Last Name"
              value={selectedDeveloper?.lastname || ""}
              onChange={(e) =>
                setSelectedDeveloper({ ...selectedDeveloper, lastname: e.target.value })
              }
            />
            <Input
              fullWidth
              label="Birthday"
              type="date"
              value={selectedDeveloper?.birthday ? new Date(selectedDeveloper.birthday).toISOString().split('T')[0] : ""}
              onChange={(e) =>
                setSelectedDeveloper({ ...selectedDeveloper, birthday: e.target.value })
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
          <ModalHeader>Delete Developer</ModalHeader>
          <ModalBody>
            Are you sure you want to delete {selectedDeveloper?.username}?
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

export default DeveloperInfoTable;
import React, { useState } from "react";
import axios from "axios";
import { Button, Modal, Input } from "@nextui-org/react";

const UpdateUser = ({ user, onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    username: user.username,
    email: user.email,
    age: user.age,
    playerType: user.playerType,
  });

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  const handleInputChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:8098/users/${user.id}`, updatedUser);
      if (response.status === 200) {
        onUpdate();
        closeModal();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <>
      <Button auto flat color="primary" onClick={openModal}>
        Update
      </Button>
      <Modal closeButton open={visible} onClose={closeModal}>
        <Modal.Header>
          <h3>Update User</h3>
        </Modal.Header>
        <Modal.Body>
          <Input
            name="username"
            label="Username"
            value={updatedUser.username}
            onChange={handleInputChange}
            fullWidth
          />
          <Input
            name="email"
            label="Email"
            value={updatedUser.email}
            onChange={handleInputChange}
            fullWidth
          />
          <Input
            name="age"
            label="Age"
            type="number"
            value={updatedUser.age}
            onChange={handleInputChange}
            fullWidth
          />
          <Input
            name="playerType"
            label="Player Type"
            value={updatedUser.playerType}
            onChange={handleInputChange}
            fullWidth
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={closeModal}>
            Cancel
          </Button>
          <Button auto onClick={handleUpdate}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdateUser;

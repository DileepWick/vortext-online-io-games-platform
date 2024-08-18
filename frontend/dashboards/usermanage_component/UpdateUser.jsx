import React, { useState } from "react";
import axios from "axios";
import { Button, Modal, Input } from "@nextui-org/react";

const UpdateUser = ({ user, refreshUsers }) => {
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [age, setAge] = useState(user.age);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8098/users/${user.id}`, {
        username,
        email,
        age,
      });
      refreshUsers(); // Refresh the user list
      setVisible(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <>
      <Button size="sm" color="warning" onPress={() => setVisible(true)}>
        Update
      </Button>
      <Modal open={visible} onClose={() => setVisible(false)}>
        <Modal.Header>
          <h4>Update User</h4>
        </Modal.Header>
        <Modal.Body>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={() => setVisible(false)}>
            Cancel
          </Button>
          <Button auto onPress={handleUpdate}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdateUser;

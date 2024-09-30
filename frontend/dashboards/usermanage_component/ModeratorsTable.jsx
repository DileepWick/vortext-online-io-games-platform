import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/react";


const ModeratorsTable = () => {
  const [moderators, setModerators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModerators = async () => {
      try {
        const response = await axios.get('http://localhost:8098/users/moderators');
        setModerators(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch moderators');
        setIsLoading(false);
      }
    };

    fetchModerators();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    
    <Table aria-label="Moderators table" className="text-black">
      <TableHeader>
        <TableColumn>USERNAME</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>ROLE</TableColumn>
      </TableHeader>
      <TableBody className="text-black">
        {moderators.map((moderator) => (
          <TableRow key={moderator._id}>
            <TableCell>{moderator.username}</TableCell>
            <TableCell>{moderator.email}</TableCell>
            <TableCell>{moderator.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ModeratorsTable;
import React, { useState, useEffect, useMemo } from "react";
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
  Button,
  User
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";

const API_BASE_URL = "http://localhost:8098";

const DevFunds = () => {
  const [developerData, setDeveloperData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 7; // Number of rows per page

  useEffect(() => {
    const fetchDeveloperData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/users/alldevelopers`);
        if (response.data) {
          setDeveloperData(response.data.developers); // Adjust according to your API response
        } else {
          setError("No developer data found");
        }
      } catch (error) {
        console.error("Error fetching developer data:", error);
        setError("Error fetching developer data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeveloperData();
  }, []);

  // Handle search filter
  const filteredDevelopers = useMemo(() => {
    return developerData.filter((developer) =>
      developer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [developerData, searchQuery]);

  // Pagination logic
  const currentPageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDevelopers.slice(start, end);
  }, [page, filteredDevelopers]);

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to the first page when search changes
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
  };

  if (isLoading) {
    return <div>Loading developer data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Developer Funds</h2>

      <Input
        className="ml-2 mb-4"
        placeholder="Search by Developer Name..."
        startContent={<SearchIcon />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />

      <Table
        isHeaderSticky
        aria-label="Developer Funds Table"
        bottomContent={
          <div className="flex justify-center">
            <Pagination
              page={page}
              total={Math.ceil(filteredDevelopers.length / rowsPerPage)}
              onChange={(newPage) => setPage(newPage)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>FUNDS (Rs.)</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>

        <TableBody>
          {currentPageData.map((developer) => (
            <TableRow key={developer.id}>
              <TableCell>{developer.firstname || "N/A"}</TableCell>
              <TableCell>{developer.email || "N/A"}</TableCell>
             {/* <TableCell>{developer.funds || "N/A"}</TableCell>*/}
              <TableCell>
                <Button variant="ghost" color="primary">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DevFunds;

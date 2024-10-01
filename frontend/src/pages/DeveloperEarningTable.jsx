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
} from "@nextui-org/react";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import useAuthCheck from "../utils/authCheck";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";

const DeveloperIncomeTable = () => {

useAuthCheck();
const token = getToken();
const userId = getUserIdFromToken(token);

  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 4; // Adjust rows per page if needed

  // Fetch developer profile data
  const getTableData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8098/users/profile/${userId }`
      );
      if (response.data && response.data.profile) {
        setTableData([response.data.profile]); // Wrap in array for consistent handling
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  // Search filter (search by email)
  const filteredItems = useMemo(() => {
    return tableData.filter((profile) =>
      profile.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tableData, searchQuery]);

  // Pagination logic
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to page 1 when search changes
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
  };

  return (
    <div>
      <Input
        className="ml-2 font-primaryRegular w-48 sm:w-64"
        placeholder="Search by email..."
        startContent={<SearchIcon />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <Table
        isHeaderSticky
        aria-label="Developer profile table"
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
              total={Math.ceil(filteredItems.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="PROFILE_PIC">Profile Picture</TableColumn>
          <TableColumn key="EMAIL">Email</TableColumn>
          <TableColumn key="CREATED_AT">Created At</TableColumn>
          <TableColumn key="INCOME">Income</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((profile) => (
            <TableRow key={profile._id}>
              <TableCell>
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
              </TableCell>
              <TableCell>{profile.email}</TableCell>
              <TableCell>{new Date(profile.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>Rs. {profile.developerAttributes.income}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeveloperIncomeTable;

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { SearchIcon } from "../../src/assets/icons/SearchIcon";
import { API_BASE_URL } from "../../src/utils/getAPI";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
} from "@nextui-org/react";
import axios from "axios";



const ReviewTable = () => {
  const [tableData, setTableData] = useState([]);
  // const [gameNames, setGameNames] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const getTableData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ratings/getallratings`);
      if (response.data) {
        setTableData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  const deleteRating = async (ratingId) => {
    console.log("Deleted Function called.Rating ID to delete:", ratingId);
    try {
      await axios.delete(`${API_BASE_URL}/ratings/game/${ratingId}`);
      getTableData();
      console.log("Rating deleted successfully");
      toast.success("Rating deleted successfully");
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast.error("Error deleting rating");
    }
  };

  // const getGameNameById =async (gameId) =>{

  //   try{
  //     const gameName = await axios.get(`${API_BASE_URL}/games/getgamebyid/${gameId}`);
  //     console.log(gameName.data.title);
  //     return gameName.data.title;
  //   }catch(error){
  //     console.error("Error fetching data:", error);
  //   }

  // }

  // useEffect(() => {
  //   const fetchGameNames = async () => {
  //     const names = {};
  //     for (const item of tableData) {
  //       if (item.game && !gameNames[item.game]) {
  //         const name = await getGameNameById(item.game);
  //         names[item.game] = name;
  //       }
  //     }
  //     setGameNames((prevNames) => ({ ...prevNames, ...names }));
  //   };

  //   if (tableData.length > 0) {
  //     fetchGameNames();
  //   }
  // }, [tableData]);

  // useEffect(()=>{
  //   console.log("Game names",gameNames);
  // },[gameNames]);
  const filteredItems = useMemo(() => {
    return tableData.filter((item) =>
      item.game?.AssignedGame?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [tableData, searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    console.log("Table Data...", tableData);
  }, [tableData]);

  return (
    <div>
      <Input
        className="ml-2 font-primaryRegular w-48 sm:w-64"
        placeholder="Search by GAME . . ."
        startContent={<SearchIcon />}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <Table
        isHeaderSticky
        aria-label="Example table with client-side pagination"
        className="font-primaryRegular "
        bottomContent={
          <div className="flex w-full justify-center font-primaryRegular">
            {/* Pagination component can be added here */}
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="GAME">GAME</TableColumn>
          <TableColumn key="USERNAME">USERNAME</TableColumn>
          <TableColumn key="USEREMAIL">USER EMAIL</TableColumn>
          <TableColumn key="REVIEW">REVIEW</TableColumn>
          <TableColumn key="DATE">DATE</TableColumn>
          <TableColumn key="VIEW">VIEW</TableColumn>
          <TableColumn key="DELETE">DELETE</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item._id} style={{ color: "black" }}>
              <TableCell>{item?.game?.AssignedGame?.title || "N/A"}</TableCell>
              <TableCell>{item?.user.username || "N/A"}</TableCell>

              <TableCell>{item?.user.email || "N/A"}</TableCell>
              <TableCell>{item?.rating || "N/A"}</TableCell>
              <TableCell>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Link to={`/game/${item?.game?._id}`}>
                  <Button variant="ghost" color="primary">
                    View
                  </Button>
                </Link>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  color="danger"
                  onClick={() => {
                    deleteRating(item?._id);
                  }}
                >
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

export default ReviewTable;

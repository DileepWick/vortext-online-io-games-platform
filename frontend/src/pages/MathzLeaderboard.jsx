import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Pagination,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { API_BASE_URL } from "../utils/getAPI";
import Header from "../components/header";
import Footer from "../components/footer";
import { BackgroundBeamsWithCollision } from "../components/ui/BackgroundBeamsWithCollision";
import useAuthCheck from "../utils/authCheck";
import Loader from "../components/Loader/loader";

const Leaderboard = () => {
  useAuthCheck();
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(Object.keys(leaderboards)[0]); // Default to the first difficulty
  const playersPerPage = 5;

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/mathzblaster/leaderboard`
        );
        // Limit to top 100 players for each difficulty
        const limitedLeaderboards = Object.fromEntries(
          Object.entries(response.data.leaderboards).map(([key, value]) => [
            key,
            value.slice(0, 100),
          ])
        );
        setLeaderboards(limitedLeaderboards);
      } catch (err) {
        setError("Failed to fetch leaderboards");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);

        const response = await axios.get(`${API_BASE_URL}/users/allusers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const users = response.data.allUsers;
        if (Array.isArray(users)) {
          const currentUserData = users.find((user) => user._id === userId);

          if (currentUserData) {
            setCurrentUser(currentUserData);
          } else {
            console.error("Current user not found");
          }
        } else {
          console.error("Expected an array of users but got:", users);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-foreground">
      <Header />
      <div className="relative bg-foreground">
        {/* The title with a higher z-index */}
        <div className="absolute z-10 top-0 left-1/2 transform -translate-x-1/2 mt-8">
          <h2 className="text-5xl font-bold text-black bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
            Mathz Blaster Leaderboard
          </h2>
        </div>

        <BackgroundBeamsWithCollision>
          <Tabs
            placement="start"
            color="secondary"
            aria-label="Difficulty Leaderboards"
            selectedKey={activeTab} // Track the active tab
            onSelectionChange={(key) => {
              setActiveTab(key); // Set the new active difficulty
              setCurrentPage(1); // Reset to the first page
            }}
          >
            {Object.entries(leaderboards).map(([difficulty, scores]) => (
              <Tab
                key={difficulty}
                title={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              >
                <Card>
                  <CardBody>
                    <LeaderboardTable
                      scores={scores.slice(
                        (currentPage - 1) * playersPerPage,
                        currentPage * playersPerPage
                      )}
                      currentUser={currentUser}
                      startRank={(currentPage - 1) * playersPerPage + 1}
                    />
                    <div className="flex justify-center mt-4">
                      <Pagination
                        total={Math.ceil(scores.length / playersPerPage)}
                        initialPage={1}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="secondary"
                      />
                    </div>
                  </CardBody>
                </Card>
              </Tab>
            ))}
          </Tabs>
        </BackgroundBeamsWithCollision>
      </div>
      <Footer />
    </div>
  );
};

const LeaderboardTable = ({ scores, currentUser, startRank }) => {
  const hasScores = Array.isArray(scores) && scores.length > 0;

  return (
    <div
      style={{
        minWidth: "600px", // Set a minimum width for the table
        maxWidth: "100%", // Ensure it doesn't go beyond the container width
        height: "350px", // Set a fixed height for 5 players
        overflowY: "auto", // Allow vertical scrolling if content exceeds the height
        overflowX: "hidden", // Prevent horizontal scrolling
      }}
    >
      <Table aria-label="Leaderboard table" className="w-full">
        <TableHeader className="bg-foreground">
          <TableColumn>RANK</TableColumn>
          <TableColumn>PLAYER</TableColumn>
          <TableColumn>SCORE</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No scores available">
          {hasScores
            ? scores.map((score, index) => {
                return (
                  <TableRow
                    key={score._id}
                    className={
                      currentUser && score.userId._id === currentUser._id
                        ? "bg-yellow-200 font-bold"
                        : ""
                    }
                  >
                    <TableCell>{startRank + index}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar
                          src={
                            score.userId.profilePic ||
                            "https://res.cloudinary.com/dhcawltsr/image/upload/v1719572309/user_swzm7h.webp"
                          }
                          alt={score.userId.username}
                          size="sm"
                          className="mr-2"
                        />
                        <span className="truncate max-w-[200px]">
                          {score.userId.username}
                          {currentUser && score.userId._id === currentUser._id
                            ? " (you)"
                            : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{score.highScore}</TableCell>
                  </TableRow>
                );
              })
            : // Optional: Render empty rows if no scores
              null}
        </TableBody>
      </Table>
    </div>
  );
};

export default Leaderboard;

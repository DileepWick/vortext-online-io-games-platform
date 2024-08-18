import React, { useState } from "react";
import { Tabs, Tab, Card, Button, Input, Table } from "@nextui-org/react";
import Header from "../components/header"; // Adjust the import path as needed
import { Bar, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";

const SessionHistory = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy data for example purposes
  const users = [
    { id: 1, name: "User1", totalPlayTime: "15h", gamesPlayed: { Game1: "5h", Game2: "10h" } },
    { id: 2, name: "User2", totalPlayTime: "25h", gamesPlayed: { Game1: "10h", Game3: "15h" } },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* Include the header */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center p-4 font-primaryRegular bg-gray-100">
          <Tabs
            aria-label="Session Tabs"
            className="flex-1"
            onSelectionChange={setActiveTab}
            selectedKey={activeTab}
            size="lg"
            color="primary"
          >
            <Tab key="tab1" title="Overview" />
            <Tab key="tab2" title="User Sessions" />
            <Tab key="tab3" title="Games Stats" />
            <Tab key="tab4" title="Manage History" />
          </Tabs>
        </div>
        <div className="p-4 flex-1">
          {activeTab === "tab1" && (
            <Card>
              <Card.Body>
                <h2 className="text-xl font-bold">Session Overview</h2>
                {/* Bar Chart for Play Time */}
                <Bar
                  data={{
                    labels: ["Game1", "Game2", "Game3"],
                    datasets: [{
                      label: "Play Time",
                      data: [5, 10, 15],
                      backgroundColor: ["rgba(75, 192, 192, 0.2)"],
                      borderColor: ["rgba(75, 192, 192, 1)"],
                      borderWidth: 1,
                    }],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </Card.Body>
            </Card>
          )}
          {activeTab === "tab2" && (
            <div>
              <Input
                clearable
                underlined
                placeholder="Search for a user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <Table
                aria-label="User Sessions"
                css={{ height: "auto", minWidth: "100%" }}
              >
                <Table.Header>
                  <Table.Column>User</Table.Column>
                  <Table.Column>Total Play Time</Table.Column>
                  <Table.Column>Details</Table.Column>
                </Table.Header>
                <Table.Body>
                  {filteredUsers.map(user => (
                    <Table.Row key={user.id}>
                      <Table.Cell>{user.name}</Table.Cell>
                      <Table.Cell>{user.totalPlayTime}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          onClick={() => alert(`Showing details for ${user.name}`)}
                        >
                          View Details
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
          {activeTab === "tab3" && (
            <Card>
              <Card.Body>
                <h2 className="text-xl font-bold">Games Stats</h2>
                {/* Doughnut Chart for Games Stats */}
                <Doughnut
                  data={{
                    labels: ["Game1", "Game2", "Game3"],
                    datasets: [{
                      label: "Play Time",
                      data: [5, 10, 15],
                      backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                      borderColor: ["rgba(255, 99, 132, 1)"],
                      borderWidth: 1,
                    }],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </Card.Body>
            </Card>
          )}
          {activeTab === "tab4" && (
            <div>
              <Button
                color="error"
                auto
                onClick={() => alert('All user session history deleted.')}
                className="mb-4"
              >
                Delete All Session History
              </Button>
              <Table
                aria-label="Manage Session History"
                css={{ height: "auto", minWidth: "100%" }}
              >
                <Table.Header>
                  <Table.Column>User</Table.Column>
                  <Table.Column>Action</Table.Column>
                </Table.Header>
                <Table.Body>
                  {filteredUsers.map(user => (
                    <Table.Row key={user.id}>
                      <Table.Cell>{user.name}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          color="error"
                          onClick={() => alert(`Deleting session history for ${user.name}`)}
                        >
                          Delete History
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;

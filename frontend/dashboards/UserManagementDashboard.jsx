import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab } from "@nextui-org/react";
import Header from "../src/components/header";
import UserManagementTable from "./usermanage_component/UserManagementTable";
import UserStats from "./usermanage_component/Userstats"; // Import UserStats component

const UserManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [users, setUsers] = useState([]);
  const [moderators, setModerators] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8098/users/allusers");
        setUsers(response.data.allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchModerators = async () => {
      try {
        const response = await axios.get("http://localhost:8098/moderators/allmoderators");
        setModerators(response.data.allModerators);
      } catch (error) {
        console.error("Error fetching moderators:", error);
      }
    };

    fetchUsers();
    fetchModerators();
  }, []);

  return (
    <div className="flex w-full flex-col">
      <Header />
      <h1>User Management Dashboard</h1>
      <div className="flex items-center p-4 font-primaryRegular">
        <Tabs
          aria-label="User Management Tabs"
          className="flex-1"
          onSelectionChange={setActiveTab}
          selectedKey={activeTab}
          size="lg"
          color="primary"
        >
          <Tab key="tab1" title="User Statistics" /> {/* Updated title */}
          <Tab key="tab2" title="Manage Users" />
          <Tab key="tab3" title="Manage Moderators" />
          <Tab key="tab4" title="Tab 4" />
        </Tabs>
      </div>
      <div className="p-4">
        {/* Tab 1: User Stats */}
        {activeTab === "tab1" && (
          <div>
            
            <UserStats users={users} /> {/* Render UserStats component */}
          </div>
        )}

        {/* Tab 2: Manage Users */}
        {activeTab === "tab2" && (
          <div>
            
            <UserManagementTable
              users={users}
              setUsers={setUsers}
              userType="user"
            />
          </div>
        )}

        {/* Tab 3: Manage Moderators */}
        {activeTab === "tab3" && (
          <div>
            <h2>Moderators</h2>
            <UserManagementTable
              users={moderators}
              setUsers={setModerators}
              userType="moderator"
            />
          </div>
        )}

        {/* Tab 4: Placeholder */}
        {activeTab === "tab4" && <div>Content for Tab 4</div>}
      </div>
    </div>
  );
};

export default UserManagementDashboard;

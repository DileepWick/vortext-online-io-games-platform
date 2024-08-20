import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab } from "@nextui-org/react";
import Header from "../src/components/header";
import UserManagementTable from "./usermanage_component/UserManagementTable";

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
          <Tab key="tab1" title="Manage Users" />
          <Tab key="tab2" title="Manage Moderators" />
          <Tab key="tab3" title="Tab 3" />
          <Tab key="tab4" title="Tab 4" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "tab1" && (
          <div>
            <h2>Users</h2>
            <UserManagementTable
              users={users}
              setUsers={setUsers}
              userType="user"
            />
          </div>
        )}
        {activeTab === "tab2" && (
          <div>
            <h2>Moderators</h2>
            <UserManagementTable
              users={moderators}
              setUsers={setModerators}
              userType="moderator"
            />
          </div>
        )}
        {activeTab === "tab3" && <div>Content for Tab 3</div>}
        {activeTab === "tab4" && <div>Content for Tab 4</div>}
      </div>
    </div>
  );
};

export default UserManagementDashboard;

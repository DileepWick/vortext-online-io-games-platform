import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab } from "@nextui-org/react";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import UserManagementTable from "./usermanage_component/UserManagementTable";
import UserStats from "./usermanage_component/Userstats";
import DeveloperDashboard from "./usermanage_component/DeveloperDashboard";
import DeveloperInfoTable from "./usermanage_component/DeveloperInfoTable";
import useAuthCheck from "../src/utils/authCheck";
import ModeratorsTable from "./usermanage_component/ModeratorsTable";




const UserManagementDashboard = () => {

// Authenticate user
useAuthCheck();

  const [activeTab, setActiveTab] = useState("tab1");
  const [users, setUsers] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [developers, setDevelopers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8098/users/allusers");
        setUsers(response.data.allUsers);
      } catch (error) {
        console.error("Error fetching users:", error.response || error.message || error);
      }
    };

    const fetchModerators = async () => {
      try {
        const response = await axios.get("http://localhost:8098/moderators/allmoderators");
        setModerators(response.data.allModerators);
      } catch (error) {
        console.error("Error fetching moderators:", error.response || error.message || error);
      }
    };

    const fetchDevelopers = async () => {
      try {
        const response = await axios.get("http://localhost:8098/developers/requests");
        setDevelopers(response.data);
      } catch (error) {
        console.error("Error fetching developers:", error.response || error.message || error);
      }
    };

    fetchUsers();
    fetchModerators();
    fetchDevelopers();
  }, []);

  return (
    <div className="flex w-full flex-col" style={{ backgroundColor: '#d4ebf2' }}>
      <Header />
      
      <div className="flex items-center p-4 font-primaryRegular">
        <Tabs
          aria-label="User Management Tabs"
          className="flex-1"
          onSelectionChange={setActiveTab}
          selectedKey={activeTab}
          size="lg"
          color="primary"
          style={{ fontSize: '1.1rem', padding: '20px 30px' }}
        >
          <Tab key="tab1" title="User Statistics"style={{ padding: '20px 30px', fontSize: '1.1rem' }}/>
          <Tab key="tab2" title="Manage Users" style={{ padding: '20px 30px', fontSize: '1.1rem' }}/>
          <Tab key="tab3" title="pending Developers" style={{ padding: '20px 30px', fontSize: '1.1rem' }}/>
          <Tab key="tab4" title="Manage Developers" style={{ padding: '20px 30px', fontSize: '1.1rem' }}/>
          <Tab key="tab5" title=" Moderators" style={{ padding: '20px 30px', fontSize: '1.1rem' }} />
          
          
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "tab1" && (
          <div>
            <UserStats users={users} />
          </div>
        )}

        {activeTab === "tab2" && (
          <div>
            <h2></h2>
            <UserManagementTable
              users={users}
              setUsers={setUsers}
              userType="user"
            />
          </div>
        )}

        

        {activeTab === "tab3" && (
          <div>
            <h2></h2>
            <DeveloperDashboard developers={developers} />
          </div>
        )}
        {activeTab === "tab4" && (
          <div>
            <h2></h2>
            <DeveloperInfoTable developers={developers} />
          </div>
        )}
        {activeTab === "tab5" && (
            <div>
              <h2></h2>
              <ModeratorsTable moderators={moderators} />
            </div>
          )}
        
      </div>
      <Footer/>
    </div>
  );
};

export default UserManagementDashboard;

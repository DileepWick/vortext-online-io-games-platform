import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../src/utils/getToken";
import { getUserIdFromToken } from "../src/utils/user_id_decoder";

// Components
import Header from "../src/components/header";

// Courier Components
import CourierCurrentOrdersTable from "./Orders_Components/courier_current_orders";
import CourierCompletedOrdersTable from "./Orders_Components/Courier_Completed_Orders";

// Next UI
import {
  Tabs,
  Tab,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";

const CourierDashBoard = () => {
  const [user, setUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [activeTab, setActiveTab] = useState("stats");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      const userId = getUserIdFromToken(token);

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:8098/users/profile/${userId}`
          );
          setUser(response.data.profile);
          setSelectedStatus(response.data.profile.status);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, []);

  // Handle status change
  const handleChangeStatus = async (newStatus) => {
    const token = getToken();
    const userId = getUserIdFromToken(token);

    try {
      await axios.put(`http://localhost:8098/users/changeStatus/${userId}`, {
        newStatus,
      });
      setUser((prevUser) => ({ ...prevUser, status: newStatus }));
      setSelectedStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative">
        <Header />
      </div>
      <div className="flex justify-between p-4 font-primaryRegular">
        <div className="flex-1">
          <h1 className="text-lg font-bold">Courier Dashboard</h1>
        </div>
        <div className="flex flex-col space-y-4 mt-4">
          {user && (
            <>
              <Dropdown>
                <DropdownTrigger>
                  {selectedStatus === "Free" ? (
                    <Chip color="success" variant="dot">
                      Currently {selectedStatus}
                    </Chip>
                  ) : selectedStatus === "Working" ? (
                    <Chip color="warning" variant="dot">
                      Currently {selectedStatus}
                    </Chip>
                  ) : (
                    <Chip color="danger" variant="dot">
                      Currently {selectedStatus}
                    </Chip>
                  )}
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Change Status"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  onAction={(key) => handleChangeStatus(key)}
                  className="font-primaryRegular"
                >
                  <DropdownItem key="Free">
                    <Chip color="success" variant="dot">
                      Free
                    </Chip>
                  </DropdownItem>
                  <DropdownItem key="Working">
                    <Chip color="warning" variant="dot">
                      Working
                    </Chip>
                  </DropdownItem>
                  <DropdownItem key="Not available">
                    <Chip color="danger" variant="dot">
                      Not Available
                    </Chip>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          )}
        </div>
      </div>
      <div className="p-4 font-primaryRegular">
        <Tabs
          aria-label="Courier Tabs"
          className="flex-1"
          onSelectionChange={setActiveTab}
          selectedKey={activeTab}
          size="lg"
          color="primary"
        >
          <Tab key="analytics" title="My Stats" />
          <Tab key="CurrentOrders" title="Current Orders" />
          <Tab key="CompletedOrders" title="Completed" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "analytics" && (
          <>
            <h1>Orders stats</h1>
          </>
        )}
        {activeTab === "CurrentOrders" && (
          <div>
            <CourierCurrentOrdersTable />
          </div>
        )}
        {activeTab === "CompletedOrders" && (
          <div>
            <CourierCompletedOrdersTable />
          </div>
        )}
        {activeTab === "analytics" && <div>Order Analytics</div>}
      </div>
    </div>
  );
};

export default CourierDashBoard;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../src/components/header";
import useAuthCheck from "../src/utils/authCheck";
import { Tabs, Tab } from "@nextui-org/react";
import AllPayments from "./Payment_Management/all_payments";
import Chart from "./Payment_Management/chart";
import GamesSortChart from"./Payment_Management/Games_Sort";



const API_BASE_URL = "http://localhost:8098";

const Payment_Manager = () => {
  useAuthCheck();
  const [activeTab, setActiveTab] = useState("tab1");
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/orderItems`);
        if (response.data && response.data.orderHistory) {
          setTableData(response.data.orderHistory);
        } else {
          setError("No data received from the server");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Header />
      <div className="flex w-full flex-col">
        <div className="flex items-center p-4 font-primaryRegular">
          <Tabs
            aria-label="Order Tabs"
            className="flex-1"
            onSelectionChange={setActiveTab}
            selectedKey={activeTab}
            size="lg"
            color="primary"
          >
            <Tab key="tab1" title="All Order Items" />
            <Tab key="tab2" title="Price Comparison Chart" />
            <Tab key="tab3" title="Most Sold Games" />
            <Tab key="tab4" title="Tab 4" />
          </Tabs>
        </div>
        <div className="p-4">
          {activeTab === "tab1" && <AllPayments />}
          {activeTab === "tab2" && (
            <div className="w-full h-[500px]">
              {isLoading ? (
                <div>Loading chart data...</div>
              ) : error ? (
                <div>{error}</div>
              ) : (
                <Chart data={tableData} />
              )}
            </div>
          )}
           {activeTab === "tab3" && (
            <div className="w-full h-[500px]">
              {isLoading ? (
                <div>Loading chart data...</div>
              ) : error ? (
                <div>{error}</div>
              ) : (
                <GamesSortChart data={tableData} />
              )}
            </div>
          )}
         {activeTab !== "tab1" && activeTab !== "tab2" && activeTab !== "tab3" && (
            <div>{`Content for ${activeTab}`}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment_Manager;
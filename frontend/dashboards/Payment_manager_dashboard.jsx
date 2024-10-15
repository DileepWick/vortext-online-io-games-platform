import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import useAuthCheck from "../src/utils/authCheck";
import { Tabs, Tab } from "@nextui-org/react";
import AllPayments from "../dashboards/Payment_Management/all_payments";
import Chart from "./Payment_Management/chart";
import GamesSortChart from "./Payment_Management/Games_Sort";
import RentalPaymentsDash from "./rentalPaymentsDashboard";
import MostRentedGamesChart from './Payment_Management/MostRentedGamesChart';
import IncomeExpenseAnalysis from './Payment_Management/IncomeExpenseAnalysis';

const API_BASE_URL = "http://localhost:8098";

const Payment_Manager = () => {
  useAuthCheck();
  const [activeTab, setActiveTab] = useState("tab1");
  const [tableData, setTableData] = useState([]);
  const [rentalPayments, setRentalPayments] = useState([]);
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

  useEffect(() => {
    const fetchRentalPayments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/rentalPayments/`);
        if (response.data && response.data.rentalPayments) {
          setRentalPayments(response.data.rentalPayments);
        } else {
          console.error("Unexpected data format from rental payments API");
        }
      } catch (error) {
        console.error("Error fetching rental payments:", error);
      }
    };

    fetchRentalPayments();
  }, []);

  return (
    <div className="bg-white min-h-screen"> {/* Added bg-white and min-h-screen classes */}
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
            <Tab key="tab1" title="Purchased Items" />
            <Tab key="tab2" title="Rentals" />
            <Tab key="tab3" title="Price Comparison Chart" />
            <Tab key="tab4" title="Most Sold Games " />
            <Tab key="tab5" title="Most Rented Games " />
            <Tab key="tab6" title="Income Expense Analysis" />
          </Tabs>
        </div>
        <div className="p-4">
          {activeTab === "tab1" && <AllPayments />}
          {activeTab === "tab2" && <RentalPaymentsDash />}
          {activeTab === "tab3" && (
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
          {activeTab === "tab4" && (
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
          {activeTab === "tab5" && (
            <div className="w-full h-[500px]">
              {isLoading ? (
                <div>Loading chart data...</div>
              ) : error ? (
                <div>{error}</div>
              ) : rentalPayments.length === 0 ? (
                <div>No rental payment data available.</div>
              ) : (
                <MostRentedGamesChart rentalPayments={rentalPayments} />
              )}
            </div>
          )}
          {activeTab === "tab6" && <IncomeExpenseAnalysis />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment_Manager;
import React, { useState, useEffect } from "react";
import Header from "../src/components/header";
import useAuthCheck from "../src/utils/authCheck";
import { Tabs, Tab } from "@nextui-org/react";
import AllPayments from "./Payment_Management/all_payments";

const API_BASE_URL = "http://localhost:8098";

const Payment_Manager = () => {
  useAuthCheck();
  const [activeTab, setActiveTab] = useState("tab1");

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
            <Tab key="tab2" title="Tab 2" />
            <Tab key="tab3" title="Tab 3" />
            <Tab key="tab4" title="Tab 4" />
          </Tabs>
        </div>
        <div className="p-4">
          {activeTab === "tab1" && (
            <>
              <AllPayments/>
            </>
          )}
          {activeTab !== "tab1" && <div>{`Content for ${activeTab}`}</div>}
        </div>
      </div>
    </div>
  );
};

export default Payment_Manager;

import React, { useState} from "react";

// Components
import Header from "../src/components/header";
import CurrentOrdersTable from "./Orders_Components/currentOrdersTable";

// Next UI
import { Tabs, Tab } from "@nextui-org/react";


const OrderManager = () => {
  const [activeTab, setActiveTab] = useState("stats");
  return (
    <div className="flex w-full flex-col">
      <div className="relative">
        <Header />
      </div>
      <div className="flex items-center p-4 font-primaryRegular">
        <Tabs
          aria-label="Blogger Tabs"
          className="flex-1"
          onSelectionChange={setActiveTab}
          selectedKey={activeTab}
          size="lg"
          color="primary"
        >
          <Tab key="analytics" title="Order Analytics" />
          <Tab key="CurrentOrders" title="Current Orders" />
          <Tab key="CompletedOrders" title="Completed Orders" />
          <Tab key="CancelledOrders" title="Cancelled Orders" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "analytics" && (
          <>
            <h1>Orders stats</h1>
          </>
        )}
        {activeTab === "CurrentOrders" && <div><CurrentOrdersTable/></div>}
        {activeTab === "CompletedOrders" && <div>Completed Orders</div>}
        {activeTab === "CancelledOrders" && <div>Cancelled Orders</div>}
      </div>
    </div>
  );
};

export default OrderManager;

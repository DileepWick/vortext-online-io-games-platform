import React, { useState} from "react";

// Components
import Header from "../src/components/header";

//Orders components
import CurrentOrdersTable from "./Orders_Components/currentOrdersTable";
import CanceledOrdersTable from "./Orders_Components/canceledOrderTable";
import OnDeliveryOrdersTable from "./Orders_Components/onDeliverOrdersTable";
import ApprovedOrdersTable from "./Orders_Components/ApprovedOrders";
import CompletedOrdersTable from "./Orders_Components/completedOrdersTable";

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
          <Tab key="CurrentOrders" title="Pending" />
          <Tab key="ApprovedOrders" title="Approved" />
          <Tab key="OnDelivery" title="On Delivery" />
          <Tab key="CompletedOrders" title="Completed" />
          <Tab key="CancelledOrders" title="Cancelled" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "analytics" && (
          <>
            <h1>Orders stats</h1>
          </>
        )}
        {activeTab === "CurrentOrders" && <div><CurrentOrdersTable/></div>}
        {activeTab === "ApprovedOrders" && <div><ApprovedOrdersTable/></div>}
        {activeTab === "OnDelivery" && <div><OnDeliveryOrdersTable/></div>}
        {activeTab === "CompletedOrders" && <div><CompletedOrdersTable/></div>}
        {activeTab === "CancelledOrders" && <div><CanceledOrdersTable/></div>}
        {activeTab === "analytics" && <div>Order Analytics</div>}
      </div>
    </div>
  );
};

export default OrderManager;

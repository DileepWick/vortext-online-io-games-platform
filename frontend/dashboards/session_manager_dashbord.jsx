import React, { useState} from "react";
import Header from "../src/components/header";
import useAuthCheck from "../src/utils/authCheck";



// Next UI
import { Tabs, Tab } from "@nextui-org/react";


const SessionManagerDash = () => {
    useAuthCheck();
  const [activeTab, setActiveTab] = useState("stats");
  return (
    <div>
        <Header/>
        <div className="flex w-full flex-col">
      <div className="relative">
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
          <Tab key="tab1" title="SessionRequests" />
          <Tab key="tab2" title="Tournament Requests" />
          <Tab key="tab3" title="Manage Sessions" />
          <Tab key="tab4" title="Manage Tournaments" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "tab1" && <div>Tab1</div>}
        {activeTab === "tab2" && <div>Tab2</div>}
        {activeTab === "tab3" && <div>Tab3</div>}
        {activeTab === "tab4" && <div>Tab4</div>}
      </div>
    </div>
    </div>
  );
};

export default SessionManagerDash ;

import React, { useState} from "react";



// Next UI
import { Tabs, Tab } from "@nextui-org/react";
import Header from "../src/components/header";


const CommunityDashBoard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  return (
    <><Header/>
    <div className="flex w-full flex-col">
        <h1>Community Dashboard</h1>
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
          <Tab key="tab1" title="Post" />
          <Tab key="tab2" title="Chat" />
          <Tab key="tab3" title="Report" />
          <Tab key="tab4" title="Group" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "tab1" && <div>Tab1</div>}
        {activeTab === "tab2" && <div>Tab2</div>}
        {activeTab === "tab3" && <div>Tab3</div>}
        {activeTab === "tab4" && <div>Tab4</div>}
      </div>
    </div>
    </>
  );
};

export default CommunityDashBoard;

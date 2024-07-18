import React, { useState} from "react";



// Next UI
import { Tabs, Tab } from "@nextui-org/react";


const TemplateDash = () => {
  const [activeTab, setActiveTab] = useState("stats");
  return (
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
          <Tab key="tab1" title="T1" />
          <Tab key="tab2" title="T2" />
          <Tab key="tab3" title="T3" />
          <Tab key="tab4" title="T4" />
        </Tabs>
      </div>
      <div className="p-4">
        {activeTab === "tab1" && <div>Tab1</div>}
        {activeTab === "tab2" && <div>Tab2</div>}
        {activeTab === "tab3" && <div>Tab3</div>}
        {activeTab === "tab4" && <div>Tab4</div>}
      </div>
    </div>
  );
};

export default TemplateDash;

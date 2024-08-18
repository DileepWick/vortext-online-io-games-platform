import React from "react";
import { Card } from "@nextui-org/react";
import Header from "../components/header";

const SessionHistory = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="p-4">
        <Card>
          <Card.Body>
            <h2 className="text-xl font-bold">Session History</h2>
            <p>This is a test card to ensure rendering works.</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SessionHistory;

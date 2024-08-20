import React, { useState } from "react";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import useAuthCheck from "../src/utils/authCheck";
import { Button, Card, CardBody, Input, Select, SelectItem } from "@nextui-org/react";

const SessionManagerDash = () => {
  useAuthCheck();
  const [activeTab, setActiveTab] = useState("manageRentals");
  const [rentalOptions, setRentalOptions] = useState([
    { id: 1, time: "15min", price: 50, game: "Game 1" },
    { id: 2, time: "30min", price: 80, game: "Game 2" },
    { id: 3, time: "1hour", price: 150, game: "Game 1" },
    { id: 4, time: "2hours", price: 250, game: "Game 3" }
  ]);
  const [newOption, setNewOption] = useState({ time: "", price: "", game: "" });
  const [editingId, setEditingId] = useState(null);

  // Mock list of games - replace with actual data from your backend
  const games = ["Game 1", "Game 2", "Game 3", "Game 4"];

  const handleAddOption = () => {
    if (newOption.time && newOption.price && newOption.game) {
      setRentalOptions([...rentalOptions, { ...newOption, id: Date.now() }]);
      setNewOption({ time: "", price: "", game: "" });
    }
  };

  const handleDeleteOption = (id) => {
    setRentalOptions(rentalOptions.filter(option => option.id !== id));
  };

  const handleEditOption = (id) => {
    setEditingId(id);
    const optionToEdit = rentalOptions.find(option => option.id === id);
    setNewOption({ ...optionToEdit });
  };

  const handleUpdateOption = () => {
    setRentalOptions(rentalOptions.map(option => 
      option.id === editingId ? { ...newOption, id: editingId } : option
    ));
    setEditingId(null);
    setNewOption({ time: "", price: "", game: "" });
  };

  const renderManageRentals = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Rental Options</h2>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Time (e.g., 15min)"
          value={newOption.time}
          onChange={(e) => setNewOption({ ...newOption, time: e.target.value })}
        />
        <Input
          placeholder="Price"
          type="number"
          value={newOption.price}
          onChange={(e) => setNewOption({ ...newOption, price: e.target.value })}
        />
        <Select 
          placeholder="Select game"
          value={newOption.game}
          onChange={(e) => setNewOption({ ...newOption, game: e.target.value })}
        >
          {games.map((game) => (
            <SelectItem key={game} value={game}>
              {game}
            </SelectItem>
          ))}
        </Select>
        {editingId ? (
          <Button color="primary" onPress={handleUpdateOption}>Update</Button>
        ) : (
          <Button color="primary" onPress={handleAddOption}>Add</Button>
        )}
      </div>
      <div>
        {rentalOptions.map(option => (
          <div key={option.id} className="flex items-center justify-between mb-2">
            <span>{option.time} - LKR {option.price} - {option.game}</span>
            <div>
              <Button color="secondary" size="sm" onPress={() => handleEditOption(option.id)} className="mr-2">Edit</Button>
              <Button color="danger" size="sm" onPress={() => handleDeleteOption(option.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Player Analytics</h2>
      <p>Total Players: 100</p>
      <p>Active Rentals: 25</p>
      <p>Total Revenue: LKR 10,000</p>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="flex mb-4">
              <Button
                color={activeTab === "manageRentals" ? "primary" : "default"}
                onPress={() => setActiveTab("manageRentals")}
                className="mr-2"
              >
                Manage Rentals
              </Button>
              <Button
                color={activeTab === "analytics" ? "primary" : "default"}
                onPress={() => setActiveTab("analytics")}
              >
                Analytics
              </Button>
            </div>
            {activeTab === "manageRentals" ? renderManageRentals() : renderAnalytics()}
          </CardBody>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SessionManagerDash;
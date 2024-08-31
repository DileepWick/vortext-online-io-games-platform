import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Header from '../components/header';
import Articles from '../pages/articles';
import axios from "axios";
import Footer from "../components/footer";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { User } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { FaHeart, FaRegHeart, FaTrash, FaComments } from "react-icons/fa";
import ComPublic from'../pages/compublic';
import ComPrivate from '../pages/comprivate';

const Community = () => {
  const [view, setView] = useState("public");

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="font-primaryRegular bg-customDark flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Community</h1>
        <div className="flex space-x-4 mb-6">
          <Button
            color={view === "public" ? "primary" : "default"}
            onClick={() => handleViewChange("public")}
          >
            Public
          </Button>
          <Button
            color={view === "private" ? "primary" : "default"}
            onClick={() => handleViewChange("private")}
          >
            Private
          </Button>
        </div>
        {view === "public" ? <ComPublic /> : <ComPrivate />}
      </div>
      <Footer />
    </div>
  );
};

export default Community;
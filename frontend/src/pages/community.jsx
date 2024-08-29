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

const Community = () => {
  const navigate = useNavigate();

  const handlePrivateClick = () => {
    navigate('/private');
  };

  const handlePublicClick = () => {
    navigate('/public');
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community</h1>
        <div className="space-x-4">
          <Button onClick={handlePrivateClick} color="primary">
            Private
          </Button>
          <Button onClick={handlePublicClick} color="secondary">
            Public
          </Button>
        </div>
      </div>
    </>
  );
};

export default Community;
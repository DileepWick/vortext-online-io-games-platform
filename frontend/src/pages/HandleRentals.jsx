import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { toast, Flip } from "react-toastify";
import VideoPlayer from "../components/videoPlayer";
import Header from "../components/header";
import Footer from "../components/footer";
import { Button, Card, CardBody, Chip, Image, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, ScrollShadow } from "@nextui-org/react";

const HandleRentals = () => {
  useAuthCheck();
  const { id } = useParams();
  const navigate = useNavigate();
  const [gameStock, setGameStock] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const rentalOptions = [
    { time: "15min", price: 50 },
    { time: "30min", price: 80 },
    { time: "1hour", price: 150 },
    { time: "2hours", price: 250 }
  ];

  const termsAndConditions = [
    "Rental period starts immediately after payment.",
    "No refunds for unused time.",
    "Game access will be automatically revoked after the rental period.",
    "Users must have a stable internet connection for uninterrupted gameplay.",
    "Violating our terms of service may result in account suspension.",
    "We are not responsible for any data loss during gameplay.",
    "Rented games cannot be transferred to other accounts.",
  ];

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8098/gameStocks/GetStockById/${id}`);
        setGameStock(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  const handleRentClick = () => {
    if (selectedRental) {
      onOpen();
    } else {
      toast.warning("Please select a rental duration.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    }
  };

  const handlePayment = async () => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      // Implement your payment logic here
      toast.success("Rental successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
      onClose();
      navigate('/GamingSessions'); // Assuming you have a library page
    } catch (error) {
      toast.error("Rental failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!gameStock) return <div className="text-center py-8">Game not found</div>;

  return (
    <div className="bg-customDark text-white min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-customDark rounded-lg shadow-lg p-8">
          <h1 className="text-5xl text-white mb-4">
            {gameStock.AssignedGame.title}
            <br />
            <Chip color="primary" radius="none" className="mt-2">
              {gameStock.AssignedGame.RatingPoints} Rating Points ⭐
            </Chip>
          </h1>
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1">
              <VideoPlayer
                videoUrl={gameStock.AssignedGame.TrailerVideo}
                autoPlay
                controls
                muted
                className="w-full h-[400px] object-cover mb-4 shadow-md"
              />
            </div>
            <div className="flex-1 flex">
              <Image
                alt={gameStock.AssignedGame.title}
                className="w-[300px] h-[400px] object-cover rounded-lg shadow-md"
                src={gameStock.AssignedGame.coverPhoto}
              />
              <div className="ml-4 flex-1">
                <h3 className="text-2xl font-semibold mb-4">Terms and Conditions</h3>
                <ScrollShadow className="h-[350px]">
                  <ul className="list-disc pl-5 space-y-2">
                    {termsAndConditions.map((term, index) => (
                      <li key={index} className="text-sm">{term}</li>
                    ))}
                  </ul>
                </ScrollShadow>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl text-editionColor mb-4">About the game</h2>
            <ScrollShadow hideScrollBar className="h-[150px]">
              <p className="text-lg">{gameStock.AssignedGame.Description}</p>
            </ScrollShadow>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {gameStock.AssignedGame.Genre.flatMap((genre) =>
              genre.includes(",") ? genre.split(",") : genre
            ).map((genre, index) => (
              <Chip
                key={index}
                color="primary"
                variant="flat"
                size="sm"
                radius="none"
                className="font-primaryRegular"
              >
                {genre.trim()}
              </Chip>
            ))}
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">Select Rental Duration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {rentalOptions.map((option) => (
                <Card 
                  key={option.time}
                  isPressable
                  isHoverable
                  onPress={() => setSelectedRental(option)}
                  className={`
                    transition-all duration-300 ease-in-out
                    ${selectedRental?.time === option.time 
                      ? 'border-primary border-2 shadow-lg scale-105 bg-primary bg-opacity-20' 
                      : 'border-gray-600 hover:border-gray-400'}
                  `}
                >
                  <CardBody className="text-center">
                    <p className={`text-lg font-bold ${selectedRental?.time === option.time ? 'text-primary' : ''}`}>
                      {option.time}
                    </p>
                    <p className={`text-sm ${selectedRental?.time === option.time ? 'text-primary' : ''}`}>
                      LKR {option.price}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
            <Button
              color="success"
              onPress={handleRentClick}
              className="w-full"
              disabled={!selectedRental}
            >
              Rent Now for LKR {selectedRental?.price || ''}
            </Button>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Rental</ModalHeader>
          <ModalBody>
            <p>You are about to rent {gameStock.AssignedGame.title} for {selectedRental?.time}.</p>
            <p>Price: LKR {selectedRental?.price}</p>
            <p>Please confirm to proceed with the payment.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handlePayment}>
              Confirm and Pay
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Footer />
    </div>
  );
};

export default HandleRentals;
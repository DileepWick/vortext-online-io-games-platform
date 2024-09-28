import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { toast, Flip } from "react-toastify";
import VideoPlayer from "../components/videoPlayer";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ScrollShadow,
  Input, // Add this line
} from "@nextui-org/react";

const HandleRentals = () => {
  useAuthCheck();
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rentalOptions, setRentalOptions] = useState([]);

  const termsAndConditions = [
    "Rental period starts immediately after payment.",
    "No refunds for unused time.",
    "Game access will be automatically revoked after the rental period.",
    "Users must have a stable internet connection for uninterrupted gameplay.",
    "Violating our terms of service may result in account suspension.",
    "We are not responsible for any data loss during gameplay.",
    "Rented games cannot be transferred to other accounts.",
  ];

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cvv: "",
    expiryDate: "",
  });
  const [cardErrors, setCardErrors] = useState({});

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const validateCardDetails = () => {
    const errors = {};
    if (!/^\d{16}$/.test(cardDetails.cardNumber)) {
      errors.cardNumber = "Card number must be 16 digits";
    }
    if (!/^\d{3}$/.test(cardDetails.cvv)) {
      errors.cvv = "CVV must be 3 digits";
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      errors.expiryDate = "Expiry date must be in MM/YY format";
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const fetchRentalTimes = async (gameId) => {
    try {
      const response = await axios.get(
        `http://localhost:8098/rentalDurations/game/${gameId}`
      );
      setRentalOptions(
        response.data.map((option) => ({
          time: option.duration.toString(),
          price: option.price,
        }))
      );
    } catch (err) {
      console.error("Error fetching rental times:", err);
      toast.error("Failed to fetch rental options. Please try again.");
      setRentalOptions([]);
    }
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        // Updated API endpoint
        const response = await axios.get(
          `http://localhost:8098/games/fetchGame/${id}`
        );
        setGame(response.data);
        await fetchRentalTimes(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  const handleRentalSelection = useCallback((option) => {
    setSelectedRental((prevSelected) =>
      prevSelected && prevSelected.time === option.time ? null : option
    );
  }, []);

  const handleRentClick = useCallback(() => {
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
  }, [selectedRental, onOpen]);





  const handlePayment = async () => {
    if (!validateCardDetails()) {
      return;
    }
  
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
  
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
  
      const rentalData = {
        user: userId,
        game: id,
        time: parseInt(selectedRental.time),
        price: parseFloat(selectedRental.price)
      };
  
      console.log("Sending rental data:", rentalData);
  
      // Create the rental
      const rentalResponse = await axios.post(
        "http://localhost:8098/Rentals/createRental",
        rentalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Rental response:", rentalResponse);
  
      if (rentalResponse.status !== 201) {
        throw new Error("Failed to create rental");
      }
  
      // Fetch the latest rental to get the rental ID
      const latestRentalResponse = await axios.get(
        `http://localhost:8098/Rentals/getLatestRental/${userId}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Latest rental response:", latestRentalResponse);
  
      if (latestRentalResponse.status !== 200 || !latestRentalResponse.data._id) {
        throw new Error("Failed to fetch the latest rental ID");
      }
  
      const rentalId = latestRentalResponse.data._id;
  
      // Create the payment
      const paymentData = {
        user: userId,
        game: id,
        rental: rentalId,
        amount: parseFloat(selectedRental.price)
      };
  
      console.log("Sending payment data:", paymentData);
  
      const paymentResponse = await axios.post(
        "http://localhost:8098/rentalPayments/create",
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Payment response:", paymentResponse);
  
      if (paymentResponse.status === 201) {
        toast.success("Payment successful! Game added to your rentals.");
        setIsPaymentModalOpen(false);
        onClose();
        navigate("/GamingSessions");
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      console.error("Error details:", error.response?.data);
      
      // More specific error messages
      if (error.response) {
        if (error.response.status === 400) {
          toast.error("Invalid data submitted. Please check your inputs and try again.");
        } else if (error.response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else if (error.response.status === 404) {
          toast.error("Rental not found. Please try again.");
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later or contact support.");
        } else {
          toast.error(`Operation failed: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your internet connection.");
      } else {
        toast.error(error.message || "Operation failed. Please try again.");
      }
      
      setIsPaymentModalOpen(false);
      onClose();
    }
  };







  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!game) return <div className="text-center py-8">Game not found</div>;

  return (
    <div className="bg-customDark text-white min-h-screen font-primaryRegular">
      <Header />
      <div className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white text-center">
            Rent the Game
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-customDark rounded-lg shadow-lg p-8">
          <h1 className="text-5xl text-white mb-4">
            {game.title}
            <br />
            <Chip color="primary" radius="none" className="mt-2">
              {game.RatingPoints} Rating Points ⭐
            </Chip>
          </h1>
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1">
              <VideoPlayer
                videoUrl={game.TrailerVideo}
                autoPlay
                controls
                muted
                className="w-full h-[400px] object-cover mb-4 shadow-md"
              />
            </div>
            <div className="flex-1 flex">
              <Image
                alt={game.title}
                className="w-[300px] h-[400px] object-cover rounded-lg shadow-md"
                src={game.coverPhoto}
              />
              <div className="ml-4 flex-1">
                <h3 className="text-2xl font-semibold mb-4">
                  Terms and Conditions
                </h3>
                <ScrollShadow className="h-[350px]">
                  <ul className="list-disc pl-5 space-y-2">
                    {termsAndConditions.map((term, index) => (
                      <li key={index} className="text-sm">
                        {term}
                      </li>
                    ))}
                  </ul>
                </ScrollShadow>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl text-editionColor mb-4">About the game</h2>
            <ScrollShadow hideScrollBar className="h-[150px]">
              <p className="text-lg">{game.Description}</p>
            </ScrollShadow>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {game.Genre.flatMap((genre) =>
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
            <h3 className="text-2xl font-semibold mb-4">
              Select Rental Duration
            </h3>
            {rentalOptions.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {rentalOptions.map((option) => (
                    <Card
                      key={option.time}
                      isPressable
                      isHoverable
                      onPress={() => handleRentalSelection(option)}
                      className={`
                        transition-all duration-300 ease-in-out
                        ${
                          selectedRental?.time === option.time
                            ? "border-primary border-2 shadow-lg scale-105 bg-primary bg-opacity-20"
                            : "border-gray-600 hover:border-gray-400"
                        }
                      `}
                    >
                      <CardBody className="text-center">
                        <p
                          className={`text-lg font-bold ${
                            selectedRental?.time === option.time
                              ? "text-primary"
                              : ""
                          }`}
                        >
                          {parseInt(option.time) >= 60
                            ? `${parseInt(option.time) / 60} hour${
                                parseInt(option.time) > 60 ? "s" : ""
                              }`
                            : `${option.time} min`}
                        </p>
                        <p
                          className={`text-sm ${
                            selectedRental?.time === option.time
                              ? "text-primary"
                              : ""
                          }`}
                        >
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
                  Rent Now for LKR {selectedRental?.price || ""}
                </Button>
              </>
            ) : (
              <div className="text-center py-4 bg-gray-800 rounded-lg">
                <p className="text-xl text-yellow-400">
                  This game is not available for rent at the moment.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Please check back later or contact support for more
                  information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rental Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          body: "text-white",
          header: "text-white",
          footer: "text-white",
          base: "bg-gray-800",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-white">Confirm Rental</ModalHeader>
          <ModalBody>
            <p>
              You are about to buy {selectedRental?.time || 10} minutes of
              playtime for {game?.title || "League of Legends"}.
            </p>
            <p>Price: LKR {selectedRental?.price}</p>
            <p>Please confirm to proceed with the payment.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={() => {
              onClose();
              setIsPaymentModalOpen(true);
            }}>
              Proceed to Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        classNames={{
          body: "text-white",
          header: "text-white",
          footer: "text-white",
          base: "bg-gray-800",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-white">Enter Payment Details</ModalHeader>
          <ModalBody>
            <Input
              name="cardNumber"
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={handleCardInputChange}
              error={cardErrors.cardNumber}
            />
            <Input
              name="cvv"
              label="CVV"
              placeholder="123"
              value={cardDetails.cvv}
              onChange={handleCardInputChange}
              error={cardErrors.cvv}
            />
            <Input
              name="expiryDate"
              label="Expiry Date"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={handleCardInputChange}
              error={cardErrors.expiryDate}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsPaymentModalOpen(false)}>
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

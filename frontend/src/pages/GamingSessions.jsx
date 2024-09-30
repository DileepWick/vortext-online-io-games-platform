import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Image, Card, CardBody, Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import { toast, Flip } from "react-toastify";

const GamingSessions = () => {
  useAuthCheck();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [isExtendModalVisible, setIsExtendModalVisible] = useState(false);
  const [rentalOptions, setRentalOptions] = useState([]);
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cvv: "",
    expiryDate: "",
  });
  const [cardErrors, setCardErrors] = useState({});

  const fetchRentals = useCallback(async () => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      const response = await axios.get(
        `http://localhost:8098/Rentals/getRentalsByUser/${userId}`
      );
      setRentals(response.data);
    } catch (err) {
      console.error("Error fetching rentals:", err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const openModal = useCallback((rental) => {
    console.log("Opening modal for rental:", rental);
    setCurrentGame(rental);
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setCurrentGame(null);
  }, []);

  const handleStartSession = useCallback(() => {
    if (currentGame) {
      const rentalTimeInSeconds = convertTimeToSeconds(currentGame.time);
      console.log("Rental time in seconds:", rentalTimeInSeconds);
      navigate(`/RentalGamesEmbed/${encodeURIComponent(currentGame.game.PlayLink)}/${encodeURIComponent(currentGame.game.title)}/${encodeURIComponent(rentalTimeInSeconds || 14400)}/${currentGame._id}`);
    }
    closeModal();
  }, [currentGame, navigate, closeModal]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let timeString = "";
    if (hrs > 0) {
      timeString += `${hrs} hour${hrs > 1 ? 's' : ''} `;
    }
    if (mins > 0 || hrs > 0) {
      timeString += `${mins} minute${mins !== 1 ? 's' : ''} `;
    }
    timeString += `${secs} second${secs !== 1 ? 's' : ''}`;
    
    return timeString.trim();
  };

  const convertTimeToSeconds = (timeString) => {
    if (!timeString) return 14400;
    
    console.log("Original time string:", timeString);

    if (!isNaN(timeString)) {
      const seconds = parseInt(timeString, 10);
      console.log("Parsed as seconds:", seconds);
      return seconds;
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const seconds = (hours * 3600) + (minutes * 60);
      console.log("Parsed as HH:MM format:", seconds);
      return seconds;
    }
    
    const hourMatch = timeString.match(/(\d+)\s*hour/i);
    if (hourMatch) {
      const seconds = parseInt(hourMatch[1], 10) * 3600;
      console.log("Parsed as 'X hours' format:", seconds);
      return seconds;
    }
    
    console.log("Could not parse time, defaulting to 4 hours");
    return 14400;
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
    }
  };

  const openExtendModal = useCallback((rental) => {
    setCurrentGame(rental);
    fetchRentalTimes(rental.game._id);
    setIsExtendModalVisible(true);
  }, []);

  const closeExtendModal = useCallback(() => {
    setIsExtendModalVisible(false);
    setSelectedExtension(null);
  }, []);

  const handleExtensionSelection = useCallback((option) => {
    setSelectedExtension(prevSelected =>
      prevSelected && prevSelected.time === option.time ? null : option
    );
  }, []);

  const openPaymentModal = useCallback(() => {
    if (selectedExtension) {
      setIsExtendModalVisible(false);
      setIsPaymentModalOpen(true);
    } else {
      toast.warning("Please select an extension option.", {
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
  }, [selectedExtension]);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setCardDetails({ cardNumber: "", cvv: "", expiryDate: "" });
    setCardErrors({});
  }, []);

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
  
      // Create the payment
      const paymentData = {
        user: userId,
        game: currentGame.game._id,
        rental: currentGame._id,
        amount: parseFloat(selectedExtension.price)
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
        // Extend rental time
        const extendResponse = await axios.put(
          `http://localhost:8098/Rentals/extendRentalTime/${userId}/${currentGame.game._id}`,
          { 
            additionalTime: parseInt(selectedExtension.time, 10),
            additionalPrice: selectedExtension.price
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (extendResponse.status === 200) {
          toast.success("Payment successful! Rental extended.", {
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
          setIsPaymentModalOpen(false);
          closeExtendModal();
          fetchRentals();
        } else {
          throw new Error("Failed to extend rental");
        }
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      console.error("Error details:", error.response?.data);
      
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
      closeExtendModal();
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-customDark min-h-screen font-sans text-white">
      <Header />
      <div className="relative">
        <div className="container mx-auto p-6">
          <div className="text-2xl font-primaryRegular mb-6">MY RENTED GAMES</div>
          {rentals.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {rentals.map((rental) => (
                <Card
                  key={rental._id}
                  className="relative bg-customDark overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  <Image
                    isBlurred
                    radius="none"
                    alt={rental.game.title}
                    className="w-[200px] h-[200px] object-cover"
                    src={rental.game.coverPhoto}
                  />
                  <CardBody className="p-4">
                    <p className="mb-2 font-primaryRegular text-lg text-white">
                      {rental.game.title}
                    </p>
                    
                    <p className="mb-2 text-sm text-gray-300">
                    Rental Time: {formatTime(rental.time)}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4 font-primaryRegular">
                      {rental.game.Genre && rental.game.Genre.flatMap((genre) =>
                        genre.includes(",") ? genre.split(",") : genre
                      ).map((genre, index) => (
                        <Chip
                          key={index}
                          color="primary"
                          variant="flat"
                          size="sm"
                          className="text-white"
                          radius="none"
                        >
                          {genre.trim()}
                        </Chip>
                      ))}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => openModal(rental)}
                        color="primary"
                        className="font-primaryRegular"
                        radius="none"
                        variant="solid"
                        size="md"
                      >
                        Start Session
                      </Button>
  
                      <Button
                        onClick={() => openExtendModal(rental)}
                        color="secondary"
                        className="font-primaryRegular"
                        radius="none"
                        variant="solid"
                        size="md"
                      >
                        Extend Rental
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <p>No Games in the library</p>
          )}
        </div>
        
        <Modal 
          isOpen={isModalVisible} 
          onClose={closeModal}
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1"><span style={{ color: '#0072F5', fontWeight: 'bold'}}>Start Session</span></ModalHeader>
                <ModalBody>
                  {currentGame ? (
                    <span style={{ color: '#0072F5'}}>
                    <p>Are you sure you want to start a session for {currentGame.game.title}?</p>
                    <p>Rental Time: {currentGame.time}</p>
                    </span>
                  ) : (
                    <p>Loading game details...</p>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleStartSession}>
                    Start Session
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
  
        <Modal isOpen={isExtendModalVisible} onClose={closeExtendModal} backdrop="blur">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <span style={{ color: '#0072F5', fontWeight: 'bold' }}>Extend Rental</span>
            </ModalHeader>
            <ModalBody>
              <p className="text-black">Select an extension period for {currentGame?.game.title}:</p>
              <div className="grid grid-cols-2 gap-4">
                {rentalOptions.map((option) => (
                  <Card
                    key={option.time}
                    isPressable
                    isHoverable
                    onPress={() => handleExtensionSelection(option)}
                    className={`${
                      selectedExtension?.time === option.time
                        ? "border-primary border-2"
                        : "border-gray-600"
                    }`}
                  >
                    <CardBody className="text-center">
                    <p className="font-bold">{formatTime(parseInt(option.time, 10))}</p>
                      <p>LKR {option.price}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={closeExtendModal}>
                Cancel
              </Button>
              <Button color="primary" onPress={openPaymentModal}>
                Confirm and Pay
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
  
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
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
              <Button color="danger" variant="light" onPress={closePaymentModal}>
                Cancel
              </Button>
              <Button color="primary" onPress={handlePayment}>
                Confirm and Pay
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default GamingSessions;
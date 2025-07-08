import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  Image,
  Card,
  CardBody,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import { API_BASE_URL } from "../utils/getAPI";

const CreditCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const PayPalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 14c-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V3.65C2.5 4.18 0 6.6 0 9.5c0 3.03 2.47 5.5 5.5 5.5h3.07c-.07-.32-.07-.66 0-1H7z"></path>
    <path d="M17 9.5c0-2.9-2.5-5.32-5.5-5.85v4.52c1.16.42 2 1.52 2 2.83 0 1.66-1.34 3-3 3H7.07c.07.34.07.68 0 1H10.5c3.03 0 5.5-2.47 5.5-5.5z"></path>
  </svg>
);

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
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1-");
    setCardDetails((prev) => ({
      ...prev,
      cardNumber: formattedValue.slice(0, 19),
    }));
  };

  const handleExpirationDateChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      setCardDetails((prev) => ({ ...prev, expirationDate: value }));
    } else {
      const month = value.slice(0, 2);
      const year = value.slice(2, 4);
      if (parseInt(month) > 12) {
        setCardDetails((prev) => ({ ...prev, expirationDate: `12/${year}` }));
      } else {
        setCardDetails((prev) => ({
          ...prev,
          expirationDate: `${month}/${year}`,
        }));
      }
    }
  };

  const handleRentHistoryClick = () => {
    navigate("/RentHistory");
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCardDetails((prev) => ({ ...prev, cvv: value.slice(0, 3) }));
  };

  const validateForm = () => {
    if (cardDetails.cardNumber.replace(/-/g, "").length !== 16) {
      toast.error("Invalid card number");
      return false;
    }
    if (cardDetails.expirationDate.length !== 5) {
      toast.error("Invalid expiration date");
      return false;
    }
    const [month, year] = cardDetails.expirationDate.split("/");
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      toast.error("Invalid month in expiration date");
      return false;
    }
    // Check if the card is not expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    if (
      parseInt(year) < currentYear ||
      (parseInt(year) === currentYear && parseInt(month) < currentMonth)
    ) {
      toast.error("Card has expired");
      return false;
    }
    if (cardDetails.cvv.length !== 3) {
      toast.error("Invalid CVV");
      return false;
    }
    return true;
  };
  const [cardErrors, setCardErrors] = useState({});

  const fetchRentals = useCallback(async () => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      const response = await axios.get(
        `${API_BASE_URL}/Rentals/getRentalsByUser/${userId}`
      );
      setRentals(response.data);
    } catch (err) {
      console.error(
        "Error fetching rentals:",
        err.response ? err.response.data : err.message
      );
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const openModal = useCallback((rental) => {
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
      navigate(
        `/RentalGamesEmbed/${encodeURIComponent(
          currentGame.game.PlayLink
        )}/${encodeURIComponent(currentGame.game.title)}/${encodeURIComponent(
          rentalTimeInSeconds || 14400
        )}/${currentGame._id}`
      );
    }
    closeModal();
  }, [currentGame, navigate, closeModal]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let timeString = "";
    if (hrs > 0) {
      timeString += `${hrs} hour${hrs > 1 ? "s" : ""} `;
    }
    if (mins > 0 || hrs > 0) {
      timeString += `${mins} minute${mins !== 1 ? "s" : ""} `;
    }
    timeString += `${secs} second${secs !== 1 ? "s" : ""}`;

    return timeString.trim();
  };

  const convertTimeToSeconds = (timeString) => {
    if (!timeString) return 14400;

    if (!isNaN(timeString)) {
      const seconds = parseInt(timeString, 10);
      return seconds;
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const seconds = hours * 3600 + minutes * 60;
      return seconds;
    }

    const hourMatch = timeString.match(/(\d+)\s*hour/i);
    if (hourMatch) {
      const seconds = parseInt(hourMatch[1], 10) * 3600;
      return seconds;
    }

    return 14400;
  };

  const fetchRentalTimes = async (gameId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/rentalDurations/game/${gameId}`
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
    setSelectedExtension((prevSelected) =>
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
    setCardDetails((prev) => ({ ...prev, [name]: value }));
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
    if (paymentMethod === "creditCard" && !validateForm()) {
      return;
    }
    if (paymentMethod === "paypal" && !paypalEmail) {
      toast.error("Please enter your PayPal email");
      return;
    }

    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const paymentData = {
        user: userId,
        game: currentGame.game._id,
        rental: currentGame._id,
        amount: parseFloat(selectedExtension.price),
        paymentMethod: paymentMethod,
        paymentDetails:
          paymentMethod === "creditCard"
            ? {
                cardNumber: cardDetails.cardNumber,
                expirationDate: cardDetails.expirationDate,
                cvv: cardDetails.cvv,
              }
            : { paypalEmail: paypalEmail },
      };

      const paymentResponse = await axios.post(
        `${API_BASE_URL}/rentalPayments/create`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (paymentResponse.status === 201) {
        // Extend rental time
        const extendResponse = await axios.put(
          `${API_BASE_URL}/Rentals/extendRentalTime/${userId}/${currentGame.game._id}`,
          {
            additionalTime: parseInt(selectedExtension.time, 10),
            additionalPrice: selectedExtension.price,
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
      toast.error(error.message || "Payment failed. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans text-white">
      <Header />
      <div className="relative">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl font-primaryRegular text-black">
              MY RENTED GAMES
            </div>
          </div>
          {rentals.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {rentals.map((rental) => (
                <Card
                  key={rental._id}
                  className="relative white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  <Image
                    isBlurred
                    radius="none"
                    alt={rental.game.title}
                    className="w-[245px] h-[245px] object-cover"
                    src={rental.game.coverPhoto}
                  />
                  <CardBody className="p-4">
                    <p className="mb-2 font-primaryRegular text-lg text-black">
                      {rental.game.title}
                    </p>

                    <p className="mb-2 text-sm text-gray-500">
                      Rental Time: {formatTime(rental.time)}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4 font-primaryRegular">
                      {rental.game.Genre &&
                        rental.game.Genre.flatMap((genre) =>
                          genre.includes(",") ? genre.split(",") : genre
                        ).map((genre, index) => (
                          <Chip
                            key={index}
                            color="black"
                            variant="flat"
                            size="sm"
                            className="text-black"
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
                        className="font-primaryRegular bg-black text-white"
                        radius="7px"
                        variant="solid"
                        size="md"
                      >
                        Start Session
                      </Button>

                      <Button
                        onClick={() => openExtendModal(rental)}
                        color="secondary"
                        className="font-primaryRegular bg-white text-black border border-gray-300"
                        radius="7px"
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
            <div className="bg-white flex flex-col min-h-screen">
              <p className="text-center text-black font-primaryRegular text-5xl mt-[100px]">
                No Rented Games Found
              </p>
            </div>
          )}
        </div>

        <Modal isOpen={isModalVisible} onClose={closeModal} backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span style={{ color: "black", fontWeight: "bold" }}>
                    Start Session
                  </span>
                </ModalHeader>
                <ModalBody>
                  {currentGame ? (
                    <span style={{ color: "black" }}>
                      <p>
                        Are you sure you want to start a session for{" "}
                        {currentGame.game.title}?
                      </p>
                    </span>
                  ) : (
                    <p>Loading game details...</p>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    className="bg-white text-black border border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleStartSession}
                    className="bg-black text-white"
                  >
                    Start Session
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isExtendModalVisible}
          onClose={closeExtendModal}
          backdrop="blur"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <span style={{ color: "black", fontWeight: "bold" }}>
                Extend Rental
              </span>
            </ModalHeader>
            <ModalBody>
              <p className="text-black">
                Select an extension period for {currentGame?.game.title}:
              </p>
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
                      <p className="font-bold">
                        {formatTime(parseInt(option.time, 10))}
                      </p>
                      <p>LKR {option.price}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={closeExtendModal}
                className="bg-white text-black border border-gray-300"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={openPaymentModal}
                className="bg-black text-white"
              >
                Confirm and Pay
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          size="2xl"
        >
          <ModalContent
            style={{
              backgroundColor: "#f9f9f9", // Very light gray
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)", // Soft shadow
              borderRadius: "12px", // Rounded corners
              padding: "20px", // Spacing for the whole modal
            }}
          >
            {(onClose) => (
              <>
                <ModalHeader className="font-bold text-2xl text-gray-900">
                  Checkout
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PAYMENT METHOD SECTION */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        Payment Method
                      </h2>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <div className="border border-gray-300 p-5 rounded-lg mb-4">
                          <Radio value="creditCard">
                            <div className="flex items-center">
                              <CreditCardIcon />
                              <span className="text-gray-700 ml-2 mr-4">
                                Credit Card
                              </span>
                            </div>
                          </Radio>
                          {paymentMethod === "creditCard" && (
                            <div className="mt-4">
                              <Input
                                label="Card Number"
                                placeholder="1111-1111-1111-1111"
                                value={cardDetails.cardNumber}
                                onChange={handleCardNumberChange}
                                className="mb-5"
                                style={{
                                  borderColor: "#e0e0e0",
                                  borderRadius: "8px",
                                  boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
                                }}
                              />
                              <div className="flex gap-4">
                                <Input
                                  label="Expiration (MM/YY)"
                                  placeholder="MM/YY"
                                  value={cardDetails.expirationDate}
                                  onChange={handleExpirationDateChange}
                                  className="mb-5"
                                  style={{
                                    borderColor: "#e0e0e0",
                                    borderRadius: "8px",
                                    boxShadow:
                                      "0px 1px 4px rgba(0, 0, 0, 0.05)",
                                  }}
                                />
                                <Input
                                  label="CVV"
                                  placeholder="123"
                                  value={cardDetails.cvv}
                                  onChange={handleCvvChange}
                                  style={{
                                    borderColor: "#e0e0e0",
                                    borderRadius: "8px",
                                    boxShadow:
                                      "0px 1px 4px rgba(0, 0, 0, 0.05)",
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </RadioGroup>
                    </div>

                    {/* ORDER SUMMARY SECTION */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-lg font-semibold mb-4 text-blue-800">
                        Order Summary
                      </h2>
                      <p className="text-blue-800">
                        Selected Game:{" "}
                        <span className="text-gray-900">
                          {currentGame?.game.title}
                        </span>
                      </p>
                      <p className="text-blue-800">
                        Extension Time:{" "}
                        <span className="text-gray-900">
                          {formatTime(
                            parseInt(selectedExtension?.time, 10) || 0
                          )}
                        </span>
                      </p>
                      <p className="text-blue-800">
                        Total Amount:
                        <span className="text-gray-900">
                          {" "}
                          LKR {selectedExtension?.price}
                        </span>
                      </p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      backgroundColor: "#ff6b6b",
                      color: "#fff",
                      fontWeight: "bold",
                      boxShadow: "0px 2px 10px rgba(255, 107, 107, 0.3)",
                    }}
                    className="mr-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handlePayment}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      fontWeight: "bold",
                      boxShadow: "0px 2px 10px rgba(76, 175, 80, 0.3)",
                    }}
                    className="hover:bg-green-600 transition duration-300"
                  >
                    Confirm
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default GamingSessions;

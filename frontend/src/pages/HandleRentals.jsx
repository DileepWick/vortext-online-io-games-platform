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
  Input,
  RadioGroup,
  Radio,
  Checkbox,
} from "@nextui-org/react";
import { CreditCardIcon } from "lucide-react";

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

  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreeToShare, setAgreeToShare] = useState(false);

  const termsAndConditions = [
    "Rental period starts immediately after payment.",
    "No refunds for unused time.",
    "Game access will be automatically revoked after the rental period.",
    "Users must have a stable internet connection for uninterrupted gameplay.",
    "Violating our terms of service may result in account suspension.",
    "We are not responsible for any data loss during gameplay.",
    "Rented games cannot be transferred to other accounts.",
  ];

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNumber(formattedValue.slice(0, 19));
  };

  const handleExpirationDateChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setExpirationDate(value);
    } else {
      const month = value.slice(0, 2);
      const year = value.slice(2, 4);
      if (parseInt(month) > 12) {
        setExpirationDate('12/${year}' + year);
      } else {
        setExpirationDate(`${month}/${year}`);
      }
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 3));
  };

  const validateCardDetails = () => {
    if (cardNumber.replace(/-/g, '').length !== 16) {
      toast.error("Invalid card number");
      return false;
    }
    if (expirationDate.length !== 5) {
      toast.error("Invalid expiration date");
      return false;
    }
    const [month, year] = expirationDate.split('/');
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      toast.error("Invalid month in expiration date");
      return false;
    }
     // Check if the card is not expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      toast.error("Card has expired");
      return false;
    }
    if (cvv.length !== 3) {
      toast.error("Invalid CVV");
      return false;
    }
    return true;
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
  }

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
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

  const handleRentClick = useCallback(async () => {
    if (selectedRental) {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);

        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        const checkResponse = await axios.get(
          `http://localhost:8098/Rentals/checkExistingRental/${userId}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (checkResponse.data.hasExistingRental) {
          toast.warning(`You already have an existing rental for ${game.title}.`, {
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
        } else {
          onOpen();
        }
      } catch (error) {
        console.error("Error checking existing rental:", error);
        toast.error("Failed to check existing rentals. Please try again.");
      }
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
  }, [selectedRental, onOpen, id, game]);

  const handlePlaceOrder = async () => {
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

      const rentalResponse = await axios.post(
        "http://localhost:8098/Rentals/createRental",
        rentalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (rentalResponse.status !== 201) {
        throw new Error("Failed to create rental");
      }

      const latestRentalResponse = await axios.get(
        `http://localhost:8098/Rentals/getLatestRental/${userId}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (latestRentalResponse.status !== 200 || !latestRentalResponse.data._id) {
        throw new Error("Failed to fetch the latest rental ID");
      }

      const rentalId = latestRentalResponse.data._id;

      const paymentData = {
        user: userId,
        game: id,
        rental: rentalId,
        amount: parseFloat(selectedRental.price)
      };

      const paymentResponse = await axios.post(
        "http://localhost:8098/rentalPayments/create",
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (paymentResponse.status === 201) {
        toast.success("Payment successful! Game added to your rentals.");
        onClose();
        navigate("/GamingSessions");
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.message || "Payment failed. Please try again.");
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
      <div className="bg-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-primaryRegular text-white text-center">
            Rent the Game
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-customDark rounded-lg shadow-lg p-8">
          <h1 className="text-5xl text-white mb-4">
            {game.title}
            <br />
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
              
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {game.Genre.flatMap((genre) =>
              genre.includes(",") ? genre.split(",") : genre
            ).map((genre, index) => (
              <Chip
                key={index}
                color="black"
                variant="flat"
                size="sm"
                radius="none"
                className="font-primaryRegular"
              >
                {genre.trim()}
              </Chip>
            ))}
          </div>
          <div className="mb-1">
            <h2 className="text-3xl text-editionColor mb-4">About the game</h2>
            <ScrollShadow hideScrollBar className="h-[150px]">
              <p className="text-lg">{game.Description}</p>
            </ScrollShadow>
          </div>
          <div className="ml-4 flex-1">
                <h3 className="text-2xl font-primaryRegular mb-4">
                  Terms and Conditions
                </h3>
                <ScrollShadow className="h-[350px]">
                  <ul className="list-disc pl-5 space-y-2">
                    {termsAndConditions.map((term, index) => (
                      <li key={index} className="text-lg text-white">
                        {term}
                      </li>
                    ))}
                  </ul>
                </ScrollShadow>
              </div>

          <div>
            <h3 className="text-2xl font-primaryRegular mb-4">
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
                            ? "border-white border-2 shadow-lg scale-105 bg-black bg-opacity-20"
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
                          {parseInt(option.time) >= 3600
                            ? `${Math.floor(parseInt(option.time) / 3600)} hour${
                                Math.floor(parseInt(option.time) / 3600) > 1 ? "s" : ""
                              }`
                            : parseInt(option.time) >= 60
                            ? `${Math.floor(parseInt(option.time) / 60)} min`
                            : `${option.time} sec`}
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
                  color="black"
                  onPress={handleRentClick}
                 className="w-full border-2 border-white"
                  disabled={!selectedRental}
                >
                  Rent the game
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
      
      {/* New Checkout Modal */}
      <Modal
  isOpen={isOpen}
  onOpenChange={onClose}
  placement="center"
  size="2xl"
>
  <ModalContent
    style={{
      backgroundColor: "#f9f9f9",  // Very light gray
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",  // Soft shadow
      borderRadius: "12px",  // Rounded corners
      padding: "20px",  // Spacing for the whole modal
    }}
  >
    {(onClose) => (
      <>
        <ModalHeader className="font-bold text-2xl text-black">Checkout</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PAYMENT METHOD SECTION */}
            <div className="bg-customCardDark p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-black">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="border border-gray-900 p-5 rounded-lg mb-4">
                  <Radio value="creditCard">
                    <div className="flex items-center">
                      <CreditCardIcon />
                      <span className="text-black ml-2 mr-4">Credit Card</span>
                    </div>
                  </Radio>
                  {paymentMethod === 'creditCard' && (
                    <div className="mt-4">
                      <Input
                        label="Card Number"
                        placeholder="1111-1111-1111-1111"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="mb-5"
                      />
                      <div className="flex gap-4">
                        <Input
                          label="Expiration (MM/YY)"
                          placeholder="MM/YY"
                          value={expirationDate}
                          onChange={handleExpirationDateChange}
                          className="mb-5"
                        />
                        <Input
                          label="CVV"
                          placeholder="123"
                          value={cvv}
                          onChange={handleCvvChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* ORDER SUMMARY SECTION */}
            <div className="bg-customCardDark p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">Order Summary</h2>
              <div className="flex mb-4">
                <img src={game?.coverPhoto} alt={game?.title} className="w-16 h-20 object-cover mr-4 rounded-lg" />
                <div>
                  <h3 className="font text-blue-900">{game?.title}</h3>
                  <p className="text-black">Rs.{selectedRental?.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between text-black">
                  <span>Total</span>
                  <span>Rs.{selectedRental?.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handlePlaceOrder}>
            Confirm
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>


      <Footer />
    </div>
  );
};

export default HandleRentals;
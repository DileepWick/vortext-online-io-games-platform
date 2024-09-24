import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Image, Card, CardBody, Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";

const GamingSessions = () => {
  useAuthCheck();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);

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
      navigate(`/RentalGamesEmbed/${encodeURIComponent(currentGame.game.PlayLink)}/${encodeURIComponent(currentGame.game.title)}/${encodeURIComponent(rentalTimeInSeconds || 14400)}`);
    }
    closeModal();
  }, [currentGame, navigate, closeModal]);

  // Helper function to convert time string to seconds
  const convertTimeToSeconds = (timeString) => {
    if (!timeString) return 14400; // Default to 4 hours if timeString is undefined
    
    console.log("Original time string:", timeString);

    // Check if timeString is already in seconds
    if (!isNaN(timeString)) {
      const seconds = parseInt(timeString, 10);
      console.log("Parsed as seconds:", seconds);
      return seconds;
    }

    // Handle "HH:MM" format
    const [hours, minutes] = timeString.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const seconds = (hours * 3600) + (minutes * 60);
      console.log("Parsed as HH:MM format:", seconds);
      return seconds;
    }
    
    // Handle "X hours" or "X hour" format
    const hourMatch = timeString.match(/(\d+)\s*hour/i);
    if (hourMatch) {
      const seconds = parseInt(hourMatch[1], 10) * 3600;
      console.log("Parsed as 'X hours' format:", seconds);
      return seconds;
    }
    
    // If we can't parse the time, return default 4 hours
    console.log("Could not parse time, defaulting to 4 hours");
    return 14400;
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
                      Rental Time: {rental.time}
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
                        as={Link}
                        to={`/Shop`}
                        color="secondary"
                        className="font-primaryRegular"
                        radius="none"
                        variant="solid"
                        size="md"
                      >
                        Buy the game
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
      </div>
      <Footer />
    </div>
  );
};

export default GamingSessions;
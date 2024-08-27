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
  const [timeLeft, setTimeLeft] = useState(100);
  const [remainingTime, setRemainingTime] = useState("00:00:00");
  const [currentDate, setCurrentDate] = useState("");

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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const timeDifference = endOfDay - now;
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setRemainingTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      setTimeLeft((timeDifference / (1000 * 60 * 60 * 24)) * 100);

      setCurrentDate(now.toLocaleDateString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const openModal = useCallback((game) => {
    console.log("Opening modal for game:", game);
    setCurrentGame(game);
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setCurrentGame(null);
  }, []);

  const handleStartSession = useCallback(() => {
    if (currentGame) {
      navigate(`/RentalGamesEmbed/${encodeURIComponent(currentGame.PlayLink)}/${encodeURIComponent(currentGame.title)}`);
    }
    closeModal();
  }, [currentGame, navigate, closeModal]);

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
        {/* Progress Bar */}
        <div className="absolute top-4 right-4 w-[200px] bg-gray-300 rounded-full h-4">
          <div
            className="bg-green-500 h-full rounded-full"
            style={{ width: `${timeLeft}%` }}
          ></div>
        </div>
        <div className="absolute top-12 right-4 text-white text-sm">
          <div>Remaining Time: {remainingTime}</div>
          <div>Date: {currentDate}</div>
        </div>
        
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
                    className="w-[100px] h-[100px] object-cover"
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
                        onClick={() => openModal(rental.game)}
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
                        to={`/GameDetails/${rental.game._id}`}
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
                <ModalHeader className="flex flex-col gap-1">Start Session</ModalHeader>
                <ModalBody>
                  {currentGame ? (
                    <p>Are you sure you want to start a session for {currentGame.title}?</p>
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
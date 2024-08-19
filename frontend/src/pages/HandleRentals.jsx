import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner, Image, Card, Text, Button, Container, Grid } from '@nextui-org/react';

const HandleRentals = () => {
  const { stockid } = useParams(); // Extract stockid from URL
  const [gameStock, setGameStock] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/gameStocks/GetStockById/${stockid}`
        );
        const currentGameStock = response.data;

        const relatedResponse = await axios.get(
          `http://localhost:8098/gameStocks/getGameStockDetails/${currentGameStock.AssignedGame._id}`
        );

        const filteredRelatedStocks = relatedResponse.data.filter(
          (stock) => stock._id !== currentGameStock._id
        );

        setGameStock({
          ...currentGameStock,
          relatedGameStocks: filteredRelatedStocks
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [stockid]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size="xl" /></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><Text color="error">{error}</Text></div>;
  if (!gameStock) return <div className="flex justify-center items-center h-screen"><Text>Game not found</Text></div>;

  return (
    <div className="bg-customDark text-white min-h-screen font-primaryRegular">
      <Header />
      <Container>
        <div className="py-16">
          <Text h1 size={32} weight="bold" align="center" className="mb-8">
            Game Rental Details
          </Text>
          {gameStock.AssignedGame && (
            <Card css={{ mw: "100%", bg: "$gray800" }} className="mx-auto mb-8">
              <Card.Body>
                <Image
                  src={gameStock.AssignedGame.coverPhoto}
                  alt={gameStock.AssignedGame.title}
                  width={400}
                  height={250}
                  objectFit="cover"
                />
                <Text h2 size={24} weight="bold" align="center" className="mt-4">
                  {gameStock.AssignedGame.title}
                </Text>
                <Text size={18} align="center" className="mt-2">
                  {gameStock.AssignedGame.Description}
                </Text>
                <Button color="primary" auto className="mt-4 mx-auto d-block">
                  Rent This Game
                </Button>
              </Card.Body>
            </Card>
          )}
          {gameStock.relatedGameStocks && gameStock.relatedGameStocks.length > 0 && (
            <div className="mt-8">
              <Text h2 size={28} weight="bold" align="center" className="mb-4">
                Related Editions
              </Text>
              <Grid.Container gap={2} justify="center">
                {gameStock.relatedGameStocks.map((stock) => (
                  <Grid xs={12} sm={6} md={4} lg={3} key={stock._id}>
                    <Card css={{ bg: "$gray800", p: "$4" }}>
                      <Card.Body>
                        <Image
                          src={stock.AssignedGame.coverPhoto}
                          alt={stock.AssignedGame.title}
                          width={180}
                          height={120}
                          objectFit="cover"
                        />
                        <Text h4 size={18} weight="bold" align="center" className="mt-2">
                          {stock.AssignedGame.title} {stock.Edition} Edition
                        </Text>
                        <Text size={16} align="center" className="mt-2">
                          ${stock.UnitPrice}
                        </Text>
                        <Button color="secondary" auto className="mt-2 mx-auto d-block">
                          Rent Now
                        </Button>
                      </Card.Body>
                    </Card>
                  </Grid>
                ))}
              </Grid.Container>
            </div>
          )}
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default HandleRentals;

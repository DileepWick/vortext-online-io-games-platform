import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner } from "@nextui-org/react";

// NextUI
import { Image } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
} from "@nextui-org/react";

const Shop = () => {
  const [gameStocks, setGameStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameStocks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8098/gameStocks/allGameStock"
        );
        setGameStocks(response.data.allGameStocks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameStocks();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-300 via-gray-500 to-red-200 text-black">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-black mb-8 font-primaryRegular">
          Games
        </h1>

        {gameStocks.length === 0 ? (
          <p className="text-gray-400 text-center">No game stocks available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {gameStocks.map((stock) => (
              <Card key={stock._id} className="bg-white bg-opacity-60 rounded-lg shadow-lg">

                <Link to={`/game/${stock._id}`}>
                  <Image
                    radius="none"
                    removeWrapper
                    alt={stock.AssignedGame.title}
                    className="w-full h-[400px] object-cover rounded-t-lg"
                    src={stock.AssignedGame.coverPhoto}
                  />
                  <CardBody className="p-4">
                    <h2 className="text-xl font-primaryRegular text-black mb-2">
                      {stock.AssignedGame.title}
                      <br />
                      <Chip>{stock.Edition}</Chip>
                    </h2>
                    <p className="font-primaryRegular text-black mb-2">
                      <strong>{stock.UnitPrice}$ </strong>
                      {stock.discount > 0 && (
                      <>
                        <Chip color="primary" radius="none" className="font-primaryRegular">
                          -{stock.discount}% off
                        </Chip>
                      </>
                    )}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(stock.AssignedGame.Genre)
                        ? stock.AssignedGame.Genre.map((genre, index) => (
                            <Chip
                              key={index}
                              color="danger"
                              variant="dot"
                              className="font-primaryRegular"
                            >
                              {genre}
                            </Chip>
                          ))
                        : stock.AssignedGame.Genre.split(",").map(
                            (genre, index) => (
                              <Chip
                                key={index}
                                color="danger"
                                radius="none"
                                className="font-primaryRegular"
                              >
                                {genre}
                              </Chip>
                            )
                          )}
                    </div>
                  </CardBody>
                  <CardFooter className="text-center p-4">
                    <Button
                      color="primary"
                      radius="none"
                      className="font-primaryRegular w-[300px]"
                      variant="ghost"
                    >
                      Buy Now
                    </Button>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;

import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner } from "@nextui-org/react";

// NextUI
import { Image } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Card, CardBody, CardFooter, Chip } from "@nextui-org/react";

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
    <div className="min-h-screen bg-customDark text-white">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl text-center text-white mb-8 font-primaryRegular">
          Games
        </h1>

        {gameStocks.length === 0 ? (
          <p className="text-gray-400 text-center">No game stocks available</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {gameStocks.map((stock) => {
              const originalPrice = stock.UnitPrice;
              const discount = stock.discount;
              const discountedPrice =
                discount > 0
                  ? originalPrice - (originalPrice * discount) / 100
                  : originalPrice;

              return (
                <Card
                  key={stock._id}
                  className="bg-customDark rounded-lg shadow-lg text-white"
                >
                  <Link to={`/game/${stock._id}`}>
                    <Image
                      radius="none"
                      removeWrapper
                      alt={stock.AssignedGame.title}
                      className="w-[250px] h-[350px] object-cover rounded-t-lg"
                      src={stock.AssignedGame.coverPhoto}
                    />
                    <CardBody className="p-4 text-white">
                      <p className="text-editionColor font-primaryRegular text-sm">
                        {stock.Edition} Edition
                      </p>
                      <h2 className="text-xl font-primaryRegular text-white mb-2">
                        {stock.AssignedGame.title}
                      </h2>

                      <p className="font-primaryRegular text-white mb-2 m-2">
                        {discount > 0 && (
                          <>

                            <Chip
                              color="primary"
                              radius="none"
                              className="font-primaryRegular mr-2"
                              size="sm"
                            >
                              -{stock.discount}% off
                            </Chip>
                            <span className="line-through mr-2 text-editionColor">
                              LKR.{originalPrice}
                            </span>
                          </>
                        )}
                        <span>LKR.{discountedPrice}</span>
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2 text-white ">
                        {Array.isArray(stock.AssignedGame.Genre)
                          ? stock.AssignedGame.Genre.map((genre, index) => (
                              <Chip
                                key={index}
                                color="primary"
                                variant="flat"
                                size="sm"
                                radius="none"
                                className="font-primaryRegular text-white"
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
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;

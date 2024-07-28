import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { FaShoppingCart } from "react-icons/fa";
import { FaPlaystation } from "react-icons/fa";

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
                  className="relative bg-customDark rounded-lg shadow-lg text-white transform transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl hover:bg-opacity-80"
                >
                  <Link to={`/game/${stock._id}`}>
                    <div className="relative">
                      <Image
                        isBlurred
                        
                        
                        alt={stock.AssignedGame.title}
                        className="w-[250px] h-[350px] object-cover rounded-t-lg"
                        src={stock.AssignedGame.coverPhoto}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                        <FaPlaystation className="text-white text-3xl" />
                        <FaShoppingCart className="text-white text-3xl absolute" />
                      </div>
                    </div>
                    <CardBody className="p-4 text-white">
                      <p className="text-editionColor font-primaryRegular text-sm ">
                        Ratings points {stock.AssignedGame.RatingPoints} ⭐
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
                        {stock.AssignedGame.Genre.flatMap((genre) =>
                          genre.includes(",") ? genre.split(",") : genre
                        ).map((genre, index) => (
                          <Chip
                            key={index}
                            color="primary"
                            variant="flat"
                            size="sm"
                            radius="none"
                            className="font-primaryRegular text-white"
                          >
                            {genre.trim()}
                          </Chip>
                        ))}
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

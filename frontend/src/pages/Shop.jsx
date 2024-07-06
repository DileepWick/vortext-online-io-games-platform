import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner } from "@nextui-org/react";

//Next Ui
import { Image } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";

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
    <div className="text-white min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-black mb-8 font-primaryRegular" >Games</h1>

        {gameStocks.length === 0 ? (
          <p className="text-gray-400">No game stocks available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {gameStocks.map((stock) => (
              <Link key={stock._id} to={`/game/${stock._id}`}>
               
                <Card
                  isFooterBlurred
                  className="w-[300px] h-[500px] col-span-12 sm:col-span-7"
                >
                  <Image
                    removeWrapper
                    alt="Relaxing app background"
                    className="z-0 w-full h-full object-cover"
                    src={stock.AssignedGame.coverPhoto}
                  />
                  <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                    <div className="flex flex-grow gap-2 items-center">
                      <div className="flex flex-col">
                        <h1 className="text-medium text-white font-primaryRegular">
                          {stock.AssignedGame.title}
                          <br /> {stock.Edition} Edition
                        </h1>
                        <p className="text-large text-white font-primaryRegular">
                          ${stock.UnitPrice}
                        </p>
                      </div>
                    </div>
                    <Button
                      radius="full"
                      size="sm"
                      color="primary"
                      variant="shadow"
                      className="font-primaryRegular"
                    >
                      View Info
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;

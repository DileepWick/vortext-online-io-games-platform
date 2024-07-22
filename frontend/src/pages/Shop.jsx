import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Spinner } from "@nextui-org/react";

// NextUI
import { Image } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter,Chip } from "@nextui-org/react";

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
    <div className="min-h-screen bg-white text-white">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-white mb-8 font-primaryRegular">
          Games
        </h1>

        {gameStocks.length === 0 ? (
          <p className="text-gray-400 text-center">No game stocks available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {gameStocks.map((stock) => (
              <Card key={stock._id} className="bg-white " radius="none">
                <Link to={`/game/${stock._id}`}>
                  <Image
                    radius="none"
                    removeWrapper
                    alt={stock.AssignedGame.title}
                    className="w-full h-[400px] object-cover rounded-t"
                    src={stock.AssignedGame.coverPhoto}
                  />
                  <CardBody>
                    <h2 className="text-xl font-primaryRegular text-black mb-2">{stock.AssignedGame.title}</h2>
                    <p className="font-primaryRegular text-black"><strong>{stock.UnitPrice}$</strong></p>
                    <p className="text-gray-400"><Chip color="default" radius="none" className="font-primaryRegular">{stock.AssignedGame.Genre}</Chip></p>
                  </CardBody>
                  <CardFooter className="text-center">
                    <Button color="primary" radius="none" className="font-primaryRegular" variant="ghost">
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Image, Card, CardBody, Chip, Button } from "@nextui-org/react";

const OrderHistory = () => {
  useAuthCheck();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);
        const response = await axios.get(
          `http://localhost:8098/orderItems/useOrders/${userId}`
        );
        setOrderItems(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to fetch order items.");
      }
    };

    fetchOrderItems();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-customDark min-h-screen font-sans text-white">
      <Header />
      <div className="container mx-auto p-6">
        <div className="text-2xl font-primaryRegular mb-6">MY LIBRARY</div>
        {orderItems.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {orderItems.map((item) => (
              <Card
                key={item.stockid._id}
                className="relative bg-customDark overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg"
              
              >
                <Image
                  isBlurred
                  radius="none"
                  alt={item.stockid.AssignedGame.title}
                  className="w-[100px] h-[100px] object-cover"
                  src={item.stockid.AssignedGame.coverPhoto}
                />
                <CardBody className="p-4">
                  <p className="mb-2 font-primaryRegular text-lg text-white">
                    {item.stockid.AssignedGame.title}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 font-primaryRegular">
                    {item.stockid.AssignedGame.Genre.flatMap((genre) =>
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
                  
                  <Button
                    as={Link}
                    to={`/playgame/${encodeURIComponent(
                      item.stockid.AssignedGame.PlayLink
                    )}/${encodeURIComponent(item.stockid.AssignedGame.title)}`}
                    color="primary"
                    className="font-primaryRegular"
                    radius="none"
                    variant="ghost"
                  >
                    PLAY NOW
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <p>No Games in the library</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;

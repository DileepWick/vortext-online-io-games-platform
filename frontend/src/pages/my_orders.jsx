import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";
import { Image, Card, CardBody, Chip } from "@nextui-org/react"; // Import only required components


const OrderHistory = () => {
  useAuthCheck();

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

  const handlePlayButtonClick = (playLink) => {
    window.open(playLink, "_blank"); // Open the play link in a new tab
  };

  return (
    <div className="text-black min-h-screen font-sans font-primaryRegular bg-customDark">
      <Header />
      <div className="container mx-auto p-6 font-primaryRegular">
        {orderItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            {orderItems.map((item) => (
              <Card
                key={item.stockid._id}
                className="relative bg-customDark"
              >
                <div className="flex flex-col items-center">
                  <Image
                    isBlurred
                    radius="none"
                    removeWrapper
                    alt={item.stockid.AssignedGame.title}
                    className="w-[300px] h-[320px] object-cover rounded-t-lg"
                    src={item.stockid.AssignedGame.coverPhoto}
                  />
                  <CardBody className="p-4 text-white">
                    <h2 className="text-xl font-primaryRegular text-white mb-2">
                      {item.stockid.AssignedGame.title}
                    </h2>
                    <h2 className="text-md font-primaryRegular text-white mb-2">
                      LKR {item.stockid.UnitPrice}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-white">
                      {item.stockid.AssignedGame.Genre.flatMap((genre) =>
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
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p>No items found for this order.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;

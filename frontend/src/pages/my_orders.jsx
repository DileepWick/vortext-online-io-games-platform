import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";

//Next Ui
import { Chip } from "@nextui-org/chip";
import { Button, ButtonGroup } from "@nextui-org/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";

//Toast
import { toast ,Flip} from 'react-toastify';


const OrderHistory = ({ userId }) => {
  // Authenticate user
  useAuthCheck();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

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
      }
    };

    fetchOrderItems();
  }, [userId]);

  const cancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:8098/orders/${orderId}`);
      setOrderItems(orderItems.filter((item) => item.order._id !== orderId));
      toast.success("Order Deleted ",{
        style: { fontFamily: 'Rubik' }
      })
    } catch (error) {
      setError("Error canceling order");
    }
  };

  const groupOrderItemsByOrderId = (items) => {
    return items.reduce((acc, item) => {
      const orderId = item.order._id;
      if (!acc[orderId]) {
        acc[orderId] = [];
      }
      acc[orderId].push(item);
      return acc;
    }, {});
  };

  const handleShowModal = (items) => {
    setSelectedOrderItems(items);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrderItems([]);
    setShowModal(false);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  const groupedOrderItems = groupOrderItemsByOrderId(orderItems);

  return (
    <div className=" text-white min-h-screen font-sans font-primaryRegular">
      <Header />
      <div className="container mx-auto p-6 font-primaryRegular">
        <h2 className="text-3xl font-bold mb-8 text-black">Order History</h2>
        {Object.keys(groupedOrderItems).length === 0 ? (
          <div className="text-center mt-10">No order items found.</div>
        ) : (
          Object.keys(groupedOrderItems).map((orderId) => (
            <div
              key={orderId}
              className="mb-8 p-6 bg-black border border-gray-700 rounded-lg shadow-lg transition duration-300 hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-2">
                Order ID: {orderId}
              </h3>
              {groupedOrderItems[orderId].length > 0 && (
                <div className="mb-4 space-y-2">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      groupedOrderItems[orderId][0].order.orderPlacementDate
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Total Payment:</strong> $
                    {groupedOrderItems[orderId][0].order.paymentAmount.toFixed(
                      2
                    )}
                  </p>
                  <p>
                    <strong>Completion Code:</strong>{" "}
                    <Chip color="warning" variant="bordered">
                      {groupedOrderItems[orderId][0].order.orderCompletionCode}
                    </Chip>
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {groupedOrderItems[orderId][0].order.orderStatus}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {groupedOrderItems[orderId][0].order.shippingAddress}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => handleShowModal(groupedOrderItems[orderId])}
                  color="primary"
                  variant="shadow"
                  className="font-primaryRegular"
                >
                  Show Product Info
                </Button>
                <Button
                  onClick={() => cancelOrder(orderId)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 font-primaryRegular">
          <div className="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-4 right-4 text-2xl font-bold text-gray-800 hover:text-gray-600"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6">Products Info</h2>

            <Table aria-label="Example static collection table">
              <TableHeader>
                <TableColumn>TITLE</TableColumn>
                <TableColumn>EDITION</TableColumn>
                <TableColumn>QUANTITY</TableColumn>
                <TableColumn>COST</TableColumn>
              </TableHeader>
              <TableBody>
              {selectedOrderItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.stockid.AssignedGame.title}</TableCell>
                  <TableCell>{item.stockid.Edition}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                </TableRow>
                 ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderHistory;

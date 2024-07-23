import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";
import View_Products from "../components/Orders/View_Order_Items";
import { Progress } from "@nextui-org/react";

// Next UI
import { Chip } from "@nextui-org/chip";
import { ScrollShadow } from "@nextui-org/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  SelectItem,
  Select,
  Tooltip,
  Input,
  Avatar,
  Textarea,
} from "@nextui-org/react";
import { SearchIcon } from "../assets/icons/SearchIcon";
import CancelOrder from "../../dashboards/Orders_Components/CancelOrder";

const OrderHistory = ({ userId }) => {
  // Authenticate user
  useAuthCheck();

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateOrder, setDateOrder] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  const groupedOrderItems = groupOrderItemsByOrderId(orderItems);

  const filteredOrderItems =
    statusFilter === "All"
      ? groupedOrderItems
      : Object.keys(groupedOrderItems)
          .filter(
            (orderId) =>
              groupedOrderItems[orderId][0].order.orderStatus === statusFilter
          )
          .reduce((acc, orderId) => {
            acc[orderId] = groupedOrderItems[orderId];
            return acc;
          }, {});

  const sortedOrderItems = Object.keys(filteredOrderItems)
    .sort((a, b) => {
      const dateA = new Date(filteredOrderItems[a][0].order.orderPlacementDate);
      const dateB = new Date(filteredOrderItems[b][0].order.orderPlacementDate);
      return dateOrder === "recent" ? dateB - dateA : dateA - dateB;
    })
    .reduce((acc, orderId) => {
      acc[orderId] = filteredOrderItems[orderId];
      return acc;
    }, {});

  const searchedOrderItems = Object.keys(sortedOrderItems)
    .filter((orderId) =>
      orderId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .reduce((acc, orderId) => {
      acc[orderId] = sortedOrderItems[orderId];
      return acc;
    }, {});

  return (
    <div className="text-black min-h-screen font-sans font-primaryRegular bg-white">
      <Header />
      <div className="container mx-auto p-6 font-primaryRegular">
        <h2 className="text-3xl font-bold mb-8 text-black">My Orders</h2>

        <div className="flex space-x-4 mb-8 text-black">
          <select
            aria-label="Select Order Status"
            placeholder="Filter by Status"
            defaultValue="All"
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-black p-2 rounded"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="On Delivery">On Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Canceled">Canceled</option>
          </select>

          <select
            aria-label="Select Date Order"
            defaultValue="recent"
            onChange={(e) => setDateOrder(e.target.value)}
            className="text-black p-2 rounded"
          >
            <option value="recent" className="p-4 m-4">
              Recent to Old
            </option>
            <option value="old" className="p-4 m-4">
              Old to Recent
            </option>
          </select>

          <Input
            type="text"
            size="lg"
            placeholder="Search by Ref ID"
            value={searchQuery}
            startContent={<SearchIcon />}
            onChange={handleSearchInputChange}
          />
        </div>

        {Object.keys(searchedOrderItems).length === 0 ? (
          <div className="text-center mt-10">No order items found.</div>
        ) : (
          Object.keys(searchedOrderItems).map((orderId) => (
            <ScrollShadow hideScrollBar className="w-[1200px] h-[400px]">
              <div key={orderId} className="mb-2 p-4 border-black">
                <Card className="max-w-[full] mx-left ">
                  <CardHeader className="flex gap-4">
                    <div className="flex flex-row space-x-4">
                      <Chip color="primary" size="lg" variant="faded">
                        <strong>Ref ID </strong> - {orderId}
                      </Chip>

                      {searchedOrderItems[orderId][0].order.orderStatus ===
                      "Approved" ? (
                        <div className="flex flex-row">
                          <Chip color="success" variant="dot" size="lg">
                            {searchedOrderItems[orderId][0].order.orderStatus}
                          </Chip>

                          <Progress
                            label="Progress..."
                            size="sm"
                            value={50}
                            color="success"
                            showValueLabel={true}
                            className="w-[100px] ml-4"
                          />
                        </div>
                      ) : searchedOrderItems[orderId][0].order.orderStatus ===
                        "Pending" ? (
                        <>
                          <Chip color="warning" variant="dot" size="lg">
                            {searchedOrderItems[orderId][0].order.orderStatus}
                          </Chip>
                          <Progress
                            label="Progress..."
                            size="sm"
                            value={25}
                            color="warning"
                            showValueLabel={true}
                            className="w-[100px] ml-4"
                          />
                        </>
                      ) : searchedOrderItems[orderId][0].order.orderStatus ===
                        "On Delivery" ? (
                        <>
                          <div>
                            {searchedOrderItems[orderId][0].order.courier ? (
                              <Tooltip
                                content={
                                  <div className="px-1 py-2">
                                    <Avatar
                                      src={
                                        searchedOrderItems[orderId][0].order
                                          .courier.profilePic
                                      }
                                      size="lg"
                                    />
                                    <div className="text-small font-bold">
                                      {
                                        searchedOrderItems[orderId][0].order
                                          .courier.username
                                      }
                                    </div>
                                    <div className="text-tiny">
                                      {
                                        searchedOrderItems[orderId][0].order
                                          .courier.email
                                      }
                                    </div>
                                  </div>
                                }
                              >
                                <Chip
                                  variant="dot"
                                  color="primary"
                                  size="lg"
                                  avatar={
                                    <Avatar
                                      name="JW"
                                      src={
                                        searchedOrderItems[orderId][0].order
                                          .courier.profilePic
                                      }
                                      size="lg"
                                    />
                                  }
                                >
                                  On Delivery By{" "}
                                  {
                                    searchedOrderItems[orderId][0].order.courier
                                      .username
                                  }
                                </Chip>
                              </Tooltip>
                            ) : (
                              <div>Courier information not available</div>
                            )}
                          </div>{" "}
                          <Progress
                            label="Progress..."
                            size="sm"
                            value={75}
                            color="secondary"
                            showValueLabel={true}
                            className="w-[100px] ml-4"
                          />
                        </>
                      ) : searchedOrderItems[orderId][0].order.orderStatus ===
                        "Delivered" ? (
                        <>
                          <div>
                            {searchedOrderItems[orderId][0].order.courier ? (
                              <Tooltip
                                content={
                                  <div className="px-1 py-2">
                                    <Avatar
                                      src={
                                        searchedOrderItems[orderId][0].order
                                          .courier.profilePic
                                      }
                                      size="lg"
                                    />
                                    <div className="text-small font-bold">
                                      {
                                        searchedOrderItems[orderId][0].order
                                          .courier.username
                                      }
                                    </div>
                                    <div className="text-tiny">
                                      {
                                        searchedOrderItems[orderId][0].order
                                          .courier.email
                                      }
                                    </div>
                                  </div>
                                }
                              >
                                <Chip
                                  variant="dot"
                                  color="primary"
                                  size="lg"
                                  avatar={
                                    <Avatar
                                      name="JW"
                                      src={
                                        searchedOrderItems[orderId][0].order
                                          .courier.profilePic
                                      }
                                      size="lg"
                                    />
                                  }
                                >
                                  Delivered By{" "}
                                  {
                                    searchedOrderItems[orderId][0].order.courier
                                      .username
                                  }
                                </Chip>
                              </Tooltip>
                            ) : (
                              <div>Courier information not available</div>
                            )}
                          </div>{" "}
                          <Progress
                            label="Progress..."
                            size="sm"
                            value={100}
                            color="primary"
                            showValueLabel={true}
                            className="w-[100px] ml-4"
                          />
                        </>
                      ) : (
                        <>
                          <Chip color="danger" variant="dot" size="lg">
                            {searchedOrderItems[orderId][0].order.orderStatus}
                          </Chip>
                          <Progress
                            label="Progress..."
                            size="sm"
                            value={0}
                            color="default"
                            showValueLabel={true}
                            className="w-[100px] ml-4"
                          />
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <Divider />
                  <CardBody>
                    <div className="flex flex-row space-x-6">
                      <Input
                        label={"Placement Date"}
                        isReadOnly
                        defaultValue={
                          searchedOrderItems[orderId][0].order
                            .orderPlacementDate
                        }
                        className="max-w-xs"
                      />
                      <Input
                        type="text"
                        label="Token"
                        isReadOnly
                        defaultValue={
                          searchedOrderItems[orderId][0].order
                            .orderCompletionCode
                        }
                        description="Use this token to receive your order"
                        className="max-w-xs"
                      />
                      <Textarea
                        type="text"
                        label="Shipping Address"
                        isReadOnly
                        defaultValue={
                          searchedOrderItems[orderId][0].order.shippingAddress
                        }
                        className="max-w-xs mb-4"
                      />
                      <Input
                        type="text"
                        label="Region"
                        isReadOnly
                        defaultValue={
                          searchedOrderItems[orderId][0].order.region
                        }
                        className="max-w-xs"
                      />
                    </div>
                    <Divider />
                    <div className="flex flex-row space-x-6 mt-4">
                      <Input
                        type="text"
                        label="Payment Amount"
                        isReadOnly
                        defaultValue={`$${searchedOrderItems[orderId][0].order.paymentAmount}`}
                        className="max-w-xs"
                      />
                    </div>
                  </CardBody>
                  <Divider />
                  <CardFooter className="flex justify-between">
                    <View_Products
                      orderObject={searchedOrderItems[orderId][0].order}
                    />
                    {searchedOrderItems[orderId][0].order.orderStatus !==
                      "Canceled" &&
                    searchedOrderItems[orderId][0].order.orderStatus !==
                      "Delivered" ? (
                      <CancelOrder
                        orderForCancellation={
                          searchedOrderItems[orderId][0].order
                        }
                        callBackFunction={() => {
                          // Fetch order items again to reflect cancellation
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
                        }}
                      />
                    ) : null}
                  </CardFooter>
                </Card>
              </div>
            </ScrollShadow>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;

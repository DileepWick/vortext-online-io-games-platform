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
    <div className="text-black min-h-screen font-sans font-primaryRegular bg-customDark">
      <Header />
      <div className="container mx-auto p-6 font-primaryRegular">
        <h2 className="text-5xl  mb-8 text-white">My Orders</h2>

        <div className="flex space-x-4 mb-8 text-black">
          <select
            aria-label="Select Order Status"
            placeholder="Filter by Status"
            defaultValue="All"
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-white p-2 rounded bg-customDark"
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
            className="text-white p-2 rounded bg-customDark"
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
            size="md"
            placeholder=" Search by Ref ID"
            className="w-[500px]"
            variant="bordered"
            value={searchQuery}
            startContent={<SearchIcon />}
            onChange={handleSearchInputChange}
            classNames={{
              label: "text-white",
              input: "bg-customDark text-white", // Ensure this class is applied
              innerWrapper: "bg-customDark",
              inputWrapper: "bg-customDark",
              width:"100px",
            }}
            style={{ color: "white" }} // Inline style to ensure text color is white
          />
        </div>
        <ScrollShadow
          hideScrollBar
          className="w-[full] h-[500px] bg-customDark overflow-auto flex-row"
        >
          {Object.keys(searchedOrderItems).length === 0 ? (
            <div className="text-center mt-10 text-white">
              No order items found.
            </div>
          ) : (
            Object.keys(searchedOrderItems).map((orderId) => (
              <div
                key={orderId}
                className="mb-4 p-4 border-2 border-gray-800 rounded-lg"
              >
                <Card className="bg-headerDark border-red">
                  <CardHeader className="flex gap-4">
                    <div className="flex flex-row space-x-4">
                      <Chip color="default" size="lg" radius="none">
                        <strong>Ref ID </strong> - {orderId}
                      </Chip>

                      {searchedOrderItems[orderId][0].order.orderStatus ===
                      "Approved" ? (
                        <div className="flex flex-row">
                          <Chip
                            color="success"
                            variant="dot"
                            size="lg"
                            className="text-white bg-headerDark"
                          >
                            {searchedOrderItems[orderId][0].order.orderStatus}
                          </Chip>
                          <Progress
                            label="Progress..."
                            size="sm"
                            value={50}
                            color="success"
                            showValueLabel={true}
                            className="w-[100px] ml-4 text-white bg-headerDark"
                          />
                        </div>
                      ) : searchedOrderItems[orderId][0].order.orderStatus ===
                        "Pending" ? (
                        <>
                          <Chip
                            color="warning"
                            variant="dot"
                            size="lg"
                            className="text-white bg-headerDark"
                          >
                            {searchedOrderItems[orderId][0].order.orderStatus}
                          </Chip>
                          <Progress
                            label="Progress..."
                            size="sm"
                            value={25}
                            color="warning"
                            showValueLabel={true}
                            className="w-[100px] ml-4 text-white bg-headerDark"
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
                                  className="text-white bg-headerDark"
                                  color="secondary"
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
                          </div>
                          <Progress
                            label="Progress..."
                            size="sm"
                            value={75}
                            color="secondary"
                            showValueLabel={true}
                            className="w-[100px] ml-4 text-white"
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
                          </div>
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
                    <div className="bg-headerDark p-3 rounded">
                      <div className="mb-2">
                        <p className="text-editionColor text-sm font-medium">
                          <strong>Placement Date:</strong>
                        </p>
                        <p className="text-white text-sm">
                          {
                            searchedOrderItems[orderId][0].order
                              .orderPlacementDate
                          }
                        </p>
                      </div>
                      <div className="mb-2">
                        <p className="text-editionColor text-sm font-medium">
                          <strong>Token:</strong>
                        </p>
                        <Chip
                          color="danger"
                          size="lg"
                          className="text-white text-sm"
                        >
                          {
                            searchedOrderItems[orderId][0].order
                              .orderCompletionCode
                          }
                          <br />
                        </Chip>
                      </div>
                      <div className="mb-2">
                        <p className="text-editionColor text-sm font-medium">
                          <strong>Shipping Address:</strong>
                        </p>
                        <p className="text-white text-sm">
                          {searchedOrderItems[orderId][0].order.shippingAddress}
                        </p>
                      </div>
                      <div className="mb-2">
                        <p className="text-editionColor text-sm font-medium">
                          <strong>Region:</strong>
                        </p>
                        <p className="text-white text-sm">
                          {searchedOrderItems[orderId][0].order.region}
                        </p>
                      </div>
                      <Divider className="my-2" />
                      <div>
                        <p className="text-editionColor text-sm font-medium">
                          <strong>Payment Amount:</strong>
                        </p>
                        <p className="text-white text-sm">
                          ${searchedOrderItems[orderId][0].order.paymentAmount}
                        </p>
                      </div>
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
            ))
          )}
        </ScrollShadow>
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";
import { DeleteIcon } from "../assets/icons/DeleteIcon";
import { ScrollShadow } from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import { Helmet } from "react-helmet-async";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Image,
  Chip,
  Input,
  Radio,
  RadioGroup
} from "@nextui-org/react";

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const OrderSummary = ({ subtotal, totalDiscountedTotal, onCheckout }) => {
  const discount = subtotal - totalDiscountedTotal;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-white">Order Summary</h2>
      <div className="space-y-2 mb-4">
        <p className="flex justify-between text-white">
          <span>Subtotal:</span>
          <span>LKR.{subtotal.toFixed(2)}</span>
        </p>
        <p className="flex justify-between text-white">
          <span>Discount:</span>
          <span>LKR.{discount.toFixed(2)}</span>
        </p>
        <p className="flex justify-between font-bold text-xl text-white">
          <span>Total:</span>
          <span>LKR.{totalDiscountedTotal.toFixed(2)}</span>
        </p>
      </div>
      <Button
        onPress={onCheckout}
        color="primary"
        className="w-full text-white font-bold py-3 rounded-md transition-all duration-300 hover:bg-blue-600"
        size="lg"
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};

const CartPage = () => {
  useAuthCheck();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscountedTotal, setTotalDiscountedTotal] = useState(0);

  // Checkout state
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);
        const response = await axios.get(
          `http://localhost:8098/cartItems/getCartItemsByUserId/${userId}`
        );
        setCartItems(response.data.cartItems);
        calculateTotal(response.data.cartItems);
      } catch (err) {
        setError("Error fetching cart items");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const calculateTotal = (items) => {
    let subTotal = 0;
    let totalDiscountedTotal = 0;

    items.forEach((item) => {
      const discountedPrice = calculateDiscountedPrice(item);
      subTotal += item.stockid.UnitPrice * item.quantity;
      totalDiscountedTotal += discountedPrice * item.quantity;
    });

    setSubtotal(subTotal);
    setTotalDiscountedTotal(totalDiscountedTotal);
  };

  const calculateDiscountedPrice = (item) => {
    const discount = item.stockid.discount || 0;
    return discount > 0
      ? item.stockid.UnitPrice * (1 - discount / 100)
      : item.stockid.UnitPrice;
  };

  const handleRemoveItem = async (stockid) => {
    try {
      const response = await axios.delete(
        `http://localhost:8098/cartItems/deleteCartItem/${stockid}`
      );

      if (response.status === 200) {
        const updatedItems = cartItems.filter(
          (item) => item.stockid._id !== stockid
        );
        setCartItems(updatedItems);
        calculateTotal(updatedItems);
      }
    } catch (error) {
      setError("Error removing cart item");
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNumber(formattedValue.slice(0, 19));
  };

  const handleExpirationDateChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setExpirationDate(value);
    } else {
      const month = value.slice(0, 2);
      const year = value.slice(2, 4);
      if (parseInt(month) > 12) {
        setExpirationDate('12/' + year);
      } else {
        setExpirationDate(`${month}/${year}`);
      }
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 3));
  };

  const validateForm = () => {
    if (paymentMethod === 'creditCard') {
      if (cardNumber.replace(/-/g, '').length !== 16) {
        toast.error("Invalid card number");
        return false;
      }
      if (expirationDate.length !== 5) {
        toast.error("Invalid expiration date");
        return false;
      }
      const [month, year] = expirationDate.split('/');
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        toast.error("Invalid month in expiration date");
        return false;
      }

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        toast.error("Card has expired");
        return false;
      }

      if (cvv.length !== 3) {
        toast.error("Invalid CVV");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (paymentMethod === 'creditCard' && (!cardNumber || !expirationDate || !cvv)) {
      toast.error("Please fill in your payment details before placing the order.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
      return;
    }

    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      const orderData = {
        userId,
        paymentAmount: totalDiscountedTotal,
        paymentMethod: paymentMethod,
        paymentDetails: paymentMethod === 'creditCard' 
          ? { cardNumber, expirationDate, cvv }
          : {},
        items: cartItems.map(item => ({
          gameId: item.stockid.AssignedGame._id,
          quantity: 1,
          price: item.stockid.UnitPrice
        }))
      };

      const response = await axios.post(
        `http://localhost:8098/orders/create/${userId}`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const orderid = response.data._id;

      await Promise.all(
        cartItems.map((item) => {
          const orderItemData = {
            order: orderid,
            stockid: item.stockid._id,
            price: item.stockid.UnitPrice,
          };
          return axios.post(`http://localhost:8098/orderItems/`,
            orderItemData
          );
        })
      );

      if (response.status === 200) {
        toast.success("Order placed successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        setCartItems([]);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Error placing order. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) {
    const errorMessage = error?.message || "Error occurred";
    return <p className="text-center mt-8">Error: {errorMessage}</p>;
  }

  if (cartItems.length === 0)
    return (
      <div className="bg-customDark flex flex-col min-h-screen">
        <Helmet>
          <title>My Cart</title>
        </Helmet>
        <Header />
        <p className="text-center text-white font-primaryRegular text-5xl mt-[100px]">
          Cart is empty
        </p>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen font-primaryRegular bg-gradient-to-b from-customDark to-gray-900">
      <Helmet>
        <title>My Cart</title>
      </Helmet>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center text-white">My Cart</h1>
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 flex flex-col lg:flex-row gap-8">
          <ScrollShadow hideScrollBar className="w-full lg:w-2/3 h-[600px]">
            <div className="space-y-6">
              {cartItems.map((item) => {
                const game = item.stockid.AssignedGame;
                const gameExists = game && game._id;

                return (
                  <div
                    key={item._id}
                    className="bg-gray-700 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102"
                  >
                    {gameExists ? (
                      <div className="flex flex-col sm:flex-row">
                        <Image
                          isBlurred
                          isZoomed
                          className="w-full sm:w-[180px] h-[220px] object-cover"
                          radius="none"
                          alt={game.title || "Game Cover"}
                          src={game.coverPhoto || "default-image-url"}
                        />
                        <div className="flex flex-col justify-between p-4 w-full">
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                              {game.title || "N/A"}
                            </h2>
                            <p className="text-lg text-white mb-2">
                              <span className="line-through text-gray-400 mr-2">
                                LKR.
                                {(
                                  item.stockid.UnitPrice * item.quantity
                                ).toFixed(2)}
                              </span>
                              <span className="text-green-400 font-semibold">
                                LKR.
                                {calculateDiscountedPrice(item).toFixed(2)}
                              </span>
                            </p>
                            {item.stockid.discount > 0 && (
                              <Chip
                                color="success"
                                size="sm"
                                className="text-white"
                              >
                                {item.stockid.discount}% OFF
                              </Chip>
                            )}
                          </div>
                          <Button
                            onClick={() => handleRemoveItem(item.stockid._id)}
                            color="danger"
                            variant="flat"
                            size="sm"
                            className="self-end mt-4"
                          >
                            <DeleteIcon /> Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center p-4">
                        <p className="text-white">
                          This game has been removed by an admin or the
                          developer.
                        </p>
                        <Button
                          onClick={() => handleRemoveItem(item._id)}
                          color="danger"
                          variant="flat"
                          size="sm"
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollShadow>
          <div className="lg:w-1/3">
            <OrderSummary
              subtotal={subtotal}
              totalDiscountedTotal={totalDiscountedTotal}
              onCheckout={onOpen}
            />
          </div>
        </div>
      </div>
      <Footer />
      
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="2xl"
      >
        <ModalContent
          style={{
            backgroundColor: "#f9f9f9",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          {(onClose) => (
            <>
              <ModalHeader className="font-bold text-2xl text-gray-900">Checkout</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PAYMENT METHOD SECTION */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Payment Method</h2>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="border border-gray-300 p-5 rounded-lg mb-4">
                        <Radio value="creditCard">
                          <div className="flex items-center">
                            <CreditCardIcon />
                            <span className="text-gray-700 ml-2 mr-4">Credit Card</span>
                          </div>
                        </Radio>
                        {paymentMethod === 'creditCard' && (
                          <div className="mt-4">
                            <Input
                              label="Card Number"
                              placeholder="1111-1111-1111-1111"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              className="mb-5"
                              style={{
                                borderColor: "#e0e0e0",
                                borderRadius: "8px",
                                boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
                              }}
                            />
                            <div className="flex gap-4">
                              <Input
                                label="Expiration (MM/YY)"
                                placeholder="MM/YY"
                                value={expirationDate}
                                onChange={handleExpirationDateChange}
                                className="mb-5"
                                style={{
                                  borderColor: "#e0e0e0",
                                  borderRadius: "8px",
                                  boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
                                }}
                              />
                              <Input
                                label="CVV"
                                placeholder="123"
                                value={cvv}
                                onChange={handleCvvChange}
                                style={{
                                  borderColor: "#e0e0e0",
                                  borderRadius: "8px",
                                  boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* ORDER SUMMARY SECTION */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-blue-900">Order Summary</h2>
                    {cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center mb-4 bg-gray-50 p-4 rounded-lg shadow-sm"
                      >
                        <img
                          src={item.stockid.AssignedGame.coverPhoto}
                          alt={item.stockid.AssignedGame.title}
                          className="w-16 h-20 object-cover mr-4 rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-blue-700">{item.stockid.AssignedGame.title}</h3>
                          <p className="text-gray-700">Rs.{item.stockid.UnitPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between text-gray-900 font-semibold">
                        <span>Total</span>
                        <span>Rs.{totalDiscountedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#ff6b6b",
                    color: "#fff",
                    fontWeight: "bold",
                    boxShadow: "0px 2px 10px rgba(255, 107, 107, 0.3)",
                  }}
                  className="mr-4"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handlePlaceOrder}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    fontWeight: "bold",
                    boxShadow: "0px 2px 10px rgba(76, 175, 80, 0.3)",
                  }}
                  className="hover:bg-green-600 transition duration-300"
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CartPage;
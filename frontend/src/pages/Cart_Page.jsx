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
  Checkbox,
  Radio,
  RadioGroup
} from "@nextui-org/react";

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const PayPalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 14c-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V3.65C2.5 4.18 0 6.6 0 9.5c0 3.03 2.47 5.5 5.5 5.5h3.07c-.07-.32-.07-.66 0-1H7z"></path>
    <path d="M17 9.5c0-2.9-2.5-5.32-5.5-5.85v4.52c1.16.42 2 1.52 2 2.83 0 1.66-1.34 3-3 3H7.07c.07.34.07.68 0 1H10.5c3.03 0 5.5-2.47 5.5-5.5z"></path>
  </svg>
);

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
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [creatorCode, setCreatorCode] = useState('');
  const [agreeToShare, setAgreeToShare] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');


  //Get cart items
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

   // Calculate total, subtotal, and total of Discounted Totals
  const calculateTotal = (items) => {
    let subTotal = 0;
    let totalDiscountedTotal = 0;

    items.forEach((item) => {
      const discountedPrice = calculateDiscountedPrice(item);
      subTotal += discountedPrice * item.quantity;
      totalDiscountedTotal += discountedPrice * item.quantity;
    });

    setSubtotal(subTotal);
    setTotalDiscountedTotal(totalDiscountedTotal);
  };

   // Calculate discounted price
  const calculateDiscountedPrice = (item) => {
    const discount = item.stockid.discount || 0;
    return discount > 0
      ? item.stockid.UnitPrice * (1 - discount / 100)
      : item.stockid.UnitPrice;
  };

  //Handle Remove Items
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
        setExpirationDate('12/${year}' + year);
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

      // Check if the card is not expired
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
    }  else if (paymentMethod === "paypal") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[com]+$/;
      if (!paypalEmail || !emailPattern.test(paypalEmail)) {
        toast.error("Invalid PayPal email.");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if ((paymentMethod === 'creditCard' && (!cardNumber || !expirationDate || !cvv)) ||
        (paymentMethod === 'paypal' && !paypalEmail)) {
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
          : { paypalEmail },
        creatorCode,
        agreeToShare,
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

      const orderid = response.data._id; // Assuming the created order ID is returned in the response

      // Create order items for each cart item
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
        // Clear cart items and close modal
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
    <div className="min-h-screen font-primaryRegular">
      <Helmet>
        <title>My Cart</title>
      </Helmet>
      <Header />
      <div className="container mx-auto px-4 py-8 bg-customDark">
        <div className="bg-customDark rounded-lg shadow-lg p-8 flex flex-row">
          <ScrollShadow hideScrollBar className="w-full h-[500px]">
            <div className="flex flex-col">
              {cartItems.map((item) => {
                const game = item.stockid.AssignedGame;
                const gameExists = game && game._id;

                return (
                  <div
                    key={item._id}
                    className="flex justify-between items-center mb-4"
                  >
                    {gameExists ? (
                      <>
                        <div className="flex flex-row p-4">
                          <Image
                            isBlurred
                            isZoomed
                            className="w-[180px] h-[220px]"
                            radius="none"
                            alt={game.title || "Game Cover"}
                            src={game.coverPhoto || "default-image-url"}
                          />
                          <div className="flex flex-col m-4 p-4">
                            <h2 className="text-xl text-white">
                              {game.title || "N/A"}
                            </h2>
                            <p className="text-white mt-2">
                              <span className="line-through text-editionColor">
                                LKR.
                                {(
                                  item.stockid.UnitPrice * item.quantity
                                ).toFixed(2)}
                              </span>{" "}
                              <span className="text-white">
                                LKR.
                                {calculateDiscountedPrice(item).toFixed(2)}
                              </span>
                            </p>
                            {item.stockid.discount > 0 && (
                              <Chip
                                color="primary"
                                radius="none"
                                className="text-white mt-2"
                              >
                                {item.stockid.discount}% OFF
                              </Chip>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRemoveItem(item.stockid._id)}
                          color="danger"
                          variant="flat"
                          size="sm"
                        >
                          <DeleteIcon />
                        </Button>
                      </>
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
          <div className="mt-8 p-4 m-8 w-[30%] rounded-md bg-customCardDark h-[500px]">
            <h2 className="text-lg font-bold mb-4 text-white">Summary</h2>
            <p className="text-sm mb-2 text-white">Total: LKR.{subtotal.toFixed(2)}</p>
            <p className="text-sm mb-2 text-white">
              Discounted Total: LKR.{totalDiscountedTotal.toFixed(2)}
            </p>
            <Button
              onPress={onOpen}
              variant="bordered"
              color="primary"
              className="text-white mt-2"
              radius="none"
            >
              Checkout
            </Button>
          </div>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="center"
            size="2xl"
            scrollBehavior="inside"
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="font-primaryBold text-black">Checkout</ModalHeader>
                  <ModalBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-customCardDark p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2 text-black"> PAYMENT METHODS</h2>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                          <div className="border border-gray-900 p-5 rounded mb-4 w-[550px]">
                            <Radio value="creditCard">
                              <div className="flex items-center">
                                <CreditCardIcon />
                                <span className="text-black ml-2 mr-4">Credit Card</span>
                              
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
                                />
                                <div className="flex gap-4">
                                  <Input
                                    label="Expiration (MM/YY)"
                                    placeholder="MM/YY"
                                    value={expirationDate}
                                    onChange={handleExpirationDateChange}
                                    className="mb-5"
                                  />
                                  <Input
                                    label="CVV"
                                    placeholder="123"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="border border-gray-700 p-4 rounded">
                            <Radio value="paypal">
                              <div className="flex items-center">
                                <PayPalIcon />
                                <span className="text-black ml-2">PayPal</span>
                              </div>
                            </Radio>
                            {paymentMethod === 'paypal' && (
                              <Input
                                label="PayPal Email"
                                placeholder="your@email.com"
                                value={paypalEmail}
                                onChange={(e) => setPaypalEmail(e.target.value)}
                                className="mt-2"
                              />
                            )}
                          </div>
                        </RadioGroup>
                        {/*<Checkbox
                          isSelected={savePaymentMethod}
                          onValueChange={setSavePaymentMethod}
                          className="mt-4"
                        >
                        Save this payment method for future purchases
                        </Checkbox>*/}
                      </div>
                    </div>
                    <div className="mt-4 bg-customCardDark p-4 rounded-lg">
                      <h2 className="text-lg font-semibold mb-4 text-black">ORDER SUMMARY</h2>
                      {cartItems.map((item) => (
                        <div key={item._id} className="flex mb-4">
                          <img src={item.stockid.AssignedGame.coverPhoto} alt={item.stockid.AssignedGame.title} className="w-16 h-20 object-cover mr-4" />
                          <div>
                            <h3 className="font-semibold text-black">{item.stockid.AssignedGame.title}</h3>
                          {/*  <p className="text-sm text-gray-400">Id:{item.stockid.AssignedGame.developer}</p>*/}
                            <p className="text-black">Rs.{item.stockid.UnitPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <div className="flex justify-between text-black">
                          <span>Total</span>
                          <span>Rs.{totalDiscountedTotal.toFixed(2)}</span>
                        </div>
                        <div className="bg-yellow-900 text-yellow-200 p-2 rounded mt-2 text-sm">
                          Get some rewards with this purchase.
                        </div>
                      </div>
                    {/*}  <Input
                        label="Enter creator code"
                        value={creatorCode}
                        onChange={(e) => setCreatorCode(e.target.value)}
                        className="mt-4"
                      />*/}
                      <Checkbox
                        isSelected={agreeToShare}
                        onValueChange={setAgreeToShare}
                        className="mt-4"
                      >
                        Agree to share your email for marketing purposes
                      </Checkbox>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" onPress={handlePlaceOrder}>
                      PLACE ORDER
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
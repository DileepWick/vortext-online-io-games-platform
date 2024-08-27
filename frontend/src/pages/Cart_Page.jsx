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
// Next UI
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
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";

const CartPage = () => {
  // Authenticate user
  useAuthCheck();

  // Modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscountedTotal, setTotalDiscountedTotal] = useState(0);

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0); // This will be set dynamically
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Card Number validation
    const cardNumberPattern = /^[0-9]{16}$/;
    if (!cardNumberPattern.test(cardNumber)) {
      newErrors.cardNumber = "Card Number must be 16 digits";
    }

    // Expiry Date validation
    const expiryDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
    if (!expiryDatePattern.test(expiryDate)) {
      newErrors.expiryDate = "Expiry Date must be in MM/YY format";
    }

    // CVV validation
    const cvvPattern = /^[0-9]{3,4}$/; // 3 or 4 digits
    if (!cvvPattern.test(cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Get CartItems
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
    setPaymentAmount(subTotal); // Set payment amount to subtotal initially
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (item) => {
    const discount = item.stockid.discount || 0;
    return discount > 0
      ? item.stockid.UnitPrice * (1 - discount / 100)
      : item.stockid.UnitPrice;
  };

  // Handle Remove Item
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

  // Handle Payment form submission
  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);

        // Order data
        const orderData = {
          paymentAmount: totalDiscountedTotal,
        };

        // Add new order
        const response = await axios.post(
          `http://localhost:8098/orders/create/${userId}`,
          orderData
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
            return axios.post(
              `http://localhost:8098/orderItems/`,
              orderItemData
            );
          })
        );

        // Clear cart and show success message
        setCartItems([]);
        toast.success("Game bought successfully ..Enjoy !", {
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
      } catch (err) {
        setError("Error placing order");
      }
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
        <Header />
        <p className="text-center text-white font-primaryRegular text-5xl mt-[100px]">
            Cart is empty
          </p>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8 bg-customDark">
        <div className="bg-customDark rounded-lg shadow-lg p-8 flex flex-row">
          <ScrollShadow hideScrollBar className="w-full h-[500px]">
            <div className="flex flex-col">
              {cartItems.map((item) => {
                // Check if the game information exists
                const game = item.stockid.AssignedGame;
                const gameExists = game && game._id; // Adjust this if your ID field name is different

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
                            src={game.coverPhoto || "default-image-url"} // Replace with a default image URL if needed
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
            <p className="text-sm mb-2 text-white">Total: LKR.{subtotal}</p>
            <p className="text-sm mb-2 text-white">
              Discounted Total: LKR.{totalDiscountedTotal}
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
            radius="none"
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="font-primaryBold">
                    Checkout
                  </ModalHeader>
                  <form onSubmit={handlePaymentSubmit}>
                    <ModalBody>
                      <Input
                        isClearable
                        className="mt-2"
                        label="Card Number"
                        type="text"
                        radius="none"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onValueChange={setCardNumber}
                        validationState={
                          errors.cardNumber ? "invalid" : "valid"
                        }
                        errorMessage={errors.cardNumber}
                      />
                      <div className="flex flex-row mt-4">
                        <Input
                          isClearable
                          className="mr-4"
                          label="Expiry Date"
                          placeholder="MM/YY"
                          radius="none"
                          type="text"
                          value={expiryDate}
                          onValueChange={setExpiryDate}
                          validationState={
                            errors.expiryDate ? "invalid" : "valid"
                          }
                          errorMessage={errors.expiryDate}
                        />
                        <Input
                          isClearable
                          className="ml-4"
                          label="CVV"
                          placeholder="123"
                          radius="none"
                          type="text"
                          value={cvv}
                          onValueChange={setCvv}
                          validationState={errors.cvv ? "invalid" : "valid"}
                          errorMessage={errors.cvv}
                        />
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="primary"
                        type="submit"
                        radius="none"
                        className="text-white"
                      >
                        Pay LKR. {paymentAmount}
                      </Button>
                    </ModalFooter>
                  </form>
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

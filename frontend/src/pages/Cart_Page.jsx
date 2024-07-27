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
  Radio,
  RadioGroup,
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
  const [numberOfItems, setNumberOfItems] = useState(0);

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0); // This will be set dynamically

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
        setNumberOfItems(response.data.cartItems.length);
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
      const discount = item.stockid.discount || 0;
      const discountedPrice =
        discount > 0
          ? item.stockid.UnitPrice * (1 - discount / 100)
          : item.stockid.UnitPrice;
      subTotal += discountedPrice * item.quantity;
      totalDiscountedTotal += discountedPrice * item.quantity;
    });

    setSubtotal(subTotal);
    setTotalDiscountedTotal(totalDiscountedTotal);
    setPaymentAmount(subTotal); // Set payment amount to subtotal initially
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

    // Basic form validation
    if (!cardNumber || !expiryDate || !cvv) {
      setError("Please fill in all required fields.");
      return;
    }

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
          return axios.post(`http://localhost:8098/orderItems/`, orderItemData);
        })
      );

      // Clear cart and show success message
      setCartItems([]);
      toast.success("Order Placed Successfully !", {
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
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) {
    const errorMessage = error?.message || "Error occurred";
    return <p className="text-center mt-8">Error: {errorMessage}</p>;
  }

  if (cartItems.length === 0)
    return (
      <div className="bg-customDark min-h-screen">
        <Header />
        <p className="text-center mt-8 text-lg text-white">
          No items in the cart
        </p>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8 bg-customDark">
        <div className="bg-customDark rounded-lg shadow-lg p-8 flex flex-row">
          <ScrollShadow hideScrollBar className="w-[1500px] h-[cd ]">
            <div className="flex flex-col ">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center mb-4"
                >
                  <div className="flex flex-row p-4">
                    <Image
                      isBlurred
                      isZoomed
                      className="w-[180px] h-[220px]"
                      radius="none"
                      alt="Game Cover"
                      src={item.stockid.AssignedGame.coverPhoto}
                    />
                    <div className="flex flex-col m-4 p-4">
                      <h2 className="text-xl text-white">
                        {item.stockid.AssignedGame.title}
                      </h2>
                      <p className="text-white mt-2">
                        <span className="line-through text-editionColor">
                          LKR.
                          {(item.stockid.UnitPrice * item.quantity).toFixed(2)}
                        </span>{" "}
                        <span className="text-white">
                          LKR.
                          {discountedPrice(item).toFixed(2)}
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
                </div>
              ))}
            </div>
          </ScrollShadow>
          <div className="mt-8 p-4 m-8 w-[500px] bg-customDark text-white">
            <div className="p-4 bg-headerDark rounded-lg shadow-md text-white">
              <h1 className="text-lg text-gray-300 mb-4 underline">
                Order Summary
              </h1>

              <div className="mb-4">
                <h2 className="text-lg text-editionColor mb-1">Subtotal</h2>
                <p className="text-xl ">${subtotal.toFixed(2)}</p>
              </div>

              <Button
                onPress={onOpen}
                color="primary"
                radius="none"
                size="md"
                className="w-full mt-4"
              >
                CHECK OUT
              </Button>
            </div>

            <Modal
              backdrop="opaque"
              size="5xl"
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              classNames={{
                backdrop:
                  "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20 font-primaryRegular",
              }}
            >
              <ModalContent className="max-h-screen">
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 font-primaryRegular">
                      Payment Details
                    </ModalHeader>
                    <ModalBody>
                      <form onSubmit={handlePaymentSubmit} className="p-4">
                        <Input
                          aria-label="Card Number"
                          type="text"
                          label="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="Card Number"
                          className="mb-4"
                        />
                        <Input
                          aria-label="Expiry Date"
                          type="text"
                          label="Expiry Date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          className="mb-4"
                        />
                        <Input
                          aria-label="CVV"
                          type="text"
                          label="CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="CVV"
                          className="mb-4"
                        />
                        <p className="text-lg text-white mb-4">
                          Total Amount: LKR. {paymentAmount.toFixed(2)}
                        </p>
                        <Button
                          type="submit"
                          color="success"
                          radius="none"
                          size="md"
                          className="w-full mt-4"
                        >
                          Submit Payment
                        </Button>
                      </form>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        auto
                        flat
                        color="error"
                        onPress={() => {
                          onClose();
                        }}
                      >
                        Close
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const discountedPrice = (item) => {
  const discount = item.stockid.discount || 0;
  return discount > 0
    ? item.stockid.UnitPrice * (1 - discount / 100)
    : item.stockid.UnitPrice;
};

export default CartPage;

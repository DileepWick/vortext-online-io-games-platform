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

//Next Ui
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

  //Modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscountedTotal, setTotalDiscountedTotal] = useState(0);
  const [numberOfItems, setNumberoFItems] = useState(0);

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [region, setRegion] = useState("");
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
        setNumberoFItems(cartItems.length);
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
          : item.stockid.UnitPrice; // Calculate discounted price if discount > 0, else use regular price
      subTotal += discountedPrice * item.quantity;
      totalDiscountedTotal += discountedPrice * item.quantity; // Always add discounted price to totalDiscountedTotal
    });

    setSubtotal(subTotal);
    setTotalPrice(subTotal); // Set totalPrice initially to subtotal
    setTotalDiscountedTotal(totalDiscountedTotal);
    setPaymentAmount(subTotal); // Set payment amount to subtotal initially
  };

  // Handle Quantity change
  const handleQuantityChange = async (stockid, newQuantity) => {
    try {
      if (newQuantity <= 0) return;

      const response = await axios.put(
        `http://localhost:8098/cartItems/updateCartItem/${stockid}`,
        { quantity: newQuantity }
      );

      if (response.status === 200) {
        const updatedItems = cartItems.map((item) =>
          item.stockid._id === stockid
            ? {
                ...item,
                quantity: newQuantity,
                total: item.stockid.UnitPrice * newQuantity,
              }
            : item
        );
        setCartItems(updatedItems);
        calculateTotal(updatedItems);
      }
    } catch (error) {
      setError("Error updating cart item quantity");
    }
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
    if (!cardNumber || !expiryDate || !cvv || !shippingAddress || !region) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);

      // Order data
      const orderData = {
        shippingAddress,
        region,
        paymentAmount: totalDiscountedTotal,
      };

      // Add new order
      const response = await axios.post(
        `http://localhost:8098/orders/create/${userId}`,
        orderData
      );

      const orderid = response.data._id; // Assuming the created order ID is returned in the response

      // Create order items for each cart item
      cartItems.map((item) => {
        const orderItemData = {
          order: orderid,
          stockid: item.stockid._id,
          quantity: item.quantity,
          price: item.stockid.UnitPrice,
        };
        return axios.post(`http://localhost:8098/orderItems/`, orderItemData);
      });

      // Clear cart and show success message
      setCartItems([]);
      setShowPaymentForm(false);
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
      setError(err);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8">Error: {error}</p>;

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
    <div className=" min-h-screen font-primaryRegular">
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
                      alt="NextUI Fruit Image with Zoom"
                      src={item.stockid.AssignedGame.coverPhoto}
                    />
                    <div className="flex flex-col m-4 p-4">

                      <h2 className="text-xl  text-white">
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
          <div className="mt-8 p-4 m-8  w-[500px] bg-customDark text-white">
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
                      Place Order
                    </ModalHeader>
                    <ModalBody className="max-h-96 overflow-auto">
                      <Input
                        type="text"
                        value={cardNumber}
                        label="Card number"
                        className="font-primaryRegular"
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                      <Input
                        type="text"
                        value={cvv}
                        label="CVV"
                        onChange={(e) => setCvv(e.target.value)}
                        className="font-primaryRegular"
                        required
                      />
                      <Input
                        type="text"
                        value={expiryDate}
                        label="Expiry Date"
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="font-primaryRegular"
                        required
                      />
                      <Input
                        type="text"
                        value={shippingAddress}
                        label="Shipping Address"
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="font-primaryRegular"
                        required
                      />
                      <RadioGroup
                        label="Select region"
                        className="font-primaryRegular"
                      >
                        <Radio
                          value="Northern"
                          onChange={() => setRegion("Northern")}
                        >
                          Northern
                        </Radio>
                        <Radio
                          value="North Western"
                          onChange={() => setRegion("North Western")}
                        >
                          North Western
                        </Radio>
                        <Radio
                          value="Western"
                          onChange={() => setRegion("Western")}
                        >
                          Western
                        </Radio>
                        <Radio
                          value="North Central"
                          onChange={() => setRegion("North Central")}
                        >
                          North Central
                        </Radio>
                        <Radio
                          value="Central"
                          onChange={() => setRegion("Central")}
                        >
                          Central
                        </Radio>
                        <Radio
                          value="Sabaragamuwa"
                          onChange={() => setRegion("Sabaragamuwa")}
                        >
                          Sabaragamuwa
                        </Radio>
                        <Radio
                          value="Eastern"
                          onChange={() => setRegion("Eastern")}
                        >
                          Eastern
                        </Radio>
                        <Radio value="Uva" onChange={() => setRegion("Uva")}>
                          Uva
                        </Radio>
                        <Radio
                          value="Southern"
                          onChange={() => setRegion("Southern")}
                        >
                          Southern
                        </Radio>
                      </RadioGroup>
                      <Input
                        type="text"
                        value={`$${paymentAmount.toFixed(2)}`}
                        label="Payment"
                        readOnly
                        className="font-primaryRegular"
                        required
                      />
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={onClose}
                        className="font-primaryRegular"
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        onPress={onClose}
                        className="font-primaryRegular"
                        onClick={handlePaymentSubmit}
                      >
                        Place Order
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
    ? item.stockid.UnitPrice * (1 - discount / 100) * item.quantity
    : item.stockid.UnitPrice * item.quantity;
};

export default CartPage;

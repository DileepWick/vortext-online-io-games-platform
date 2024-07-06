import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";
import useAuthCheck from "../utils/authCheck";
import Header from "../components/header";
import Footer from "../components/footer";

//Next Ui
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { Select, SelectSection, SelectItem } from "@nextui-org/select";

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
      alert("Order placed successfully!");
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8">Error: {error}</p>;

  if (cartItems.length === 0)
    return (
      <div className="bg-gray-800 min-h-screen">
        <Header />
        <p className="text-center mt-8">No items in the cart</p>
        <Footer />
      </div>
    );

  return (
    <div className=" min-h-screen font-primaryRegular">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">My Cart</h1>
          <div>
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center mb-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {item.stockid.AssignedGame.title}
                  </h2>
                  <p className="text-gray-700">
                    Platform: {item.stockid.Platform}
                  </p>
                  <p className="text-gray-700">
                    Edition: {item.stockid.Edition}
                  </p>
                  <p className="text-gray-700">
                    Price: ${item.stockid.UnitPrice}
                  </p>
                  <p className="text-gray-700">
                    Total: $
                    {(item.stockid.UnitPrice * item.quantity).toFixed(2)}
                  </p>
                  {item.stockid.discount > 0 && (
                    <p className="text-gray-700">
                      Discount: {item.stockid.discount}%
                    </p>
                  )}
                  <p className="text-gray-700">
                    Discounted Total: ${discountedPrice(item).toFixed(2)}
                  </p>
                  <p className="text-gray-700">
                    Stock available: {item.stockid.NumberOfUnits}
                  </p>
                </div>
                <div>
                  <Button
                    onClick={() =>
                      handleQuantityChange(item.stockid._id, item.quantity - 1)
                    }
                    color="danger" variant="bordered"
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.stockid._id,
                        Number(e.target.value)
                      )
                    }
                    className="w-16 text-center border-gray-300"
                  />
                  <Button
                    onClick={() =>
                      handleQuantityChange(item.stockid._id, item.quantity + 1)
                    }
                    color="success" variant="bordered"
                  >
                    +
                  </Button>
                </div>
                <Button
                  onClick={() => handleRemoveItem(item.stockid._id)}
                  color="danger" variant="bordered"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 ">
            <h2 className="text-2xl font-bold text-gray-800">
              Subtotal: ${subtotal.toFixed(2)}
            </h2>
            <Button onPress={onOpen}  color="primary" variant="shadow">Proceed to Payment</Button>
            <Modal
              backdrop="opaque"
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              classNames={{
                backdrop:
                  "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20 font-primaryRegular",
              }}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 font-primaryRegular">
                      Place Order
                    </ModalHeader>
                    <ModalBody>
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
                      />{" "}
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
                      <Select
                        label="Region"
                        placeholder="Select your region"
                        className="max-w-xs font-primaryRegular"
                        onChange={(e) => setRegion(e.target.value)}
                        value={region}
                      >
                        <SelectItem className="max-w-xs font-primaryRegular">
                          North
                        </SelectItem>
                        <SelectItem className="max-w-xs font-primaryRegular">
                          South
                        </SelectItem>
                        <SelectItem className="max-w-xs font-primaryRegular">
                          West
                        </SelectItem>
                        <SelectItem className="max-w-xs font-primaryRegular">
                          East
                        </SelectItem>
                      </Select>
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

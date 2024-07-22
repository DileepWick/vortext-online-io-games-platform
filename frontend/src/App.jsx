import React from "react";
import { Routes, Route } from "react-router-dom";

//Pages
import CreateBook from "./pages/CreateBook";
import Home from "./pages/Home";
import Login from "./pages/login";
import ManageBooks from "./pages/ManageBooks";
import Profile from "./pages/profile";
import AddGameForm from "./pages/add_new_game";
import Shop from "./pages/Shop";
import GameDetails from "./pages/GameDetails"
import CartPage from "./pages/Cart_Page"
import OrderHistory from "./pages/my_orders"
import ArticleList from "./pages/articles";
import Contact from "./pages/Contact"

//Dashboards
import ProductManagerDashboard from "../dashboards/product_manager_dashboard";
import OrderManagerDashboard from "../dashboards/order_manager_dashboard"
import BloggerDashboard from "../dashboards/blogger_dashboard";
import CourierDashBoard from "../dashboards/courier_dashboard";
import ContactDash from "../dashboards/Customer suport";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/books/addNewBook" element={<CreateBook />} />
      <Route path="/books/manageBooks" element={<ManageBooks />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/adminAddNewGame" element={<AddGameForm />} />
      <Route path="/Shop" element={<Shop />} />
      <Route path="/game/:id" element={<GameDetails/>} />
      <Route path="/cartItems" element={<CartPage/>} />
      <Route path="/myorders" element={<OrderHistory/>}/>
      <Route path="/articles" element={<ArticleList/>} />
      <Route path="/productDashboard" element={<ProductManagerDashboard/>}/>
      <Route path="/ordersDashboard" element={<OrderManagerDashboard/>}/>
      <Route path="/bloggerDashboard" element={<BloggerDashboard/>}/>
      <Route path="/courierDashboard" element={<CourierDashBoard/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/ContactDash" element={<ContactDash/>}/>
    </Routes>
  );
};

export default App;

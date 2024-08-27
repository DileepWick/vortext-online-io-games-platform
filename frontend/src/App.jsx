import React from "react";
import { Routes, Route } from "react-router-dom";

//Pages
import Home from "./pages/Home";
import Login from "./pages/login";
import Profile from "./pages/profile";
import AddGameForm from "./pages/add_new_game";
import Shop from "./pages/Shop";
import GameDetails from "./pages/GameDetails";
import CartPage from "./pages/Cart_Page";
import MyLibrary from "./pages/My_Library";
import ArticleList from "./pages/articles";
import Contact from "./pages/Contact";
import GamingSessions from "./pages/GamingSessions";
import Community from "./pages/community";
import SessionHistory from "./pages/SessionHistory";
import Support from "./pages/Support";
import FAQsPage from "./pages/FAQsPage";
import HandleRentals from "./pages/HandleRentals";
import RentalGamesEmbed from "./pages/RentalGamesEmbed";
import TailoredGames from "./pages/tailoredGames";

//Gameplay
import GameEmbed from "./pages/GameEmbed";

//Dashboards
import ProductManagerDashboard from "../dashboards/product_manager_dashboard";
import OrderManagerDashboard from "../dashboards/order_manager_dashboard";
import BloggerDashboard from "../dashboards/blogger_dashboard";
import CourierDashBoard from "../dashboards/courier_dashboard";
import Review_manager from "../dashboards/review_dashboard";
import ContactDash from "../dashboards/Customer suport";
import SessionManagerDash from "../dashboards/session_manager_dashbord";
import StaffManager from "../dashboards/staff_manager_dashboard";
import CommunityDashBoard from  "../dashboards/communityDashboard";
import UserManagementDashboard from "../dashboards/UserManagementDashboard";
import Payment_Manager from "../dashboards/Payment_manager_dashboard";
import RentedGamesSection from "../dashboards/rentedGamesDash";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/adminAddNewGame" element={<AddGameForm />} />
      <Route path="/Shop" element={<Shop />} />
      <Route path="/game/:id" element={<GameDetails />} />
      <Route path="/cartItems" element={<CartPage />} />
      <Route path="/mylibrary" element={<MyLibrary />} />
      <Route path="/articles" element={<ArticleList />} />
      <Route path="/productDashboard" element={<ProductManagerDashboard />} />
      <Route path="/ordersDashboard" element={<OrderManagerDashboard />} />
      <Route path="/bloggerDashboard" element={<BloggerDashboard />} />
      <Route path="/courierDashboard" element={<CourierDashBoard />} />
      <Route path="/CommunityDashBoard" element={<CommunityDashBoard />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/review_dashboard" element={<Review_manager />} />
      <Route path="/ContactDash" element={<ContactDash />} />
      <Route path="/sessionDashboard" element={<SessionManagerDash />} />
      <Route path="/GamingSessions" element={<GamingSessions />} />
      <Route path="/support" element={<Support />} />
      <Route path="/review_dashboard" element={<Review_manager />} />
      <Route path="/playgame/:src/:title" element={<GameEmbed />} />
      <Route path="/faq" element={<FAQsPage />} />
      <Route path="/community" element={<Community />} />
      <Route path="/UserManagementDashboard"element={<UserManagementDashboard />}/>
      <Route path="/SessionHistory" element={<SessionHistory />} />
      <Route path="/HandleRentals/:id" element={<HandleRentals />} />
      <Route path="/Payment_manager_dashboard" element={<Payment_Manager />} />
      <Route path="/RentalGamesEmbed/:src/:title" element={<RentalGamesEmbed />} />
      <Route path="/TailoredGames" element={<TailoredGames />} />
      <Route path="/RentedGamesSection" element={<RentedGamesSection />} />
    </Routes>
  );
};

export default App;

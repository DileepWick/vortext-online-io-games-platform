import React, { useEffect, useState, forwardRef } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  User,
} from "@nextui-org/react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationIcon } from "../assets/icons/NotificationIcon.jsx";

// Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";

const Header = forwardRef((props, ref) => {
  const [user, setUser] = useState(null);
  const token = getToken();
  const userId = getUserIdFromToken(token);
  const navigate = useNavigate();
  const location = useLocation();

  const variants = ["solid", "underlined", "bordered", "light"];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8098/users/profile/${userId}`
        );
        setUser(response.data.profile);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };

  return (
    <div className="bg-customDark">
      <Navbar className="font-primaryRegular bg-customDark text-white py-2 px-4">
        <NavbarContent
          className="hidden sm:flex justify-start items-center w-full"
          justify="start"
        >
          <NavbarItem className="mr-4">
            <Link
              color={location.pathname === "/" ? "blue" : "foreground"}
              href="/"
              className={`${
                location.pathname === "/" ? "text-blue-500" : "text-white"
              } hover:text-blue-300 transition-colors duration-200`}
            >
              HOME
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link
              color={location.pathname === "/shop" ? "blue" : "foreground"}
              href="/shop"
              className={`${
                location.pathname === "/shop" ? "text-blue-500" : "text-white"
              } hover:text-blue-300 transition-colors duration-200`}
            >
              SHOP
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link
              color={location.pathname === "/articles" ? "blue" : "foreground"}
              href="/articles"
              className={`${
                location.pathname === "/articles"
                  ? "text-blue-500"
                  : "text-white"
              } hover:text-blue-300 transition-colors duration-200`}
            >
              COMMUNITY
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link
              color={location.pathname === "/chat" ? "blue" : "foreground"}
              href="/chat"
              className={`${
                location.pathname === "/chat" ? "text-blue-500" : "text-white"
              } hover:text-blue-300 transition-colors duration-200`}
            >
              CHAT
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link
              color={
                location.pathname === "/TailoredGames" ? "blue" : "foreground"
              }
              href="/TailoredGames"
              className={`${
                location.pathname === "/TailoredGames"
                  ? "text-blue-500"
                  : "text-white"
              } hover:text-blue-300 transition-colors duration-200`}
            >
              OUR GAMES
            </Link>
          </NavbarItem>
          <Dropdown placement="bottom-start" className="bg-gray-800 text-white">
            <DropdownTrigger>
              <NavbarItem className="cursor-pointer hover:text-blue-300 transition-colors duration-200 mr-4">
                SUPPORT
              </NavbarItem>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Profile Actions"
              variant="flat"
              className="font-primaryRegular bg-gray-800 text-white"
            >
              <DropdownItem
                key="support"
                onClick={() => navigate("/support")}
                className="hover:bg-gray-700"
              >
                Vortex Support
              </DropdownItem>
              <DropdownItem
                Key="contactus"
                onClick={() => navigate("/support#contactForm")}
                className="hover:bg-gray-700"
              >
                Contact Us
              </DropdownItem>
              <DropdownItem
                key="privacy"
                onClick={() => navigate("/privacyPolicy")}
                className="hover:bg-gray-700"
              >
                Privacy Policy
              </DropdownItem>
              <DropdownItem
                key="about"
                onClick={() => navigate("/about")}
                className="hover:bg-gray-700"
              >
                About Vortex
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start" className="bg-gray-800 text-white">
            <DropdownTrigger>
              <NavbarItem className="cursor-pointer flex items-center hover:text-blue-300 transition-colors duration-200">
                <NotificationIcon style={{ marginRight: "8px" }} />
                <span
                  className={`${
                    location.pathname === "/Notification" ? "text-blue-500" : ""
                  }`}
                >
                  {" "}
                </span>
              </NavbarItem>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Notification Actions"
              variant="flat"
              className="font-primaryRegular bg-gray-800 text-white"
            >
              <DropdownItem
                onClick={() => navigate("/Notification")}
                className="hover:bg-gray-700"
              >
                View All Notifications
              </DropdownItem>
              <DropdownItem
                onClick={() => navigate("/UserMessage")}
                className="hover:bg-gray-700"
              >
                View All Messages
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        <NavbarContent as="div" justify="end">
          {token && user ? (
            <Dropdown placement="bottom-end" className="bg-gray-800 text-white">
              <DropdownTrigger>
                <User
                  className="cursor-pointer text-white"
                  name={user.username}
                  description={user.role}
                  avatarProps={{
                    src: user.profilePic,
                  }}
                />
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Profile Actions"
                variant="flat"
                className="font-primaryRegular bg-gray-800 text-white"
              >
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  onClick={() => navigate("/profile")}
                  className="hover:bg-gray-700"
                >
                  My Settings
                </DropdownItem>
                <DropdownItem
                  key="orders"
                  onClick={() => navigate("/mylibrary")}
                  className="hover:bg-gray-700"
                >
                  My Library
                </DropdownItem>
                <DropdownItem
                  key="cart"
                  onClick={() => navigate("/GamingSessions")}
                  className="hover:bg-gray-700"
                >
                  Rentals
                </DropdownItem>
                <DropdownItem
                  key="cart"
                  onClick={() => navigate("/cartItems")}
                  className="hover:bg-gray-700"
                >
                  My Cart
                </DropdownItem>
                <DropdownItem
                  key="cart"
                  onClick={() => navigate("/Transaction")}
                  className="hover:bg-gray-700"
                >
                  Transaction History
                </DropdownItem>

                {/* Role-based menu items */}
                {user.role === "developer" && (
                  <DropdownItem
                    key="developer-panel"
                    onClick={() => navigate("/GamedeveloperDashboard")}
                    className="hover:bg-gray-700"
                  >
                    Developer Dashboard
                  </DropdownItem>
                )}
                {user.role === "Product Manager" && (
                  <DropdownItem
                    key="admin-panel"
                    onClick={() => navigate("/productDashboard")}
                    className="hover:bg-gray-700"
                  >
                    Products Dashboard
                  </DropdownItem>
                )}
                {user.role === "User Manager" && (
                  <DropdownItem
                    key="Admin-panel"
                    onClick={() => navigate("/UserManagementDashboard")}
                    className="hover:bg-gray-700"
                  >
                    User Management
                  </DropdownItem>
                )}
                {user.role === "Order Manager" && (
                  <DropdownItem
                    key="orders-panel"
                    onClick={() => navigate("/ordersDashboard")}
                    className="hover:bg-gray-700"
                  >
                    Order Management
                  </DropdownItem>
                )}
                {user.role === "Blogger" && (
                  <DropdownItem
                    key="blogger-panel"
                    onClick={() => navigate("/bloggerDashboard")}
                    className="hover:bg-gray-700"
                  >
                    Blogger Dashboard
                  </DropdownItem>
                )}
                {user.role === "Session_Manager" && (
                  <DropdownItem
                    key="session-panel"
                    onClick={() => navigate("/sessionDashboard")}
                    className="hover:bg-gray-700"
                  >
                    Session Dashboard
                  </DropdownItem>
                )}
                {user.role === "Community Manager" && (
                  <DropdownItem
                    key="community-panel"
                    onClick={() => navigate("/CommunityDashBoard")}
                    className="hover:bg-gray-700"
                  >
                    Community Dashboard
                  </DropdownItem>
                )}
                {user.role === "Review Manager" && (
                  <DropdownItem
                    key="Review-panel"
                    onClick={() => navigate("/review_dashboard")}
                    className="hover:bg-gray-700"
                  >
                    Review Dashboard
                  </DropdownItem>
                )}
                {user.role === "Support Agent" && (
                  <DropdownItem
                    key="support-panel"
                    onClick={() => navigate("/ContactDash")}
                    className="hover:bg-gray-700"
                  >
                    Customer Support Panel
                  </DropdownItem>
                )}
                {user.role === "Staff_Manager" && (
                  <DropdownItem
                    key="manage-staff"
                    onClick={() => navigate("/staffManager")}
                    className="hover:bg-gray-700"
                  >
                    Manage Staff
                  </DropdownItem>
                )}
                {user.role === "Payment Manager" && (
                  <DropdownItem
                    key="manage-payment"
                    onClick={() => navigate("/Payment_manager_dashboard")}
                    className="hover:bg-gray-700"
                  >
                    Payment Management Dashboard
                  </DropdownItem>
                )}

                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={handleLogout}
                  className="text-red-500 hover:bg-gray-700"
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link
              className="text-white hover:text-blue-300 transition-colors duration-200"
              href="/login"
            >
              LOGIN
            </Link>
          )}
        </NavbarContent>
      </Navbar>
    </div>
  );
});

export default Header;

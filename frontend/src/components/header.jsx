import React, { useEffect, useState } from "react";
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

// Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { getToken } from "../utils/getToken";

export default function Header() {
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
    <div className="bg-headerDark">
      <Navbar
        className="font-primaryRegular bg-headerDark text-white"
        position="sticky"
      >
        <NavbarBrand>
          <p className="font-bold text-white">VORTEX GAMING</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link
              color={location.pathname === "/" ? "white" : "default"}
              href="/"
              className={`${
                location.pathname === "/" ? "underline" : ""
              } text-white hover:underline`}
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/shop" ? "danger" : "default"}
              href="/shop"
              className={`${
                location.pathname === "/shop" ? "underline" : ""
              } text-white hover:underline`}
            >
              Shop
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/articles" ? "primary" : "white"}
              href="/articles"
              className={`${
                location.pathname === "/articles" ? "underline" : ""
              } text-white hover:underline`}
            >
              Articles
            </Link>
          </NavbarItem>

          <NavbarItem>
            <Link
              color={location.pathname === "/reviews" ? "primary" : "white"}
              href="#"
              className={`${
                location.pathname === "/reviews" ? "underline" : ""
              } text-white hover:underline`}
            >
              Reviews
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/contact" ? "primary" : "white"}
              href="/contact"
              className={`${
                location.pathname === "/contact" ? "underline" : ""
              } text-white hover:underline`}
            >
              Contact
            </Link>
          </NavbarItem>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <NavbarItem>Support</NavbarItem>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Profile Actions"
              variant="flat"
              className="font-primaryRegular text-black"
            >
              <DropdownItem key="support" onClick={() => navigate("/support")}>
                Vortex Support
              </DropdownItem>
              <DropdownItem
                key="privacy"
                onClick={() => navigate("/privacyPolicy")}
              >
                Privacy Policy
              </DropdownItem>
              <DropdownItem key="about" onClick={() => navigate("/about")}>
                About Vortex
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        <NavbarContent as="div" justify="end">
          {token && user ? (
            <Dropdown placement="bottom-end">
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
                className="font-primaryRegular text-black"
              >
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  onClick={() => navigate("/profile")}
                >
                  My Settings
                </DropdownItem>
                <DropdownItem
                  key="orders"
                  onClick={() => navigate("/mylibrary")}
                >
                  My Library
                </DropdownItem>
                <DropdownItem
                  key="cart"
                  onClick={() => navigate("/GamingSessions")}
                >
                  Rentals
                </DropdownItem>
                <DropdownItem key="cart" onClick={() => navigate("/cartItems")}>
                  My Cart
                </DropdownItem>

                {/* Admin Filter */}
                {user.role === "admin" && (
                  <DropdownItem
                    key="admin-panel"
                    onClick={() => navigate("/productDashboard")}
                  >
                    Admin Panel
                  </DropdownItem>
                )}

                {/* Admin user Filter */}
                {user.role === "Admin" && (
                  <DropdownItem
                    key="Admin-panel"
                    onClick={() => navigate("/UserManagementDashboard")}
                  >
                    User Managemnt
                  </DropdownItem>
                )}

                {/* Order Manager Filter */}
                {user.role === "Order Manager" && (
                  <DropdownItem
                    key="orders-panel"
                    onClick={() => navigate("/ordersDashboard")}
                  >
                    Order Management
                  </DropdownItem>
                )}

                {/* Blogger Filter */}
                {user.role === "Blogger" && (
                  <DropdownItem
                    key="blogger-panel"
                    onClick={() => navigate("/bloggerDashboard")}
                  >
                    Blogger Dashboard
                  </DropdownItem>
                )}

                {/* Session Manager Filter */}
                {user.role === "Session_Manager" && (
                  <DropdownItem
                    key="session-panel"
                    onClick={() => navigate("/sessionDashboard")}
                  >
                    Session Dashboard
                  </DropdownItem>
                )}

                {/* Courier Filter */}
                {user.role === "Courier" && (
                  <DropdownItem
                    key="courier-panel"
                    onClick={() => navigate("/courierDashboard")}
                  >
                    Courier Dashboard
                  </DropdownItem>
                )}

                {/*Review manager*/}
                {user.role === "Review_Manager" && (
                  <DropdownItem
                    key="Review-panel"
                    onClick={() => navigate("/review_dashboard")}
                  >
                    Review Dashboard
                  </DropdownItem>
                )}

                {/* Customer Support Filter */}
                {user.role === "customeragent" && (
                  <DropdownItem
                    key="support-panel"
                    onClick={() => navigate("/ContactDash")}
                  >
                    Customer Support Panel
                  </DropdownItem>
                )}

                {/* Staff Manager Filter */}
                {user.role === "Staff_Manager" && (
                  <DropdownItem
                    key="manage-staff"
                    onClick={() => navigate("/staffManager")}
                  >
                    Manage Staff
                  </DropdownItem>
                )}

                  {/* Payment Manager Filter */}
                  {user.role === "Customer" && (
                  <DropdownItem
                    key="manage-payment"
                    onClick={() => navigate("/Payment_manager_dashboard")}
                  >
                    Manage payment
                  </DropdownItem>
                )}


                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link className="text-white" href="/login">
              Login
            </Link>
          )}
        </NavbarContent>
      </Navbar>
    </div>
  );
}

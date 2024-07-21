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
  Divider,
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
    <div>
      <Navbar className="font-primaryRegular text-black" shouldHideOnScroll>
        <NavbarBrand>
          <p className="font-bold text-inherit">GAME STORE</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link
              color={location.pathname === "/" ? "primary" : "default"}
              href="/"
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/shop" ? "danger" : "default"}
              href="/shop"
            >
              Shop
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/articles" ? "primary" : "white"}
              href="/articles"
            >
              Articles
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/Testingpage" ? "primary" : "white"}
              href="/Testingpage"
            >
              Gaming Sessions
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/reviews" ? "primary" : "white"}
              href="#"
            >
              Reviews
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/contact" ? "primary" : "white"}
              href="/contact"
            >
              Contact
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent as="div" justify="end">
          {token && user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <User
                  className="cursor-pointer text-black"
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
                  onClick={() => navigate("/myorders")}
                >
                  My Orders
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

                {/* Order Manager Filter */}
                {user.role === "Order Manager" && (
                  <DropdownItem
                    key="orders-panel"
                    onClick={() => navigate("/ordersDashboard")}
                  >
                    Order Management
                  </DropdownItem>
                )}

                {/* Order Manager Filter */}
                {user.role === "Blogger" && (
                  <DropdownItem
                    key="orders-panel"
                    onClick={() => navigate("/bloggerDashboard")}
                  >
                    Blogger Dashboard
                  </DropdownItem>
                )}
                {/* Courier  Filter */}
                {user.role === "Courier" && (
                  <DropdownItem
                    key="orders-panel"
                    onClick={() => navigate("/courierDashboard")}
                  >
                    Courier Dashboard
                  </DropdownItem>
                )}
                {/* Staff Manager  Filter */}
                {user.role === "Staff_Manager" && (
                  <DropdownItem
                    key="manage-staff"
                    onClick={() => navigate("/staffManager")}
                  >
                    Manage Staff
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
            <Link className="text-black" href="/login">
              Login
            </Link>
          )}
        </NavbarContent>
      </Navbar>
      <Divider className="my-4" />
    </div>
  );
}

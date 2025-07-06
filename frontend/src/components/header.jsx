import React, { useEffect, useState, forwardRef } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  User,
  Button,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = getToken();
  const userId = getUserIdFromToken(token);
  const navigate = useNavigate();
  const location = useLocation();

  const variants = ["solid", "underlined", "bordered", "light"];

  // Navigation items for mobile menu
  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Community", path: "/articles" },
    { name: "Chat", path: "/chat" },
    { name: "Our Games", path: "/TailoredGames" },
  ];

  // Support menu items
  const supportItems = [
    { name: "Vortex Support", path: "/support" },
    { name: "Contact Us", path: "/support#contactForm" },
    { name: "Privacy Policy", path: "/privacyPolicy" },
    { name: "About Vortex", path: "/about" },
  ];

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
    setIsMenuOpen(false);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const AcmeLogo = () => {
    return (
      <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
        <path
          clipRule="evenodd"
          d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  };

  const getRoleBasedMenuItems = () => {
    const roleItems = [];
    
    if (user?.role === "developer") {
      roleItems.push({ name: "Developer Dashboard", path: "/GamedeveloperDashboard" });
    }
    if (user?.role === "Product Manager") {
      roleItems.push({ name: "Products Dashboard", path: "/productDashboard" });
    }
    if (user?.role === "User Manager") {
      roleItems.push({ name: "User Management", path: "/UserManagementDashboard" });
    }
    if (user?.role === "Order Manager") {
      roleItems.push({ name: "Order Management", path: "/ordersDashboard" });
    }
    if (user?.role === "Blogger") {
      roleItems.push({ name: "Blogger Dashboard", path: "/bloggerDashboard" });
    }
    if (user?.role === "Session_Manager") {
      roleItems.push({ name: "Session Dashboard", path: "/sessionDashboard" });
    }
    if (user?.role === "Community Manager") {
      roleItems.push({ name: "Community Dashboard", path: "/CommunityDashBoard" });
    }
    if (user?.role === "Review Manager") {
      roleItems.push({ name: "Review Dashboard", path: "/review_dashboard" });
    }
    if (user?.role === "Support Agent") {
      roleItems.push({ name: "Customer Support Panel", path: "/ContactDash" });
    }
    if (user?.role === "Staff_Manager") {
      roleItems.push({ name: "Manage Staff", path: "/staffManager" });
    }
    if (user?.role === "Payment Manager") {
      roleItems.push({ name: "Payment Management Dashboard", path: "/Payment_manager_dashboard" });
    }

    return roleItems;
  };

  return (
    <div className="dark">
      <Navbar 
        onMenuOpenChange={setIsMenuOpen}
        isMenuOpen={isMenuOpen}
        className="bg-black"
        maxWidth="full"
      >
        {/* Mobile Menu Toggle */}
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden text-white"
          />
          <NavbarBrand>
            <AcmeLogo />
            <p className="font-bold text-inherit text-white">VORTEX</p>
          </NavbarBrand>
        </NavbarContent>

        {/* Desktop Navigation */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem className="mr-4">
            <Link color="foreground" href="/" className="text-white hover:text-gray-300">
              Home
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link color="foreground" href="/shop" className="text-white hover:text-gray-300">
              Shop
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link color="foreground" href="/articles" className="text-white hover:text-gray-300">
              Community
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link color="foreground" href="/chat" className="text-white hover:text-gray-300">
              Chat
            </Link>
          </NavbarItem>
          <NavbarItem className="mr-4">
            <Link href="/TailoredGames" color="foreground" className="text-white hover:text-gray-300">
              Our Games
            </Link>
          </NavbarItem>
          
          <Dropdown placement="bottom-start" className="dark text-white">
            <DropdownTrigger>
              <NavbarItem className="cursor-pointer text-white hover:text-gray-300">Support</NavbarItem>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Support Actions"
              variant="flat"
              className="font-primaryRegular bg-black"
            >
              <DropdownItem
                key="support"
                onClick={() => navigate("/support")}
                className="text-white hover:bg-gray-800"
              >
                Vortex Support
              </DropdownItem>
              <DropdownItem
                key="contactus"
                onClick={() => navigate("/support#contactForm")}
                className="text-white hover:bg-gray-800"
              >
                Contact Us
              </DropdownItem>
              <DropdownItem
                key="privacy"
                onClick={() => navigate("/privacyPolicy")}
                className="text-white hover:bg-gray-800"
              >
                Privacy Policy
              </DropdownItem>
              <DropdownItem
                key="about"
                onClick={() => navigate("/about")}
                className="text-white hover:bg-gray-800"
              >
                About Vortex
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown placement="bottom-start" className="text-white dark">
            <DropdownTrigger>
              <NavbarItem className="cursor-pointer flex items-center hover:text-gray-300 transition-colors duration-200">
                <NotificationIcon style={{ marginRight: "8px" }} />
                <span
                  className={`${
                    location.pathname === "/Notification" ? "text-gray-300" : ""
                  }`}
                >
                </span>
              </NavbarItem>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Notification Actions"
              variant="flat"
              className="font-primaryRegular text-white bg-black"
            >
              <DropdownItem
                onClick={() => navigate("/Notification")}
                className="text-white hover:bg-gray-800"
              >
                All Notifications
              </DropdownItem>
              <DropdownItem
                onClick={() => navigate("/UserMessage")}
                className="text-white hover:bg-gray-800"
              >
                All Messages
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        {/* User Profile or Login */}
        <NavbarContent as="div" justify="end">
          {token && user ? (
            <Dropdown placement="bottom-end" className="dark text-white">
              <DropdownTrigger>
                <User
                  className="cursor-pointer"
                  name={user.username}
                  description={user.role}
                  avatarProps={{
                    src: user.profilePic,
                  }}
                />
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Profile Actions"
                className="font-primaryRegular bg-black"
              >
                <DropdownItem
                  key="settings"
                  onClick={() => navigate("/profile")}
                  className="text-white hover:bg-gray-800"
                >
                  My Settings
                </DropdownItem>
                <DropdownItem
                  key="orders"
                  onClick={() => navigate("/mylibrary")}
                  className="text-white hover:bg-gray-800"
                >
                  My Library
                </DropdownItem>
                <DropdownItem
                  key="rentals"
                  onClick={() => navigate("/GamingSessions")}
                  className="text-white hover:bg-gray-800"
                >
                  Rentals
                </DropdownItem>
                <DropdownItem 
                  key="cart" 
                  onClick={() => navigate("/cartItems")}
                  className="text-white hover:bg-gray-800"
                >
                  My Cart
                </DropdownItem>
                <DropdownItem
                  key="transactions"
                  onClick={() => navigate("/Transaction")}
                  className="text-white hover:bg-gray-800"
                >
                  Transaction History
                </DropdownItem>

                {/* Role-based menu items */}
                {user.role === "developer" && (
                  <DropdownItem
                    key="developer-panel"
                    onClick={() => navigate("/GamedeveloperDashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Developer Dashboard
                  </DropdownItem>
                )}
                {user.role === "Product Manager" && (
                  <DropdownItem
                    key="admin-panel"
                    onClick={() => navigate("/productDashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Products Dashboard
                  </DropdownItem>
                )}
                {user.role === "User Manager" && (
                  <DropdownItem
                    key="Admin-panel"
                    onClick={() => navigate("/UserManagementDashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    User Management
                  </DropdownItem>
                )}
                {user.role === "Order Manager" && (
                  <DropdownItem
                    key="orders-panel"
                    onClick={() => navigate("/ordersDashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Order Management
                  </DropdownItem>
                )}
                {user.role === "Blogger" && (
                  <DropdownItem
                    key="blogger-panel"
                    onClick={() => navigate("/bloggerDashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Blogger Dashboard
                  </DropdownItem>
                )}
                {user.role === "Session_Manager" && (
                  <DropdownItem
                    key="session-panel"
                    onClick={() => navigate("/sessionDashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Session Dashboard
                  </DropdownItem>
                )}
                {user.role === "Community Manager" && (
                  <DropdownItem
                    key="community-panel"
                    onClick={() => navigate("/CommunityDashBoard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Community Dashboard
                  </DropdownItem>
                )}
                {user.role === "Review Manager" && (
                  <DropdownItem
                    key="Review-panel"
                    onClick={() => navigate("/review_dashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Review Dashboard
                  </DropdownItem>
                )}
                {user.role === "Support Agent" && (
                  <DropdownItem
                    key="support-panel"
                    onClick={() => navigate("/ContactDash")}
                    className="text-white hover:bg-gray-800"
                  >
                    Customer Support Panel
                  </DropdownItem>
                )}
                {user.role === "Staff_Manager" && (
                  <DropdownItem
                    key="manage-staff"
                    onClick={() => navigate("/staffManager")}
                    className="text-white hover:bg-gray-800"
                  >
                    Manage Staff
                  </DropdownItem>
                )}
                {user.role === "Payment Manager" && (
                  <DropdownItem
                    key="manage-payment"
                    onClick={() => navigate("/Payment_manager_dashboard")}
                    className="text-white hover:bg-gray-800"
                  >
                    Payment Management Dashboard
                  </DropdownItem>
                )}

                <DropdownItem
                  className="text-white hover:bg-gray-800"
                  color="danger"
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link
              className="text-black font-primaryRegular bg-white px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              href="/login"
            >
              Login
            </Link>
          )}
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="bg-black pt-6">
          {/* Main Navigation Items */}
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.name}-${index}`}>
              <Link
                color="foreground"
                className="w-full text-white hover:text-gray-300 text-lg py-2"
                href={item.path}
                size="lg"
                onClick={() => handleMenuItemClick(item.path)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}

          {/* Support Items */}
          <NavbarMenuItem>
            <p className="text-white font-semibold text-lg py-2 border-t border-gray-600 mt-4 pt-4">
              Support
            </p>
          </NavbarMenuItem>
          {supportItems.map((item, index) => (
            <NavbarMenuItem key={`support-${index}`}>
              <Link
                color="foreground"
                className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
                href={item.path}
                onClick={() => handleMenuItemClick(item.path)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}

          {/* Notifications */}
          <NavbarMenuItem>
            <p className="text-white font-semibold text-lg py-2 border-t border-gray-600 mt-4 pt-4">
              Notifications
            </p>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              color="foreground"
              className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
              href="/Notification"
              onClick={() => handleMenuItemClick("/Notification")}
            >
              All Notifications
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              color="foreground"
              className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
              href="/UserMessage"
              onClick={() => handleMenuItemClick("/UserMessage")}
            >
              All Messages
            </Link>
          </NavbarMenuItem>

          {/* User Profile Section */}
          {token && user ? (
            <>
              <NavbarMenuItem>
                <p className="text-white font-semibold text-lg py-2 border-t border-gray-600 mt-4 pt-4">
                  My Account
                </p>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  color="foreground"
                  className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
                  href="/profile"
                  onClick={() => handleMenuItemClick("/profile")}
                >
                  My Settings
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  color="foreground"
                  className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
                  href="/mylibrary"
                  onClick={() => handleMenuItemClick("/mylibrary")}
                >
                  My Library
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  color="foreground"
                  className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
                  href="/GamingSessions"
                  onClick={() => handleMenuItemClick("/GamingSessions")}
                >
                  Rentals
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  color="foreground"
                  className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
                  href="/cartItems"
                  onClick={() => handleMenuItemClick("/cartItems")}
                >
                  My Cart
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  color="foreground"
                  className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
                  href="/Transaction"
                  onClick={() => handleMenuItemClick("/Transaction")}
                >
                  Transaction History
                </Link>
              </NavbarMenuItem>

              {/* Role-based items */}
              {getRoleBasedMenuItems().length > 0 && (
                <>
                  <NavbarMenuItem>
                    <p className="text-white font-semibold text-lg py-2 border-t border-gray-600 mt-4 pt-4">
                      Management
                    </p>
                  </NavbarMenuItem>
                  {getRoleBasedMenuItems().map((item, index) => (
                    <NavbarMenuItem key={`role-${index}`}>
                      <Link
                        color="foreground"
                        className="w-full text-white hover:text-gray-300 text-base py-1 ml-4"
                        href={item.path}
                        onClick={() => handleMenuItemClick(item.path)}
                      >
                        {item.name}
                      </Link>
                    </NavbarMenuItem>
                  ))}
                </>
              )}

              <NavbarMenuItem>
                <Button
                  color="danger"
                  variant="flat"
                  className="w-full mt-4 text-white bg-gray-800 hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </NavbarMenuItem>
            </>
          ) : (
            <NavbarMenuItem>
              <Link
                className="text-black font-primaryRegular bg-white px-4 py-2 rounded-md hover:bg-gray-200 transition-colors w-full text-center block mt-4"
                href="/login"
                onClick={() => handleMenuItemClick("/login")}
              >
                Login
              </Link>
            </NavbarMenuItem>
          )}
        </NavbarMenu>
      </Navbar>
    </div>
  );
});

export default Header;
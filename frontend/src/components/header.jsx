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
    <div className="bg-lightGray">
      <Navbar className="font-primaryRegular bg-lightGray text-dark">
        <NavbarBrand>
          <p className="font-bold text-primary">ELDERLY CARE</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link
              color={location.pathname === "/" ? "primary" : "default"}
              href="/"
              className={`${
                location.pathname === "/" ? "underline" : ""
              } text-dark hover:underline`}
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/services" ? "primary" : "default"}
              href="/services"
              className={`${
                location.pathname === "/services" ? "underline" : ""
              } text-dark hover:underline`}
            >
              Services
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/careplans" ? "primary" : "default"}
              href="/careplans"
              className={`${
                location.pathname === "/careplans" ? "underline" : ""
              } text-dark hover:underline`}
            >
              Care Plans
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              color={location.pathname === "/contact" ? "primary" : "default"}
              href="/contact"
              className={`${
                location.pathname === "/contact" ? "underline" : ""
              } text-dark hover:underline`}
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
                  className="cursor-pointer text-dark"
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
                className="font-primaryRegular text-dark"
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
                  key="appointments"
                  onClick={() => navigate("/appointments")}
                >
                  My Appointments
                </DropdownItem>
                <DropdownItem
                  key="careplans"
                  onClick={() => navigate("/careplans")}
                >
                  My Care Plans
                </DropdownItem>

                {/* Admin Filter */}
                {user.role === "admin" && (
                  <DropdownItem
                    key="admin-panel"
                    onClick={() => navigate("/adminDashboard")}
                  >
                    Admin Panel
                  </DropdownItem>
                )}

                {/* Caregiver Filter */}
                {user.role === "Caregiver" && (
                  <DropdownItem
                    key="caregiver-panel"
                    onClick={() => navigate("/caregiverDashboard")}
                  >
                    Caregiver Dashboard
                  </DropdownItem>
                )}

                {/* Family Member Filter */}
                {user.role === "Family_Member" && (
                  <DropdownItem
                    key="family-panel"
                    onClick={() => navigate("/familyDashboard")}
                  >
                    Family Dashboard
                  </DropdownItem>
                )}

                {/* Support Agent Filter */}
                {user.role === "Support_Agent" && (
                  <DropdownItem
                    key="support-panel"
                    onClick={() => navigate("/supportDashboard")}
                  >
                    Support Dashboard
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
            <Link className="text-dark" href="/login">
              Login
            </Link>
          )}
        </NavbarContent>
      </Navbar>
    </div>
  );
}

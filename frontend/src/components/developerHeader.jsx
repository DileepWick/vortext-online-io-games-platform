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
import { API_BASE_URL } from "../utils/getAPI";

export default function DeveloperHeader() {
  const [developer, setDeveloper] = useState(null);
  const token = getToken();
  const userId = getUserIdFromToken(token);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/developers/profile/${userId}`
        );
        setDeveloper(response.data);
      } catch (error) {
        console.error("Error fetching developer:", error);
      }
    };

    if (userId) {
      fetchDeveloper();
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
              color={
                location.pathname === "/TailoredGames" ? "primary" : "white"
              }
              href="/TailoredGames"
              className={`${
                location.pathname === "/TailoredGames" ? "underline" : ""
              } text-white hover:underline`}
            >
              Tailored Games
            </Link>
          </NavbarItem>

          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <NavbarItem>Help</NavbarItem>
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
          {token && developer ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <User
                  className="cursor-pointer text-white"
                  name={developer.username}
                  description={developer.email}
                  avatarProps={{
                    src: developer.profilePic,
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
                  <p className="font-semibold">{developer.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  onClick={() => navigate("/profile")}
                >
                  My Settings
                </DropdownItem>
                <DropdownItem
                  key="portfolio"
                  onClick={() => navigate("/myPortfolio")}
                >
                  My Portfolio
                </DropdownItem>
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
            <>
              <Link className="text-white" href="/login">
                Login
              </Link>
              <Link className="text-white ml-4" href="/DeveloperLoginSignup">
                Developer Login
              </Link>
            </>
          )}
        </NavbarContent>
      </Navbar>
    </div>
  );
}

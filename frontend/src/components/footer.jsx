import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const location = useLocation();

  // Conditional background class - black and white only
  // const bgClass = location.pathname === "/support" ? "bg-black" : "bg-black";

  return (
    <footer
      className={`bg-white text-black py-12 sm:py-16 font-primaryRegular mt-auto dark border-t border-gray-500`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Us Section */}
          <div className="space-y-4">
            <h3 className="text-black text-lg font-semibold">About Us</h3>
            <p className="text-sm leading-relaxed">
              We are a leading company in providing the best quality products
              and services to our customers. Our mission is to enrich lives
              through our offerings.
            </p>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <h3 className="text-black text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/shop"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  Game Sales
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  Game Rentals
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  Game Reviews
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  24/7 Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h3 className="text-black text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/support#faq"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/support#contactForm"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/support#terms"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sm hover:text-gray-700 transition-colors duration-200 p-1 rounded"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-black text-lg font-semibold">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="flex items-center space-x-2 text-sm hover:text-gray-700 transition-colors duration-200 p-2 rounded"
                aria-label="Facebook"
              >
                <Facebook size={18} />
                <span className="hidden sm:inline">Facebook</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-sm hover:text-gray-700 transition-colors duration-200 p-2 rounded"
                aria-label="Twitter"
              >
                <Twitter size={18} />
                <span className="hidden sm:inline">Twitter</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-sm hover:text-gray-700 transition-colors duration-200 p-2 rounded"
                aria-label="Instagram"
              >
                <Instagram size={18} />
                <span className="hidden sm:inline">Instagram</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-sm hover:text-gray-700 transition-colors duration-200 p-2 rounded"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

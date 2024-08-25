import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
<footer className="bg-headerDark text-gray-400 py-16 font-primaryRegular mt-auto">
  <div className="container mx-auto px-6 lg:px-8">
    <div className="flex flex-wrap justify-between">
          {/* About Us Section */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              We are a leading company in providing the best quality products
              and services to our customers. Our mission is to enrich lives
              through our offerings.
            </p>
          </div>

          {/* Services Section */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">Services</h3>
            <ul>
              <li className="mb-2">
                <Link to="/services#service1" className="hover:text-white">
                  Service 1
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services#service2" className="hover:text-white">
                  Service 2
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services#service3" className="hover:text-white">
                  Service 3
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services#service4" className="hover:text-white">
                  Service 4
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul>
              <li className="mb-2">
                <Link to="/support#faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/support#contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/support#terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/support#privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a href="#" className="hover:text-white">
                <i className="fab fa-twitter"></i> Twitter
              </a>
              <a href="#" className="hover:text-white">
                <i className="fab fa-instagram"></i> Instagram
              </a>
              <a href="#" className="hover:text-white">
                <i className="fab fa-linkedin-in"></i> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

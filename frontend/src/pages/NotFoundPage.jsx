import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const NotFound404 = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        .blink-animation {
          animation: blink 2s linear infinite;
        }
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <AlertTriangle className="w-24 h-24 text-yellow-400 mb-8 float-animation" />
      <h1
        className={`text-6xl font-bold mb-4 blink-animation ${
          visible ? "visible" : ""
        } fade-in`}
        style={{ transitionDelay: "0.2s" }}
      >
        404
      </h1>
      <h2
        className={`text-3xl font-semibold mb-6 ${
          visible ? "visible" : ""
        } fade-in`}
        style={{ transitionDelay: "0.4s" }}
      >
        Game Over: Page Not Found
      </h2>
      <p
        className={`text-xl mb-8 text-center ${
          visible ? "visible" : ""
        } fade-in`}
        style={{ transitionDelay: "0.6s" }}
      >
        Oops! The level you're looking for doesn't exist.
        <br /> or still under development.
      </p>
      <div
        className={`space-y-4 text-center ${visible ? "visible" : ""} fade-in`}
        style={{ transitionDelay: "0.8s" }}
      >
        <p className="text-lg">Choose your next move:</p>
        <ul className="space-y-2">
          <li>
            <a
              href="/"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ↩️ Return to Main Menu (Home)
            </a>
          </li>
          <li>
            <a
              href="/shop"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              🎮 Browse Games
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              📞 Contact Support
            </a>
          </li>
        </ul>
      </div>
      <div
        className={`mt-12 text-sm text-gray-400 ${
          visible ? "visible" : ""
        } fade-in`}
        style={{ transitionDelay: "1s" }}
      >
        <p className="text-center">Error Code: 404 - Page Not Found</p>
        <p>Try refreshing the page or check your URL for typos.</p>
      </div>
    </div>
  );
};

export default NotFound404;

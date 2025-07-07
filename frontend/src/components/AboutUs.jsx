import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/header";
import Footer from "../components/footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Helmet>
        <title>About Us | Vortex</title>
        <meta
          name="description"
          content="Discover the ultimate gaming platform with thousands of IO games and exclusive titles"
        />
      </Helmet>

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16 px-4 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to Vortex
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Where players discover the best IO games and our exclusive titles
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto py-12 px-4">
          {/* Our Platform */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">The Vortex Experience</h2>
            <div className="space-y-6 text-gray-600">
              <p>
                Founded in 2024, Vortex has become one of the most popular
                destinations for instant-play gaming. We host thousands of the
                web's best IO games while developing our own exclusive titles
                that you won't find anywhere else.
              </p>
              <p>
                Our platform is built for gamers who want instant access to fun,
                competitive multiplayer experiences without downloads or
                complicated setups. Just click and play!
              </p>
              <p>
                Every month, we add new games and features based on community
                feedback to keep the experience fresh and exciting.
              </p>
            </div>
          </section>

          {/* What We Offer */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">
              What We Provide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Massive Game Library",
                  description:
                    "Thousands of IO games across all genres - battle royale, survival, strategy and more",
                },
                {
                  title: "Exclusive Titles",
                  description:
                    "Original games developed by our team, only available on Vortex",
                },
                {
                  title: "Instant Play",
                  description:
                    "No downloads required - play instantly in your browser",
                },
                {
                  title: "Global Leaderboards",
                  description:
                    "Compete against players worldwide and track your rankings",
                },
                {
                  title: "Regular Updates",
                  description: "New games and features added every week",
                },
                {
                  title: "Community Events",
                  description: "Special tournaments and challenges with prizes",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-6 rounded-lg hover:shadow-sm transition"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Technology */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Built for Gamers</h2>
            <div className="space-y-8">
              {[
                {
                  title: "Optimized Performance",
                  description:
                    "Our lightweight platform works smoothly on any device",
                },
                {
                  title: "Fair Play Systems",
                  description:
                    "Advanced anti-cheat measures to ensure competitive integrity",
                },
                {
                  title: "Cross-Platform",
                  description:
                    "Play on PC, tablet or mobile with the same account",
                },
                {
                  title: "Privacy Focused",
                  description:
                    "We never sell your data or require unnecessary permissions",
                },
              ].map((tech, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{tech.title}</h3>
                    <p className="text-gray-600">{tech.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="bg-gray-50 py-12 px-6 rounded-lg mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">
              By The Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { number: "5,000+", label: "Games Available" },
                { number: "10M+", label: "Monthly Players" },
                { number: "50+", label: "Exclusive Titles" },
                { number: "24/7", label: "Active Servers" },
              ].map((stat, index) => (
                <div key={index}>
                  <p className="text-2xl font-bold mb-1">{stat.number}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join millions of players enjoying instant gaming fun right now.
            </p>
            <button
              onClick={() => (window.location.href = "/shop")}
              className="px-8 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Browse All Games
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;

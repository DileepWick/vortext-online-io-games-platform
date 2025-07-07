import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/header";
import Footer from "../components/footer";

const Page = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Helmet>
        <title>Privacy Policy | Vortex</title>
        <meta
          name="description"
          content="Vortex's Privacy Policy - Learn how we collect, use, and protect your data"
        />
      </Helmet>

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16 px-4 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Last updated: July 7, 2025
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="prose prose-lg text-gray-600">
            <section className="mb-12">
              <p>
                At Vortex ("we", "us", or "our"), we are committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our gaming
                platform (the "Service").
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                1. Information We Collect
              </h2>

              <h3 className="font-semibold text-lg mb-2">Personal Data</h3>
              <p className="mb-4">
                When you register an account, we may collect:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Email address</li>
                <li>Username</li>
                <li>Password (hashed)</li>
                <li>Basic profile information</li>
              </ul>

              <h3 className="font-semibold text-lg mb-2">Usage Data</h3>
              <p className="mb-4">
                We automatically collect information about:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Games played and duration</li>
                <li>Scores and achievements</li>
                <li>Device information (browser type, OS)</li>
                <li>IP address (for region detection and security)</li>
              </ul>

              <h3 className="font-semibold text-lg mb-2">Cookies</h3>
              <p>We use cookies to:</p>
              <ul className="list-disc pl-6">
                <li>Maintain your session</li>
                <li>Remember preferences</li>
                <li>Analyze site traffic</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6">
                <li className="mb-2">To provide and maintain our Service</li>
                <li className="mb-2">To personalize your gaming experience</li>
                <li className="mb-2">To develop new games and features</li>
                <li className="mb-2">To monitor usage and analyze trends</li>
                <li className="mb-2">To detect and prevent fraud</li>
                <li className="mb-2">To communicate with you about updates</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                3. Data Sharing and Disclosure
              </h2>
              <p className="mb-4">
                We do not sell your personal data. We may share information
                with:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Service providers (hosting, analytics)</li>
                <li className="mb-2">Law enforcement when required</li>
                <li className="mb-2">
                  Business partners (for co-developed games)
                </li>
              </ul>
              <p>
                Aggregate, non-personal data may be shared for analytics and
                marketing.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">4. Data Security</h2>
              <p className="mb-4">We implement security measures including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Encryption of sensitive data</li>
                <li className="mb-2">Regular security audits</li>
                <li className="mb-2">Access controls</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100%
                secure.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">5. Children's Privacy</h2>
              <p className="mb-4">
                Our Service is not directed to children under 13. We do not
                knowingly collect personal information from children under 13.
                If we become aware that we have collected personal information
                from a child under 13, we will take steps to delete such
                information.
              </p>
              <p>
                For users aged 13-18, we recommend parental guidance when using
                our platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">6. Your Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Access your personal data</li>
                <li className="mb-2">Request correction or deletion</li>
                <li className="mb-2">Object to processing</li>
                <li className="mb-2">Request data portability</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@vortexgames.com.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">7. Third-Party Links</h2>
              <p>
                Our Service may contain links to third-party sites. We are not
                responsible for their privacy practices. We encourage you to
                review their privacy policies.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                8. Changes to This Policy
              </h2>
              <p>
                We may update our Privacy Policy periodically. We will notify
                you of changes by posting the new policy on this page and
                updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">9. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact
                us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@vortexgames.com
                <br />
                <strong>Address:</strong> 123 Gaming Street, Suite 100, Virtual
                City, VC 12345
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Page;

"use client"

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"; // ✅ CORRECT
import { PiggyBank, Banknote, BarChart, CheckCircle } from "lucide-react";

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Isusu App</h1>
          <div className="flex items-center gap-6">
            <Link href="/about-us" className="text-white-600 hover:text-gray-900 font-medium">
              About Us
            </Link>
          </div>

          {/* Hamburger Menu Button (Visible on Mobile) */}
          <button
            type="button"
            className="block md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <XMarkIcon className="w-8 h-8 text-white" />
            ) : (
              <Bars3Icon className="w-8 h-8 text-white" />
            )}
          </button>

          {/* Navigation Links (Hidden on Mobile, Visible on Desktop) */}
          <nav
            className={`absolute top-16 left-0 w-full bg-blue-600 md:static md:block md:w-auto ${menuOpen ? "block" : "hidden"
              }`}
          >
            <ul className="flex flex-col md:flex-row md:space-x-4 p-4 md:p-0">
              <li>
                <a href="#features" className="block py-2 px-4 hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="block py-2 px-4 hover:underline">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#contact" className="block py-2 px-4 hover:underline">
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="block py-2 px-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">
            Empowering Communities Through Cooperation
          </h2>
          <p className="text-gray-700 text-lg mb-6 mb-12">
            Isusu App is your digital solution for managing and growing your cooperative
            associations or clubs. Together, we can achieve more!
          </p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-gray-100">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-blue-600 mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
              <PiggyBank className="h-12 w-12 text-blue-600 mb-3" />
              <h4 className="text-xl font-semibold mb-3">Savings Management</h4>
              <p className="text-gray-600">
                Keep track of member contributions and withdrawals with ease.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
              <Banknote className="h-12 w-12 text-blue-600 mb-3" />
              <h4 className="text-xl font-semibold mb-3">Loan Allocation</h4>
              <p className="text-gray-600">
                Allocate loans to members fairly and transparently.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
              <BarChart className="h-12 w-12 text-blue-600 mb-3" />
              <h4 className="text-xl font-semibold mb-3">Automated Reporting</h4>
              <p className="text-gray-600">
                Generate detailed reports on financial activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 bg-white text-center">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-blue-600 mb-6">How It Works</h3>
          <ol className="list-none space-y-4 text-gray-700">
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Register your association or club on the platform.
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Invite members to join and start contributing.
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Track savings, loans, and progress in real-time.
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Celebrate milestones and achieve financial goals together!
            </li>
          </ol>
        </div>
        <div className="container mx-auto mt-6">
          <video className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" controls>
            <source src="/isusu-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-12 bg-blue-600 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-lg mb-6">
          Join the growing number of associations using Isusu App to transform their finances.
        </p>
        <Link
          href="/signup"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-100"
        >
          Sign Up Now
        </Link>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto text-center">
          <p>
            &copy; 2025 Isusu App. All rights reserved. <span className="mx-2">|</span>
            <a href="mailto:support@isusuapp.com" className="text-blue-400 hover:underline mx-4">
              Contact Us
            </a>
            <span className="mx-2">|</span>
            <a href="/privacy-policy" className="text-blue-400 hover:underline mx-4">
              Privacy Policy
            </a>
          </p>
        </div>
      </footer>



    </div>
  );
}

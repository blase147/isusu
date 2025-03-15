// import '@/app/ui/global.css';
// import { inter } from '@/app/ui/fonts';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Isusu App</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#features" className="hover:underline">Features</a></li>
              <li><a href="#how-it-works" className="hover:underline">How It Works</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
              <li>
                <Link
                  href="/login"
                  className=" text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100"
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
          <p className="text-gray-700 text-lg mb-6">
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
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">Savings Management</h4>
              <p className="text-gray-600">
                Keep track of member contributions and withdrawals with ease.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">Loan Allocation</h4>
              <p className="text-gray-600">
                Allocate loans to members fairly and transparently.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">Automated Reporting</h4>
              <p className="text-gray-600">
                Generate detailed reports on financial activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 bg-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-blue-600 mb-6">How It Works</h3>
          <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li>Register your association or club on the platform.</li>
            <li>Invite members to join and start contributing.</li>
            <li>Track savings, loans, and progress in real-time.</li>
            <li>Celebrate milestones and achieve financial goals together!</li>
          </ol>
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
          <p>&copy; 2025 Isusu App. All rights reserved.</p>
          <p>Contact us: <a href="mailto:support@isusuapp.com" className="text-blue-400 hover:underline">support@isusuapp.com</a></p>
        </div>
      </footer>
    </div>
  );
}

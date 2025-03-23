const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-3xl bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">About Us</h1>
                <p className="text-gray-600 text-lg">
                    Welcome to <span className="font-semibold">Isusu</span>, a trusted platform for seamless savings, group contributions, and financial empowerment.
                </p>

                <h2 className="text-2xl font-semibold text-gray-700 mt-6">Our Mission</h2>
                <p className="text-gray-600 mt-2">
                    Our mission is to simplify savings and group contributions by providing a secure and transparent system that helps individuals and communities achieve their financial goals.
                </p>

                <h2 className="text-2xl font-semibold text-gray-700 mt-6">How It Works</h2>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
                    <li>📌 Create or join a savings group</li>
                    <li>💰 Contribute funds securely</li>
                    <li>🔄 Rotate payouts based on agreed schedules</li>
                    <li>📊 Track your savings progress in real-time</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-700 mt-6">Why Choose Us?</h2>
                <p className="text-gray-600 mt-2">
                    We prioritize security, transparency, and ease of use, making group savings and contributions stress-free and efficient.
                </p>

                <div className="mt-6">
                    <a
                        href="/contact"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

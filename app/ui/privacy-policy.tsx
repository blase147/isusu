const PrivacyPolicy = () => {
    return (
        <section className="bg-white py-12 px-6">
            <div className="container mx-auto max-w-4xl">
                <h2 className="text-4xl font-bold text-blue-600 mb-6 text-center">Privacy Policy</h2>
                <p className="text-gray-700 mb-4">
                    At Isusu App, we value your privacy and are committed to protecting your personal information.
                    This Privacy Policy explains how we collect, use, and safeguard your data.
                </p>

                <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-2">1. Information We Collect</h3>
                <p className="text-gray-600">
                    We may collect personal information such as your name, email address, phone number, and payment details
                    when you register, use our services, or contact us.
                </p>

                <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-2">2. How We Use Your Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>To provide and improve our services.</li>
                    <li>To communicate with you about updates and support.</li>
                    <li>To process transactions securely.</li>
                    <li>To comply with legal obligations.</li>
                </ul>

                <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-2">3. Data Security</h3>
                <p className="text-gray-600">
                    We implement security measures to protect your personal data, but no method of transmission over the internet is 100% secure.
                </p>

                <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-2">4. Third-Party Services</h3>
                <p className="text-gray-600">
                    We may use third-party services for payments and analytics. These providers have their own privacy policies regarding the use of your data.
                </p>

                <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-2">5. Your Rights</h3>
                <p className="text-gray-600">
                    You have the right to access, update, or delete your personal information. If you have any concerns, please contact us.
                </p>

                <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-2">6. Changes to This Policy</h3>
                <p className="text-gray-600">
                    We may update this policy from time to time. Any changes will be posted on this page.
                </p>

                <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-2">7. Contact Us</h3>
                <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-blue-500 font-medium mt-2">
                    <a href="mailto:support@isusuapp.com" className="hover:underline">support@isusuapp.com</a>
                </p>
            </div>
        </section>
    );
};

export default PrivacyPolicy;

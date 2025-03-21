import { useState, useEffect } from "react";
import DuesHistory from "./dues-history";

interface PayDuesProps {
    isusuId: string;
    onClose: () => void;
}

const PayDues = ({ isusuId, onClose }: PayDuesProps) => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

      useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            onClose();
          }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }, [onClose]);


    // Handle dues payment
    const handlePayDues = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setMessage("Enter a valid amount.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/isusu/dues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isusuId, amount: parseFloat(amount) }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Dues paid successfully!");
                setAmount("");
            } else {
                setMessage(data.error || "Payment failed.");
            }
        } catch {
            setMessage("Something went wrong.");
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative modal-center">
                <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                    onClick={onClose}>
                    ✖
                </button>

                <h2 className="text-xl font-bold mb-2">Pay Isusu Dues</h2>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="border p-2 rounded w-full mb-2"
                />
                <button
                    onClick={handlePayDues}
                    disabled={loading}
                    className="bg-blue-500 text-white p-2 rounded w-full"
                >
                    {loading ? "Processing..." : "Pay Dues"}
                </button>
                {message && <p className="mt-2 text-red-500">{message}</p>}

                {/* <ul className="mt-2">
                    {duesHistory.map((due) => (
                        <li key={due.id} className="border p-2 my-1 rounded">
                            {new Date(due.paymentDate).toLocaleDateString()} - ₦{due.amount} - {due.status}
                        </li>
                    ))}
                </ul> */}

                <DuesHistory isusuId={isusuId} onClose={onClose} />
            </div>
        </div>
    );
};

export default PayDues;

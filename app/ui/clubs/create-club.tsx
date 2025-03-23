"use client";

import { BackwardIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PaystackButton } from "react-paystack";
import { useSession } from "next-auth/react";


const CreateIsusu = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isusuName, setIsusuName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [milestone, setMilestone] = useState<number | "">("");
  const [isusuClass, setIsusuClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState<string>(""); // Amount for Paystack
  const [tier, setTier] = useState<string>(""); // Name for isusuPurchase
  const [publicKey, setPublicKey] = useState<string>("");

  interface User {
    name: string;
    email: string;
  }

  const [user, setUser] = useState<User | null>(null);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);



  const { data: session } = useSession();
  const userId = session?.user?.id;



  useEffect(() => {
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (paystackPublicKey) {
      setPublicKey(paystackPublicKey);
    } else {
      setError("Paystack public key not configured.");
    }

    const queryName = searchParams.get("tierName");
    const queryPrice = searchParams.get("tierId");

       if (queryPrice) {
         const validTierId = Number(queryPrice);
      if (!isNaN(validTierId) && validTierId > 0) {
        setAmount(queryPrice); // Pre-fill the amount input if it exists in the URL
      } else {
        console.error("Invalid tierId value in URL");
      }
         console.log("tierId from URL:", queryName);
         console.log("tierId from URL:", queryPrice);
         console.log("Paystack Public Key:", paystackPublicKey);

    }

    if (queryName) {
      setTier(queryName);
    } else {
      console.error("Invalid price value in URL");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isAmountValid && isPublicKeyLoaded) {
        alert("Proceed with the payment to create the Isusu group.");
      } else {
        setError("Please provide a valid amount.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

const handleSuccess = async (response: { reference: string }) => {
  console.log("Payment Success:", response);

  if (!response.reference) {
    alert("Transaction reference missing!");
    return;
  }

  try {
    // Step 1: Verify the payment using Paystack reference
    const verifyResponse = await fetch("/api/paystack-me/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference: response.reference, amount: Number(amount) }),
    });

    const result = await verifyResponse.json();
    console.log("Payment Verification Result:", result);

    // if the payment was successful, add a function that routs to send money api route to put the money in the wallet

    if (result.success) {
      const createdIsusu = await createIsusuGroup(); // Call the function here

      if (createdIsusu) {
        const isusuId = createdIsusu.id; // Assuming the response includes the isusuId
        const paystackReference = response.reference;
        console.log("Created Isusu ID:", isusuId);
        console.log("Sending isusuPurchase request:", {
          isusuId,
          userId,
          tier: tier,
          amount: Number(amount),
          status: "COMPLETED",
          paystackReference: response.reference,
        });

        // Step 3: Update or create Isusu Purchase record
        const isusuPurchaseResponse = await fetch("/api/isusu/isusu-purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isusuId,
            userId: userId, // Replace with the actual user ID
            tier: tier,
            amount: Number(amount),
            status: "COMPLETED",
            paystackReference,
          }),
        });

        if (isusuPurchaseResponse.ok) {
          if (userId) {
          } else {
            console.error("User ID is undefined");
          }
          alert("Hurray!! Your Isusu Purchase was successful!");
          router.push("/dashboard/manage-isusu");
        } else {
          alert("I am sorry your Isusu Purchase Failed.");
        }
      } else {
        alert("Failed to create Isusu group.");
      }
    } else {
      alert("Failed to create Isusu group.");
    }
  } catch (error) {
    console.error("Error verifying payment:", error); // Log the error to the console for more information
    if (error instanceof Error) {
      alert("An error occurred while verifying payment: " + error.message); // Show the error message to the user
    } else {
      alert("An unknown error occurred while verifying payment.");
    }
  }
};


const createIsusuGroup = async () => {
  try {
    const response = await fetch("/api/isusu/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isusuName,
        tier,
        frequency,
        milestone: Number(milestone),
        isusuClass,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Isusu group.");
    }

    const data = await response.json();
    return data; // Returns the created Isusu group data
  } catch (error) {
    console.error("Error creating Isusu group:", error);
    alert("Error creating Isusu group. Please try again.");
    return null;
  }
};


  const isAmountValid = Number(amount) > 0;
  const isPublicKeyLoaded = publicKey !== "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Link href="/dashboard/manage-isusu" className="flex items-center justify-center mb-4">
        <BackwardIcon className="m-2 w-6 h-6 text-blue-600 cursor-pointer" />
        <span>Go Back</span>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Create Isusu Group
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Isusu Name</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md mt-1"
              placeholder="Enter group name"
              value={isusuName}
              onChange={(e) => setIsusuName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="isusuClass" className="block font-semibold">Class of Isusu</label>
            <select
              id="isusuClass"
              className="w-full border p-2 rounded-md mt-1"
              value={isusuClass}
              onChange={(e) => setIsusuClass(e.target.value)}
              required
            >
              <option value="">Select Isusu Class</option>
              <option value="Weekend_Oringo">Weekend Oringo</option>
              <option value="Uwamgbede">Uwamgbede</option>
              <option value="PayDay_Flex">PayDay Flex</option>
              <option value="Club_Merchants">Club Merchants</option>
              <option value="Doublers_Arena">Doubler&apos;s Arena</option>
              <option value="Party_Mongers">Party Mongers</option>
              <option value="Grocery_Merchants">Grocery Merchants</option>
              <option value="Chosen_takes_it_all">Chosen takes it all</option>
            </select>
          </div>

          <div>
            <label htmlFor="frequency" className="block font-semibold">Frequency</label>
            <select
              id="frequency"
              className="w-full border p-2 rounded-md mt-1"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
            >
              <option value="">Select frequency</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Contribution Amount</label>
            <input
              type="number"
              className="w-full border p-2 rounded-md mt-1"
              placeholder="Enter target amount"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value ? Number(e.target.value) : "")}
              required
            />
          </div>

          <input type="hidden" name="amount" value={amount} />

          {isPublicKeyLoaded && isAmountValid ? (
            <PaystackButton
              text={loading ? "Creating..." : "Create Isusu"} disabled={!isAmountValid || !isPublicKeyLoaded}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 w-full"
              publicKey={publicKey}
              amount={Number(amount) * 100}
              email={user ? user.email : "user@domain.com"}
              currency={"NGN"}
              onSuccess={handleSuccess}
              onClose={() => alert("Transaction was closed!")}
            />
          ) : (
            <p className="text-red-500 text-sm text-center">Enter a valid amount to proceed.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateIsusu;

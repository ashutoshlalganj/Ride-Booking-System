// src/pages/Payment.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LiveTracking from "../components/LiveTracking";

// Razorpay script loader (duplicate load se bachne ke liye)
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const location = useLocation();
  const { ride } = location.state || {};
  const navigate = useNavigate();

  const [method, setMethod] = useState("UPI");
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  const destinationShort =
    ride?.destination?.split(",")[0] || ride?.destination || "";

  const vehicleType = ride?.captain?.vehicle?.vehicleType;
  const vehicleColor = ride?.captain?.vehicle?.color;
  const vehicleLabel =
    [vehicleColor, vehicleType && vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)]
      .filter(Boolean)
      .join(" ") || "Your ride";

  // --------- 1. Order create on backend (Razorpay order) ----------
  useEffect(() => {
    const createOrder = async () => {
      try {
        if (!ride?._id) return;

        setLoadingOrder(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in. Please login again.");
          return;
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/payments/create-order`,
          { rideId: ride._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!data?.success) {
          setError(data?.message || "Unable to create payment order.");
          return;
        }

        // { success, orderId, amount, currency, key }
        setOrderData(data);
      } catch (err) {
        console.error("Create order error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to create payment order. Please try again."
        );
      } finally {
        setLoadingOrder(false);
      }
    };

    createOrder();
  }, [ride?._id]);

  // --------- 2. Handle Cash (no gateway) OR Razorpay checkout ----------
  const handlePay = async () => {
    setError("");

    if (!ride) {
      setError("Payment session not found. Please start a new ride.");
      return;
    }

    // CASH – direct complete ride
    if (method === "Cash") {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in. Please login again.");
          return;
        }

        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/rides/complete-cash`,
          { rideId: ride._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Cash payment selected. Ride completed.");
        navigate("/home");
        return;
      } catch (err) {
        console.error("Cash end ride error:", err);
        setError("Failed to complete ride with cash. Try again.");
        return;
      }
    }

    // ONLINE (UPI / Card) – Razorpay gateway
    if (!orderData) {
      setError("Payment is not ready yet. Please wait a moment.");
      return;
    }

    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      setError("Failed to load payment SDK. Check your internet.");
      return;
    }

    setIsPaying(true);

    const user = ride.user || {};
    const userName = `${user.fullname?.firstname || ""} ${
      user.fullname?.lastname || ""
    }`.trim();
    const userEmail = user.email || "";

    const options = {
      key: orderData.key,
      amount: orderData.amount, // paise me
      currency: orderData.currency,
      name: "Taxi Ride",
      description: `Payment for ride ${ride._id}`,
      order_id: orderData.orderId,
      prefill: {
        name: userName || "Taxi User",
        email: userEmail || "user@example.com",
      },
      theme: { color: "#000000" },

      handler: async function (response) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("You are not logged in. Please login again.");
            return;
          }

          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/payments/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rideId: ride._id,
              method,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          alert("Payment successful. Thank you for riding!");
          navigate("/home");
        } catch (err) {
          console.error("Verify payment error:", err);
          setError(
            err.response?.data?.message ||
              "Payment captured but verification failed."
          );
        } finally {
          setIsPaying(false);
        }
      },
      modal: {
        ondismiss: () => {
          setIsPaying(false);
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // Agar ride hi nahi mila (direct URL se aaye ho)
  if (!ride) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-600">
          Payment session not found. Please start a ride again.
        </p>
        <Link
          to="/home"
          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HOME button */}
      <div className="absolute left-3 top-3 z-20">
        <Link
          to="/home"
          className="h-9 w-9 rounded-full bg-white shadow flex items-center justify-center"
        >
          <i className="ri-home-5-line text-lg" />
        </Link>
      </div>

      {/* MAP TOP HALF */}
      <div className="h-1/2 relative">
        <LiveTracking pickup={ride.pickup} destination={ride.destination} />
      </div>

      {/* PAYMENT CARD */}
      <div className="h-1/2 px-4 pb-5 pt-4 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
          {/* Driver / vehicle info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                className="h-11 w-11 rounded-full object-cover"
                src="https://i.pravatar.cc/100?img=12"
                alt="captain"
              />
              <div>
                <h2 className="text-base font-semibold capitalize">
                  {ride?.captain?.fullname?.firstname}{" "}
                  {ride?.captain?.fullname?.lastname}
                </h2>
                <p className="text-xs text-gray-500">{vehicleLabel}</p>
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-base font-semibold">
                {ride?.captain?.vehicle?.plate}
              </h4>
              <p className="text-xs text-gray-500">Plate number</p>
            </div>
          </div>

          {/* Destination + Fare */}
          <div className="mt-2">
            <div className="flex items-center gap-4 p-3 border-b">
              <i className="ri-map-pin-2-fill text-lg" />
              <div>
                <h3 className="text-sm font-medium">{destinationShort}</h3>
                <p className="text-xs -mt-0.5 text-gray-600">
                  {ride?.destination}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border-b">
              <i className="ri-currency-line text-lg" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Trip fare
                  </p>
                  <h3 className="text-base font-semibold">₹{ride?.fare}</h3>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Payment method</p>
                  <p className="text-sm font-medium">{method}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Choose how to pay</p>
            <div className="flex gap-2 flex-wrap">
              {["Cash", "UPI", "Card"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    method === m
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {method !== "Cash" && (
              <p className="mt-1 text-[11px] text-gray-400">
                Using Razorpay test mode – no real money will be charged in
                sandbox.
              </p>
            )}
          </div>

          {/* Total row */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Amount to pay</p>
            <p className="text-xl font-semibold">₹{ride?.fare}</p>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
          )}

          {/* Pay button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={loadingOrder || isPaying}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
          >
            {loadingOrder
              ? "Preparing payment…"
              : isPaying
              ? "Processing…"
              : method === "Cash"
              ? "Finish with Cash"
              : "Pay & Finish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;

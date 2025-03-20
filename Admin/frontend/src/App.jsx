import React, { useState } from "react";
import axios from "axios";

const App = () => {
    const [coupon, setCoupon] = useState("");
    const [message, setMessage] = useState("");
    const API_BASE = import.meta.env.VITE_API_BASE;
    const claimCoupon = async () => {
        try {
            const res = await axios.get(`${API_BASE}/claim-coupon`, { withCredentials: true });
            setCoupon(res.data.coupon);
            setMessage(res.data.message);
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96">
                <h1 className="text-2xl font-bold mb-4">🎟️ Round-Robin Coupon Distribution</h1>
                <button 
                    onClick={claimCoupon} 
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Claim Coupon
                </button>
                {coupon && <h2 className="text-green-500 font-bold text-lg mt-4">Your Coupon: {coupon}</h2>}
                {message && <p className="text-red-500 mt-2">{message}</p>}
            </div>
        </div>
    );
    
};

export default App;

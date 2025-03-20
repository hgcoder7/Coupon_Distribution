import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
    const [coupons, setCoupons] = useState([]);
    const [claims, setClaims] = useState([]);
    const [newCoupon, setNewCoupon] = useState("");
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE;
    useEffect(() => {
        fetchCoupons();
        fetchClaims();
    }, []);

    const checkAuth = (error) => {
        if (error.response && error.response.status === 403) {
            alert("Session expired. Please log in again.");
            navigate("/admin/signin");
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/coupons`, { withCredentials: true });
            setCoupons(res.data);
        } catch (error) {
            console.error("Error fetching coupons", error);
        }
    };

    const fetchClaims = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/claims`, { withCredentials: true });
            setClaims(res.data);
        } catch (error) {
            console.error("Error fetching claims:", error);
            checkAuth(error);
        }
    };

    const addCoupon = async () => {
        try {
            await axios.post(`${API_BASE}/admin/add-coupon`, { code: newCoupon }, { withCredentials: true });
            fetchCoupons();
            setNewCoupon("");
        } catch (error) {
            console.error("Error adding coupon", error);
        }
    };

    const toggleCoupon = async (id) => {
        try {
            await axios.patch(`${API_BASE}/admin/toggle-coupon/${id}`, {}, { withCredentials: true });
            fetchCoupons();
        } catch (error) {
            console.error("Error toggling coupon", error);
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE}/admin/logout`, {}, { withCredentials: true });
            document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            navigate("/admin/signin");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    

    return (
        <div>
            <h1>Admin Panel</h1>
            <button onClick={logout}>Logout</button>

            <h2>Add Coupon</h2>
            <input type="text" value={newCoupon} onChange={(e) => setNewCoupon(e.target.value)} placeholder="Coupon Code" />
            <button onClick={addCoupon}>Add</button>

            <h2>Coupons</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Code</th>
                        <th>Status</th>
                        <th>Toggle</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map(coupon => (
                        <tr key={coupon.id}>
                            <td>{coupon.id}</td>
                            <td>{coupon.code}</td>
                            <td>{coupon.is_claimed ? "Claimed" : "Available"}</td>
                            <td>
                            <button
                                className={`px-4 py-2 rounded text-white transition ${
                                coupon.is_claimed ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                                onClick={() => toggleCoupon(coupon.id)}>
                                {coupon.is_claimed ? "Enable" : "Disable"}
                            </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Claim History</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Coupon Code</th>
                        <th>IP Address</th>
                        <th>Session ID</th>
                        <th>Claimed At</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map(claim => (
                        <tr key={claim.id}>
                            <td>{claim.id}</td>
                            <td>{claim.code}</td>
                            <td>{claim.ip_address}</td>
                            <td>{claim.session_id}</td>
                            <td>{new Date(claim.claimed_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
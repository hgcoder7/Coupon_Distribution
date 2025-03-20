import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE;

    const handleLogin = async () => {
        try {
            await axios.post(`${API_BASE}/admin/login`, { username, password }, { withCredentials: true });
            navigate("/admin/panel");
        } catch (error) {
            setError("Invalid Credentials");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-4">🔐 Admin Login</h2>
                <input 
                    type="text" 
                    placeholder="Username" 
                    className="w-full p-2 border rounded mb-2 text-center" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full p-2 border rounded mb-2 text-center" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                    onClick={handleLogin} 
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Login
                </button>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                <button 
                    onClick={() => navigate("/")} 
                    className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                >
                    Back to User Page
                </button>
            </div>
        </div>
    );
    
};

export default AdminLogin;
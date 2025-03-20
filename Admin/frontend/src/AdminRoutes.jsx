import React from "react";
import { Routes, Route } from "react-router-dom"; 
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/signin" element={<AdminLogin />} />
            <Route path="/panel" element={<AdminPanel />} />
        </Routes>
    );
};

export default AdminRoutes;
import React from "react";
import ReactDOM from "react-dom/client";  // Use createRoot
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";  // User Side
import AdminRoutes from "./AdminRoutes";  // Admin Side

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Router>
        <Routes>
            <Route path="/*" element={<App />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
    </Router>
);

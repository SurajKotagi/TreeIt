import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { ToastContainer } from "react-toastify";
import { AnimatePresence } from "framer-motion";

import "react-toastify/dist/ReactToastify.css";

function App() {
    const [user, setUser] = useState(null);
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/Home" element={<Home />} />
                <Route path="/Login" element={<Login onLogin={setUser} />} />
                <Route path="/" element={<Register />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
        </AnimatePresence>
    );
}

export default App;

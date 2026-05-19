import React, { useState } from "react";
import api from "../components/utility/BaseAPI";
import { Link } from "react-router-dom";
import registerImage from "../images/Register.gif";
import "../style/Register.css";
import PageWrapper from "../components/ui/PageWrapper";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../components/ui/CustomDropdown";
import {
    showError,
    showSuccess,
    showInfo,
} from "../components/utility/ToastNotofication";
import { motion } from "framer-motion";
import {
    FaEnvelope,
    FaIdCard,
    FaUser,
    FaLock,
    FaUserCog,
    FaArrowRight,
} from "react-icons/fa";
import { Select } from "@mui/material";

function Register() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        mail: "",
        employeeId: "",
        role: "User",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...form,
                role: form.role.toUpperCase(),
            };
            const res = await api.post("/auth/register", dataToSend);
            if (
                res.data === "Mail already exists" ||
                res.data === "Employee ID already exists" ||
                res.data === "Username already exists"
            ) {
                showInfo(res.data);
            } else {
                showSuccess(res.data);
                navigate("/login");
            }
        } catch {
            showError("Registration failed, Server busy");
        }
    };

    return (
        <PageWrapper>
            <div className="register-wrapper font-poppins">
                <motion.div
                    className="register-right"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.img
                        src={registerImage}
                        alt="register Visual"
                        className="register-image"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.6,
                            type: "spring",
                            stiffness: 100,
                        }}
                    />

                    <motion.h3
                        className="slogan"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        Break It! <b>To Build It</b>
                    </motion.h3>

                    <motion.p
                        className="tagline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        Visual task management tool
                    </motion.p>
                </motion.div>

                <motion.div
                    className="register-left"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.div
                        className="register-logo"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        Tree It
                    </motion.div>

                    <motion.h2
                        className="register-welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Hello there!
                    </motion.h2>

                    <motion.p
                        className="register-subtext"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        Please enter your register details below
                    </motion.p>

                    <motion.form
                        className="register-form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <motion.div
                            className="input-container"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                        >
                            <FaEnvelope className="input-icon" />
                            <input
                                type="text"
                                placeholder="Email"
                                value={form.mail}
                                onChange={(e) =>
                                    setForm({ ...form, mail: e.target.value })
                                }
                                className="register-input"
                            />
                        </motion.div>

                        <motion.div
                            className="input-container"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.3 }}
                        >
                            <FaIdCard className="input-icon" />
                            <input
                                type="text"
                                placeholder="Employee ID"
                                value={form.employeeId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        employeeId: e.target.value,
                                    })
                                }
                                className="register-input"
                            />
                        </motion.div>

                        <motion.div
                            className="input-container"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                        >
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={form.username}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        username: e.target.value,
                                    })
                                }
                                className="register-input"
                            />
                        </motion.div>

                        <motion.div
                            className="input-container"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.3 }}
                        >
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                className="register-input"
                            />
                        </motion.div>

                        <motion.div
                            className="input-container"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.3 }}
                        >
                            <FaUserCog className="input-icon" />
                            <CustomDropdown
                                value={form.role}
                                onChange={(selectedRole) =>
                                    setForm({ ...form, role: selectedRole })
                                }
                            />
                        </motion.div>

                        <motion.button
                            className="register-button"
                            type="submit"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.1, duration: 0.4 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <span className="button-text">Register</span>
                            <span className="button-icon">
                                <FaArrowRight />
                            </span>
                        </motion.button>

                        <motion.div
                            className="server-note"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                        >
                            <p>
                                <strong>Note:</strong> This backend is hosted on
                                a free serverless tier. The very first login
                                request may take up to 50 seconds to wake the
                                server. Thank you for your patience!
                            </p>
                        </motion.div>

                        {message && (
                            <motion.p
                                className="register-message"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {message}
                            </motion.p>
                        )}

                        <motion.p
                            className="signup-prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.4 }}
                        >
                            Already have an account?{" "}
                            <a href="/login">Sign In</a>
                        </motion.p>
                    </motion.form>
                </motion.div>
            </div>
        </PageWrapper>
    );
}

export default Register;

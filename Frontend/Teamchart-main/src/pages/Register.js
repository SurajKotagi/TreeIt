import { motion } from "framer-motion";
import { useState } from "react";
import {
    FaArrowRight,
    FaEnvelope,
    FaIdCard,
    FaLock,
    FaUser,
    FaUserCog,
    FaKey,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../components/ui/CustomDropdown";
import PageWrapper from "../components/ui/PageWrapper";
import api from "../components/utility/BaseAPI";
import {
    showError,
    showInfo,
    showSuccess,
} from "../components/utility/ToastNotofication";
import registerImage from "../images/Register.gif";
import "../style/Register.css";
import { useGoogleLogin } from "@react-oauth/google";

function Register() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        mail: "",
        employeeId: "",
        role: "User",
        otp: "",
    });
    const [message, setMessage] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [loadingOtp, setLoadingOtp] = useState(false);
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                const res = await api.post("/auth/google", {
                    mail: userInfo.email,
                    name: userInfo.name,
                });

                if (res.status === 200 && typeof res.data === "number") {
                    showSuccess("Registered and logged in with Google!");
                    navigate("/login");
                } else {
                    showError("Unexpected response from server.");
                }
            } catch (err) {
                showError("Google Registration failed. Please try again.");
            }
        },
        onError: errorResponse => showError("Google Registration failed."),
    });

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!form.mail) {
            showInfo("Please enter an email address first.");
            return;
        }
        setLoadingOtp(true);
        try {
            const res = await api.post("/auth/request-otp", { mail: form.mail });
            if (res.data === "Mail already exists") {
                showInfo(res.data);
            } else {
                showSuccess("OTP sent to your email!");
                setOtpRequested(true);
            }
        } catch (error) {
            showError(error.response?.data || "Failed to send OTP. Server busy.");
        } finally {
            setLoadingOtp(false);
        }
    };

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
        } catch (error) {
            showError(error.response?.data || "Registration failed, Server busy");
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
                        onSubmit={otpRequested ? handleSubmit : handleRequestOtp}
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
                                disabled={otpRequested}
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
                                disabled={otpRequested}
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
                                disabled={otpRequested}
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
                                disabled={otpRequested}
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
                                options={["User", "Admin"]}
                                onChange={(selectedRole) =>
                                    setForm({ ...form, role: selectedRole })
                                }
                            />
                        </motion.div>

                        {otpRequested && (
                            <motion.div
                                className="input-container"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                <FaKey className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={form.otp}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            otp: e.target.value,
                                        })
                                    }
                                    className="register-input"
                                />
                            </motion.div>
                        )}

                        {!otpRequested ? (
                            <>
                                <motion.button
                                    className="register-button"
                                    type="submit"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.1, duration: 0.4 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    disabled={loadingOtp}
                                >
                                    <span className="button-text">
                                        {loadingOtp ? "Sending OTP..." : "Send OTP"}
                                    </span>
                                    <span className="button-icon">
                                        <FaArrowRight />
                                    </span>
                                </motion.button>
                                
                                <motion.div
                                    className="register-separator"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 0.4 }}
                                >
                                    Or
                                </motion.div>

                                <motion.button
                                    type="button"
                                    className="google-register-button"
                                    onClick={() => googleLogin()}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.3, duration: 0.4 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="google-icon" />
                                    <span>Register with Google</span>
                                </motion.button>
                            </>
                        ) : (
                            <motion.button
                                className="register-button"
                                type="submit"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="button-text">Register</span>
                                <span className="button-icon">
                                    <FaArrowRight />
                                </span>
                            </motion.button>
                        )}

                        <motion.div
                            className="server-note"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4, duration: 0.5 }}
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
                            transition={{ delay: 1.5, duration: 0.4 }}
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

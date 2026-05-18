import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../components/utility/BaseAPI";
import "../style/Login.css";
import loginImage from "../images/Login.gif";
import "../style/animate.css";
import { FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import Loading from "../components/ui/Loading";
import PageWrapper from "../components/ui/PageWrapper";
import {
    showError,
    showSuccess,
} from "../components/utility/ToastNotofication";
import { motion } from "framer-motion";

function Login({ onLogin }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post("/auth/login", form);
            if (res.status === 200 && typeof res.data === "number") {
                localStorage.setItem("memberId", res.data);
                localStorage.setItem("username", form.username);
                onLogin(res.data);
                showSuccess("Logged in as " + form.username);
                navigate("/home");
            } else {
                showError("Unexpected response from server.");
            }
        } catch (err) {
            if (err.response?.status === 401) {
                showError("Invalid username or password");
            } else {
                showError("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="login-wrapper font-poppins">
                {isLoading && <Loading />}

                <motion.div
                    className="login-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.div
                        className="login-logo"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        Tree It
                    </motion.div>

                    <motion.h2
                        className="login-welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Welcome Back!
                    </motion.h2>

                    <motion.p
                        className="login-subtext"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        Please enter your login details below
                    </motion.p>

                    <motion.form
                        className="login-form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <motion.div
                            className="input-container"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
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
                                className="login-input"
                            />
                        </motion.div>

                        <motion.div
                            className="input-container"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.4 }}
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
                                className="login-input"
                            />
                        </motion.div>

                        <motion.div
                            className="login-actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.4 }}
                        >
                            <span className="forgot-password hover-effect">
                                Forgot password?
                            </span>
                        </motion.div>

                        <motion.button
                            className="login-button"
                            type="submit"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.4 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <span className="button-text">Login</span>
                            <span className="button-icon">
                                <FaArrowRight />
                            </span>
                        </motion.button>

                        {error && (
                            <motion.p
                                className="login-error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.p
                            className="signup-prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.4 }}
                        >
                            Don't have an account?{" "}
                            <a href="/" className="signup-link">
                                Sign Up
                            </a>
                        </motion.p>
                    </motion.form>
                </motion.div>

                <motion.div
                    className="login-right"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.div
                        className="image-container"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.6,
                            type: "spring",
                            stiffness: 100,
                        }}
                    >
                        <img
                            src={loginImage}
                            alt="Login Visual"
                            className="login-image"
                        />
                    </motion.div>

                    <motion.div
                        className="login-right-content"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <motion.h3
                            className="slogan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            Break It! <b>To Build It</b>
                        </motion.h3>

                        <motion.p
                            className="tagline"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            Visual task management tool for efficient teamwork
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </PageWrapper>
    );
}

export default Login;

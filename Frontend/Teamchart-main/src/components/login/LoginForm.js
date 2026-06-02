// src/components/login/LoginForm.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import { loginUser } from "../../services/authService";
import { showSuccess, showError } from "../utility/ToastNotofication";
import Loading from "../ui/Loading";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../utility/BaseAPI";

function LoginForm({ onLogin }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                // We send the access token to backend, or for simplicity, we can fetch user info here
                // For a proper implementation, backend should verify the token.
                const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                const res = await api.post("/auth/google", {
                    mail: userInfo.email,
                    name: userInfo.name,
                });

                if (res.status === 200 && typeof res.data === "number") {
                    localStorage.setItem("memberId", res.data);
                    localStorage.setItem("username", userInfo.name);
                    onLogin(res.data);
                    showSuccess("Logged in as " + userInfo.name);
                    navigate("/home");
                } else {
                    showError("Unexpected response from server.");
                }
            } catch (err) {
                showError("Google Login failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: errorResponse => showError("Google Login failed."),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await loginUser(form);
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
        <div className="login-left">
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

                    <motion.div
                        className="login-separator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                    >
                        Or
                    </motion.div>

                    <motion.button
                        type="button"
                        className="google-login-button"
                        onClick={() => googleLogin()}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="google-icon" />
                        <span>Continue with Google</span>
                    </motion.button>

                    <motion.div
                        className="server-note"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    >
                        <p>
                            <strong>Note:</strong> This backend is hosted on a
                            free serverless tier. The very first login request
                            may take up to 50 seconds to wake the server. Thank
                            you for your patience!
                        </p>
                    </motion.div>

                    <motion.p
                        className="signup-prompt"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3, duration: 0.4 }}
                    >
                        Don't have an account?{" "}
                        <Link to="/" className="signup-link">
                            Sign Up
                        </Link>
                    </motion.p>
                </motion.form>
            </motion.div>
        </div>
    );
}

export default LoginForm;

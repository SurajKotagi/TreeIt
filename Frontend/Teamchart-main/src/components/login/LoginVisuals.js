import { motion } from "framer-motion";
import loginImage from "../../images/Login.gif";

function LoginVisuals() {
    return (
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
    );
}
export default LoginVisuals;

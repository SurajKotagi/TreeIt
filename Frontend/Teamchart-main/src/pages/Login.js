import "../style/Login.css";
import "../style/animate.css";
import PageWrapper from "../components/ui/PageWrapper";
import LoginForm from "../components/login/LoginForm";
import LoginVisuals from "../components/login/LoginVisuals";

function Login({ onLogin }) {
    return (
        <PageWrapper>
            <div className="login-wrapper font-poppins">
                <LoginForm onLogin={onLogin} />
                <LoginVisuals />
            </div>
        </PageWrapper>
    );
}

export default Login;

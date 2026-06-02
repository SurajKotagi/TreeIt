import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {
    createBrowserRouter,
    RouterProvider,
    BrowserRouter,
} from "react-router-dom";

import { AppProvider } from "./components/utility/SidebarSlide";
import { GoogleOAuthProvider } from "@react-oauth/google";

// --- THIS BLOCK IS TO HIDE THE HARMLESS RESIZE WARNING ---
window.addEventListener("error", (e) => {
    if (e.message.includes("ResizeObserver loop")) {
        const resizeObserverErrDiv = document.getElementById(
            "webpack-dev-server-client-overlay-div",
        );
        const resizeObserverErr = document.getElementById(
            "webpack-dev-server-client-overlay",
        );
        if (resizeObserverErr) {
            resizeObserverErr.setAttribute("style", "display: none");
        }
        if (resizeObserverErrDiv) {
            resizeObserverErrDiv.setAttribute("style", "display: none");
        }
    }
});
// ---------------------------------------------------------

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId="178157084237-grj1d7ah0cpfn0a1j8i8ct2fvgn5pvlv.apps.googleusercontent.com">
            <AppProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AppProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
);

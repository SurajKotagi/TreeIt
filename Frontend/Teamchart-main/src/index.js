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
        <AppProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AppProvider>
    </React.StrictMode>,
);

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    variants: {
        scrollbar: ["rounded"],
    },
    theme: {
        extend: {
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
                inter: ["Inter", "sans-serif"],
            },
            animation: {
                fadeIn: "fadeIn 0.3s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: 0, transform: "translateY(-10px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [require("tailwind-scrollbar")],
};

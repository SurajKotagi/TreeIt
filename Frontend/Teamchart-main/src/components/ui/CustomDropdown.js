// src/components/ui/CustomDropdown.js
import React, { useState, useRef, useEffect } from "react";
import { FaUserShield, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function CustomDropdown({ value, onChange, options }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // This closes the dropdown if the user clicks anywhere else on the screen
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        // We reuse your exact "input-container" class so it matches the other inputs perfectly!
        <div
            className="input-container custom-dropdown-container"
            ref={dropdownRef}
        >
            <FaUserShield className="input-icon" />

            <div
                className="login-input dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{value || "Select Role"}</span>
                <FaChevronDown className={`chevron ${isOpen ? "open" : ""}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="dropdown-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {options.map((option) => (
                            <div
                                key={option}
                                className={`dropdown-item ${value === option ? "selected" : ""}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CustomDropdown;

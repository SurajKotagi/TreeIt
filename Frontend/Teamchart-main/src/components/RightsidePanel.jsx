import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
    FaSave,
    FaDownload,
    FaPlus,
    FaRegLightbulb,
    FaChevronRight,
} from "react-icons/fa";
import CustomDropdown from "../components/ui/CustomDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { forwardRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
        <input
            readOnly
            value={value || "Select deadline..."}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-700 cursor-pointer"
        />
        <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
    </div>
));

const RightsidePanel = ({
    isSidebarOpen,
    closeSidebar,
    projectMembers,
    newNodeInput,
    setNewNodeInput,
    description,
    setDescription,
    handleCreateNode,
    saveGraph,
    handleDownload,
}) => {
    const [showTip, setShowTip] = useState(false);

    const tips = [
        "Assign clear deadlines for better tracking",
        "Add detailed descriptions to clarify tasks",
        "Use the node connections to show task dependencies",
        "Regular saves prevent data loss",
        "Download your chart to share with team members",
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    className="fixed top-0 right-0 z-40 h-screen"
                >
                    <motion.div className="relative flex flex-col w-80 h-full px-6 py-8 bg-white shadow-2xl border-l border-gray-100 font-poppins">
                        {/* Close Button */}
                        <button
                            onClick={closeSidebar}
                            className="absolute top-4 left-[-1.5rem] bg-white border border-gray-200 p-2 rounded-full shadow-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </button>

                        {/* Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Node{" "}
                                <span className="text-blue-500">Details</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Configure your task parameters
                            </p>
                        </div>

                        {/* Form Inputs (Tailwind Styled) */}
                        <div className="flex flex-col gap-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                            {/* Task Input */}
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold text-gray-600 mb-1 ml-1 uppercase tracking-wide">
                                    Task Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Design Database Schema"
                                    value={newNodeInput.task}
                                    onChange={(e) =>
                                        setNewNodeInput({
                                            ...newNodeInput,
                                            task: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-700"
                                />
                            </div>

                            {/* Description Input */}
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold text-gray-600 mb-1 ml-1 uppercase tracking-wide">
                                    Description
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Optional notes or context..."
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-700 resize-none"
                                />
                            </div>

                            {/* Assignee Select */}
                            <div className="flex flex-col relative z-20">
                                {" "}
                                {/* z-20 ensures the menu floats above the calendar */}
                                <label className="text-xs font-semibold text-gray-600 mb-1 ml-1 uppercase tracking-wide">
                                    Assign To
                                </label>
                                <CustomDropdown
                                    value={newNodeInput.assignedTo}
                                    options={projectMembers.map(
                                        (member) => member.username,
                                    )}
                                    onChange={(selectedValue) =>
                                        setNewNodeInput({
                                            ...newNodeInput,
                                            assignedTo: selectedValue,
                                        })
                                    }
                                />
                            </div>

                            {/* Native Date Picker */}
                            <div className="flex flex-col relative z-10 mb-6">
                                <label className="text-xs font-semibold text-gray-600 mb-1 ml-1 uppercase tracking-wide">
                                    Deadline
                                </label>
                                <DatePicker
                                    selected={
                                        newNodeInput.deadline
                                            ? new Date(newNodeInput.deadline)
                                            : null
                                    }
                                    onChange={(date) =>
                                        setNewNodeInput({
                                            ...newNodeInput,
                                            deadline: date
                                                ? date.toISOString()
                                                : "",
                                        })
                                    }
                                    customInput={<CustomDateInput />}
                                    minDate={new Date()}
                                    portalId="root"
                                    popperPlacement="bottom-start"
                                    showTimeInput
                                    timeInputLabel="Time:"
                                    dateFormat="MMM d, yyyy h:mm aa"
                                />
                            </div>

                            {/* MOVED: Create Node Button directly under Deadline */}
                            <motion.button
                                onClick={handleCreateNode}
                                onMouseEnter={() => setShowTip(true)}
                                onMouseLeave={() => setShowTip(false)}
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor: "#f8fafc",
                                }}
                                whileTap={{ scale: 0.98 }}
                                // CHANGED: justify-center -> justify-start, added pl-6
                                className="w-full flex items-center justify-start pl-6 gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-full font-bold transition-all shadow-sm hover:shadow-md mt-2"
                            >
                                {/* Custom Multi-colored Plus Icon */}
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="flex-shrink-0"
                                >
                                    <rect
                                        x="9"
                                        y="2"
                                        width="2"
                                        height="7"
                                        fill="#f77272"
                                    />
                                    <rect
                                        x="9"
                                        y="11"
                                        width="2"
                                        height="7"
                                        fill="#49de80"
                                    />
                                    <rect
                                        x="2"
                                        y="9"
                                        width="7"
                                        height="2"
                                        fill="#fabd23"
                                    />
                                    <rect
                                        x="11"
                                        y="9"
                                        width="7"
                                        height="2"
                                        fill="#c083fc"
                                    />
                                    <rect
                                        x="9"
                                        y="9"
                                        width="2"
                                        height="2"
                                        fill="#c083fc"
                                    />
                                </svg>

                                {/* CHANGED: Text back to Create Node */}
                                <span className="text-[16px] tracking-wide text-gray-800">
                                    Create Node
                                </span>
                            </motion.button>

                            {/* Pro Tip (Matching the new Purple theme) */}
                            <AnimatePresence>
                                {showTip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mt-4 p-3 bg-[#fdfaef] rounded-lg border border-[#c083fc]/20 flex items-start gap-2"
                                    >
                                        <FaRegLightbulb className="text-[#c083fc] mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-gray-700 font-medium leading-relaxed">
                                            {randomTip}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RightsidePanel;

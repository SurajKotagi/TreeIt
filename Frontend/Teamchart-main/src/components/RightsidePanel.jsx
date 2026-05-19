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
                            <div className="flex flex-col relative z-10">
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
                                    // KEEP THESE TWO (The actual fix for the blinking)
                                    portalId="root"
                                    popperPlacement="bottom-start"
                                    // YOUR TIME SETTINGS
                                    showTimeInput
                                    timeInputLabel="Time:"
                                    dateFormat="MMM d, yyyy h:mm aa"
                                />
                            </div>

                            {/* Pro Tip */}
                            <AnimatePresence>
                                {showTip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2"
                                    >
                                        <FaRegLightbulb className="text-blue-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                            {randomTip}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                            <button
                                onClick={handleCreateNode}
                                onMouseEnter={() => setShowTip(true)}
                                onMouseLeave={() => setShowTip(false)}
                                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/30"
                            >
                                <FaPlus /> Create Node
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={saveGraph}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 py-2.5 rounded-lg font-medium transition-colors"
                                >
                                    <FaSave /> Save
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 py-2.5 rounded-lg font-medium transition-colors"
                                >
                                    <FaDownload /> Export
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RightsidePanel;

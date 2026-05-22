import { useState, useEffect, forwardRef } from "react";
import { showError, showSuccess } from "../utility/ToastNotofication";
import {
    FaPlus,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimes,
    FaUser,
    FaTasks,
    FaCalendarAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CustomDropdown from "../ui/CustomDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./../../style/Nodecard.css";

// 1. Custom Date Input Wrapper - Aligned padding and fixed text truncation
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
        <input
            readOnly
            value={value || "Select deadline..."}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl pl-3 pr-8 py-2.5 text-[13px] focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
        />
        <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
));

const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const pad = (num) => String(num).padStart(2, "0");

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = pad(hours);

    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
};

const Nodecard = ({
    show,
    onClose,
    nodeName,
    description,
    todos,
    assignedTo,
    creatorId,
    onToggleTodo,
    onMarkCompleted,
    onAddTodo,
    status,
    onStatusChange,
    nodeData,
    onDeadlineChange,
    stuckReason,
    onStuckReasonChange,
}) => {
    const [newTodo, setNewTodo] = useState("");
    const [deadline, setDeadline] = useState(new Date());
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (show && nodeData && nodeData.deadline) {
            setDeadline(nodeData.deadline);
            setReason(stuckReason || "");
        }
    }, [show, nodeData, stuckReason]);

    const loggedInMember = localStorage.getItem("username");
    const loggedInMemberId = localStorage.getItem("memberId");

    const statusOptions = ["Unpicked", "Pending", "Stuck"];
    const currentStatusDisplay = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Unpicked";

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* CHANGED: max-w-lg -> max-w-md for a tighter card */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                    >
                        {/* 1. Header Section - Tightened padding to p-5 */}
                        <div className="relative px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                            >
                                <FaTimes size={12} />
                            </button>

                            {/* CHANGED: text-2xl -> text-xl */}
                            <h2 className="text-xl font-bold text-gray-800 pr-8 leading-snug">
                                {nodeName}
                            </h2>
                            {description && (
                                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                                    {description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 mt-3">
                                {nodeData?.assignedBy && (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                                        <FaUser size={9} />
                                        <span>From: {nodeData.assignedBy}</span>
                                    </div>
                                )}
                                {nodeData?.createdTime && (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-200">
                                        <FaClock size={9} />
                                        <span>
                                            {formatDateTime(
                                                nodeData.createdTime,
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Scrollable Body Section - Tightened padding to p-5, gap-5 */}
                        <div className="px-5 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Status Custom Dropdown */}
                                {assignedTo === loggedInMember && (
                                    <div className="flex flex-col gap-1 z-20">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                                            Task Status
                                        </label>
                                        {/* Ensure your CustomDropdown component renders with h-10 to match! */}
                                        <CustomDropdown
                                            value={currentStatusDisplay}
                                            options={statusOptions}
                                            onChange={(selectedValue) =>
                                                onStatusChange(
                                                    selectedValue.toLowerCase(),
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                {/* React DatePicker */}
                                {nodeData && creatorId === loggedInMemberId && (
                                    <div className="flex flex-col gap-1 z-10">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                                            Deadline
                                        </label>
                                        {/* CHANGED: Using items-stretch instead of h-10 so they naturally match the dropdown's height */}
                                        <div className="flex items-stretch gap-2">
                                            <div className="flex-1 min-w-0">
                                                {" "}
                                                {/* min-w-0 prevents flex blowout */}
                                                <DatePicker
                                                    selected={
                                                        deadline
                                                            ? new Date(deadline)
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        setDeadline(
                                                            date
                                                                ? date.toISOString()
                                                                : "",
                                                        )
                                                    }
                                                    customInput={
                                                        <CustomDateInput />
                                                    }
                                                    minDate={new Date()}
                                                    portalId="root"
                                                    popperPlacement="bottom-start"
                                                    showTimeInput
                                                    timeInputLabel="Time:"
                                                    dateFormat="MMM d, yyyy h:mm aa"
                                                />
                                            </div>
                                            {/* CHANGED: Beautiful blue button instead of black */}
                                            <button
                                                onClick={async () => {
                                                    if (!deadline)
                                                        return showError(
                                                            "Deadline cannot be empty",
                                                        );
                                                    try {
                                                        await onDeadlineChange(
                                                            deadline,
                                                        );
                                                        showSuccess(
                                                            "Deadline updated!",
                                                        );
                                                    } catch (e) {
                                                        showError(
                                                            "Failed to update deadline",
                                                        );
                                                    }
                                                }}
                                                className="bg-blue-500 text-white text-xs px-4 rounded-xl hover:bg-blue-600 transition-all font-bold shadow-sm shadow-blue-500/20 flex-shrink-0"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Warning State: Stuck Reason */}
                            {status === "stuck" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-inner">
                                    <label className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                        <FaExclamationTriangle size={10} />
                                        Blocker Reason
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) =>
                                            setReason(e.target.value)
                                        }
                                        disabled={assignedTo !== loggedInMember}
                                        placeholder={
                                            assignedTo === loggedInMember
                                                ? "Explain what is blocking this task..."
                                                : ""
                                        }
                                        className="w-full bg-white rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 p-2.5 text-sm min-h-[70px] outline-none transition-all resize-none text-gray-700"
                                    />
                                    {assignedTo === loggedInMember && (
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await onStuckReasonChange(
                                                            reason,
                                                        );
                                                        showSuccess(
                                                            "Reason updated successfully!",
                                                        );
                                                    } catch (e) {
                                                        showError(
                                                            "Failed to update reason",
                                                        );
                                                    }
                                                }}
                                                className="bg-amber-500 text-white text-[11px] py-1.5 px-3 rounded-lg hover:bg-amber-600 transition font-semibold shadow-sm"
                                            >
                                                Update Blocker
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Todos Checklist */}
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                                    <FaTasks
                                        className="text-gray-400"
                                        size={12}
                                    />
                                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                        Sub-Tasks
                                    </h3>
                                </div>

                                <div className="bg-gray-50/50 rounded-xl p-2.5 border border-gray-100 max-h-40 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                    {todos.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic text-center py-3">
                                            No sub-tasks added yet.
                                        </p>
                                    ) : (
                                        <ul className="space-y-1.5">
                                            {todos.map((todo) => (
                                                <li
                                                    key={todo.id}
                                                    className="flex items-start gap-2.5 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm group"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={todo.completed}
                                                        onChange={() => {
                                                            if (
                                                                assignedTo ===
                                                                loggedInMember
                                                            ) {
                                                                onToggleTodo(
                                                                    todo.id,
                                                                );
                                                            } else {
                                                                showError(
                                                                    "You are not assigned to this task.",
                                                                );
                                                            }
                                                        }}
                                                        className="mt-0.5 w-3.5 h-3.5 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                    />
                                                    <span
                                                        className={`text-sm flex-1 leading-snug transition-colors ${
                                                            todo.completed
                                                                ? "line-through text-gray-400"
                                                                : "text-gray-700 font-medium group-hover:text-gray-900"
                                                        }`}
                                                    >
                                                        {todo.task}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Add New Todo - Forced h-10 for consistent sizing */}
                                {creatorId === loggedInMemberId && (
                                    <div className="flex gap-2 relative h-10 mt-1">
                                        <input
                                            type="text"
                                            placeholder="Add a new sub-task..."
                                            value={newTodo}
                                            onChange={(e) =>
                                                setNewTodo(e.target.value)
                                            }
                                            onKeyDown={async (e) => {
                                                if (
                                                    e.key === "Enter" &&
                                                    newTodo.trim() !== ""
                                                ) {
                                                    await onAddTodo(newTodo);
                                                    setNewTodo("");
                                                }
                                            }}
                                            className="flex-1 h-full bg-white border border-gray-200 rounded-xl pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all w-full box-border"
                                        />
                                        <button
                                            onClick={async () => {
                                                if (newTodo.trim() !== "") {
                                                    await onAddTodo(newTodo);
                                                    setNewTodo("");
                                                }
                                            }}
                                            className="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-100 text-gray-600 px-2.5 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition flex items-center"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Footer Action */}
                        {assignedTo === loggedInMember &&
                            status !== "completed" && (
                                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                                    <motion.button
                                        onClick={onMarkCompleted}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm shadow-green-500/20"
                                    >
                                        <FaCheckCircle size={14} /> Mark Task as
                                        Completed
                                    </motion.button>
                                </div>
                            )}
                        {status === "completed" && (
                            <div className="px-5 py-3.5 bg-green-50 border-t border-green-100 flex items-center justify-center gap-2 text-green-700 text-sm font-bold flex-shrink-0">
                                <FaCheckCircle size={14} /> This task is
                                completed
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Nodecard;

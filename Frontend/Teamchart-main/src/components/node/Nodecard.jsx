import { useState, useEffect } from "react";
import { showError, showSuccess } from "../utility/ToastNotofication";
import {
    FaPlus,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimes,
    FaUser,
} from "react-icons/fa";
import "./../../style/Nodecard.css";

const formatDateTime = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    // Helper to add leading zeros (e.g., 9 becomes "09")
    const pad = (num) => String(num).padStart(2, "0");

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // JavaScript months are 0-indexed!
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert 24hr to 12hr format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
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

    if (!show) return null;

    const loggedInMember = localStorage.getItem("username");
    const loggedInMemberId = localStorage.getItem("memberId");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative animate-fade-in">
                {/* Header with blue background */}
                <div className="bg-blue-500 p-4 text-white">
                    <h2 className="text-xl font-semibold">{nodeName}</h2>
                    <p className="text-xs opacity-90 mt-1">{description}</p>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-white hover:text-gray-200 transition"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {/* Assignment Information */}
                    {nodeData && nodeData.assignedBy && (
                        <div className="mb-3 bg-gray-100 p-2 rounded">
                            <div className="flex items-center gap-2">
                                <FaUser className="text-gray-500" />
                                <div>
                                    <p className="text-xs font-medium text-gray-700">
                                        Assigned by:
                                        <span className="ml-1 font-normal">
                                            {nodeData.assignedBy}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {nodeData && nodeData.createdTime && (
                        <div className="mb-3 bg-gray-100 p-2 rounded">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-gray-500" />
                                <div>
                                    <p className="text-xs font-medium text-gray-700">
                                        Assigned at:
                                        <span className="ml-1 font-normal">
                                            {formatDateTime(
                                                nodeData.createdTime,
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Controls - Compact */}
                    {assignedTo === loggedInMember && (
                        <div className="mb-3 bg-gray-100 p-2 rounded">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) =>
                                        onStatusChange(e.target.value)
                                    }
                                    className="rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-1 text-xs"
                                >
                                    <option value="unpicked">None</option>
                                    <option value="pending">Pending</option>
                                    <option value="stuck">Stuck</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Stuck Reason - Compact */}
                    {status === "stuck" && (
                        <div className="mb-3 bg-gray-100 p-2 rounded border-l-2 border-gray-400">
                            <label className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-1">
                                <FaExclamationTriangle className="text-gray-700" />
                                Reason for being stuck
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={assignedTo !== loggedInMember}
                                placeholder={
                                    assignedTo === loggedInMember
                                        ? "Enter reason why you're stuck..."
                                        : ""
                                }
                                className="w-full rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2 text-xs min-h-[60px]"
                            />
                            {assignedTo === loggedInMember && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await onStuckReasonChange(reason);
                                            showSuccess(
                                                "Reason updated successfully!",
                                            );
                                        } catch (e) {
                                            showError(
                                                "Failed to update reason",
                                            );
                                        }
                                    }}
                                    className="mt-1 bg-blue-500 text-white text-xs py-1 px-3 rounded hover:bg-blue-600 transition flex items-center gap-1 ml-auto"
                                >
                                    Update
                                </button>
                            )}
                        </div>
                    )}

                    {/* Deadline editor - Compact */}
                    {nodeData && creatorId === loggedInMemberId && (
                        <div className="mb-3 bg-gray-100 p-2 rounded border-l-2 border-blue-500">
                            <label className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-1">
                                <FaClock className="text-blue-500" />
                                Deadline
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(e) =>
                                        setDeadline(e.target.value)
                                    }
                                    className="flex-1 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-1 text-xs"
                                />
                                <button
                                    onClick={async () => {
                                        if (!deadline) {
                                            showError(
                                                "Deadline cannot be empty",
                                            );
                                            return;
                                        }
                                        try {
                                            await onDeadlineChange(deadline);
                                            showSuccess("Deadline updated!");
                                        } catch (e) {
                                            showError(
                                                "Failed to update deadline",
                                            );
                                        }
                                    }}
                                    className="bg-blue-500 text-white text-xs py-1 px-3 rounded hover:bg-blue-600 transition"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Todo List - Stylized */}
                    <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                            Tasks
                        </h3>
                        <div className="bg-gray-100 rounded p-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                            {todos.length === 0 ? (
                                <p className="text-xs text-gray-500 italic text-center py-2">
                                    No tasks yet
                                </p>
                            ) : (
                                <ul className="space-y-1">
                                    {todos.map((todo) => (
                                        <li
                                            key={todo.id}
                                            className="flex items-center gap-2 text-xs py-1 px-2 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => {
                                                    if (
                                                        assignedTo ===
                                                        loggedInMember
                                                    ) {
                                                        onToggleTodo(todo.id);
                                                    } else {
                                                        showError(
                                                            "You are not assigned to this task.",
                                                        );
                                                    }
                                                }}
                                                className="accent-blue-500 w-3 h-3"
                                            />
                                            <span
                                                className={
                                                    todo.completed
                                                        ? "line-through text-gray-400"
                                                        : "text-gray-700"
                                                }
                                            >
                                                {todo.task}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Add Todo Section - Inline */}
                    {creatorId === loggedInMemberId && (
                        <div className="mb-3">
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    placeholder="Add new task..."
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    onClick={async () => {
                                        if (newTodo.trim() !== "") {
                                            await onAddTodo(newTodo);
                                            setNewTodo("");
                                        }
                                    }}
                                    className="bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600 transition flex items-center"
                                >
                                    <FaPlus size={10} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="bg-gray-100 p-3 border-t">
                    {assignedTo === loggedInMember && (
                        <button
                            onClick={onMarkCompleted}
                            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                            <FaCheckCircle /> Mark Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Nodecard;

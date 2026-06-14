import React, { memo, useState, useCallback, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import {
    FaCheckCircle,
    FaClock,
    FaExclamationCircle,
    FaRegCircle,
    FaCalendarAlt,
    FaComment,
    FaHandsHelping,
    FaTools,
    FaBriefcase,
} from "react-icons/fa";

const RectangularNode = ({ data }) => {
    const [progress, setProgress] = useState(0);

    // 1. Calculate Elapsed Time for Bubble (Current Time - Assigned Time)
    const getElapsedTime = (createdTime) => {
        const startTime = createdTime || data.assignedAt;
        if (!startTime) return { value: 0, label: "mins" };

        const now = new Date();
        const created = new Date(startTime);
        const diffMs = now - created;

        if (diffMs < 0) return { value: 0, label: "mins" };

        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 60) return { value: diffMins, label: "mins" };

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return { value: diffHours, label: "hours" };

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return { value: diffDays, label: "days" };
    };

    // 2. Format Deadline Date
    const formatDeadline = (dateString) => {
        if (!dateString) return "No deadline";
        const d = new Date(dateString);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    // 3. Progress Bar Calculation
    const updateProgress = useCallback(() => {
        const startTime = data.createdTime || data.assignedAt;
        if (!startTime || !data.deadline) return;

        const start = new Date(startTime);
        const end = new Date(data.deadline);
        const now = new Date();

        const total = end - start;
        const elapsed = now - start;

        if (total <= 0) {
            setProgress(100);
            return;
        }

        const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
        setProgress(percent.toFixed(0));
    }, [data.createdTime, data.assignedAt, data.deadline]);

    // 4. Update Progress periodically
    useEffect(() => {
        updateProgress();
        const interval = setInterval(updateProgress, 60000); // Update every 1 minute
        return () => clearInterval(interval);
    }, [updateProgress]);

    // 5. Status Configuration Map
    const statusConfig = {
        completed: {
            text: "text-green-600",
            bg: "bg-green-500",
            border: "border-green-500",
            icon: <FaCheckCircle />,
        },
        pending: {
            text: "text-blue-500",
            bg: "bg-blue-500",
            border: "border-blue-500",
            icon: <FaClock />,
        },
        stuck: {
            text: "text-amber-500",
            bg: "bg-amber-500",
            border: "border-amber-500",
            icon: <FaExclamationCircle />,
        },
        // ✨ NEW STATUS: In Need (Purple)
        "in need": {
            text: "text-purple-500",
            bg: "bg-purple-500",
            border: "border-purple-500",
            icon: <FaHandsHelping />,
        },
        // ✨ NEW STATUS: Working (Teal)
        working: {
            text: "text-teal-500",
            bg: "bg-teal-500",
            border: "border-teal-500",
            icon: <FaTools />,
        },
        unpicked: {
            text: "text-gray-400",
            bg: "bg-gray-400",
            border: "border-gray-300",
            icon: <FaRegCircle />,
        },
        busy: {
            text: "text-orange-500",
            bg: "bg-orange-500",
            border: "border-orange-500",
            icon: <FaBriefcase />,
        },
    };

    const currentStatus = data.status || "unpicked";
    const config = statusConfig[currentStatus] || statusConfig.unpicked;
    const elapsed = getElapsedTime(data.createdTime);

    return (
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 min-w-[260px] max-w-[300px] relative transition-all hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer">
            {/* The Top Colored Strip */}
            <div
                className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-xl ${config.bg}`}
            />

            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-2.5 h-2.5 bg-gray-800 border-none"
                style={{ left: -5 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-2.5 h-2.5 bg-gray-800 border-none"
                style={{ right: -5 }}
            />

            {/* Priority indicator (from your original code) */}
            {data.priority && (
                <div
                    className={`absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold text-white shadow-sm ${
                        data.priority === "high"
                            ? "bg-red-500"
                            : data.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                    }`}
                >
                    {data.priority}
                </div>
            )}

            {/* Hover Time Bubble */}
            <div
                className={`absolute -top-7 -right-7 w-12 h-12 bg-white rounded-full border-[3px] shadow-md flex flex-col items-center justify-center z-10 transition-all duration-300 ease-out opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 ${config.border}`}
            >
                <span
                    className={`text-sm font-bold leading-none mt-0.5 ${config.text}`}
                >
                    {elapsed.value}
                </span>
                <span
                    className={`text-[10px] font-medium leading-tight ${config.text}`}
                >
                    {elapsed.label}
                </span>
            </div>

            {/* Main Card Content */}
            <div className="p-4 pt-5 flex flex-col gap-3">
                {/* Meta Grid: Assigned To & Status */}
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm items-center">
                    <span className="text-gray-500 font-medium">
                        Assigned to
                    </span>
                    <span className="text-right text-gray-800 font-medium truncate">
                        {data.assignedTo || "Unassigned"}
                    </span>

                    <span className="text-gray-500 font-medium">Status</span>
                    <span
                        className={`text-right font-medium flex items-center justify-end gap-1.5 ${config.text}`}
                    >
                        {config.icon}
                        <span className="capitalize">{currentStatus}</span>
                    </span>
                </div>

                {/* Subtitle Divider */}
                <div className="w-full h-px bg-gray-100 my-1" />

                {/* Task Information */}
                <div className="flex flex-col gap-1 group-hover:text-blue-600 transition-colors">
                    <h3 className="text-lg font-bold text-slate-800 leading-snug">
                        {data.task || "Untitled Task"}
                    </h3>

                    {data.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-0.5">
                            {data.description}
                        </p>
                    )}
                </div>

                {/* Footer: Due Date */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 font-medium">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>Due: {formatDeadline(data.deadline)}</span>
                </div>

                {/* Progress bar (from your original code, modernized) */}
                {data.status !== "completed" && data.deadline && (
                    <div className="mt-1">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                            <span>Time Elapsed</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                            <motion.div
                                className={`h-2 rounded-full ${
                                    progress > 90
                                        ? "bg-red-500"
                                        : progress > 70
                                          ? "bg-amber-400"
                                          : "bg-green-500"
                                }`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* Comments indicator (from your original code) */}
                {data.comments && data.comments.length > 0 && (
                    <div className="text-xs text-gray-500 font-medium flex items-center mt-1">
                        <FaComment className="mr-1.5 text-gray-400" />
                        <span>
                            {data.comments.length} comment
                            {data.comments.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(RectangularNode);

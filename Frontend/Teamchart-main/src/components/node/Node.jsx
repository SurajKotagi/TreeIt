import React, { useState, useRef, useEffect } from "react";
import { Handle, Position } from "reactflow";
import ReactDOM from "react-dom";

import { FaTasks, FaUser } from "react-icons/fa";
import { FcOvertime } from "react-icons/fc";

export default function CircleNode({ data }) {
    const nodeRef = useRef(null);
    const timeoutRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [hoverPos, setHoverPos] = useState(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (nodeRef.current && nodeRef.current.contains(e.target)) {
                const rect = nodeRef.current.getBoundingClientRect();
                setHoverPos({
                    top: rect.top - 80,
                    left: rect.left + rect.width / 2,
                });
            } else {
                setHoverPos(null);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 400);
    };

    // Status-based gradient colors
    const statusGradient = {
        completed: "from-green-300 to-green-500",
        pending: "from-blue-300 to-blue-500",
        stuck: "from-red-300 to-red-500",
        default: "from-slate-200 to-slate-400",
    };

    const gradient = statusGradient[data.status] || statusGradient.default;

    const getRemainingTime = (deadline) => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end - now;
        if (diff <= 0) return "Past due";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const min = Math.floor((diff / (1000 * 60)) % 60);
        return `${days}d ${hours}h ${min}m`;
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={nodeRef}
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} 
          shadow-lg border border-gray-200 flex items-center justify-center 
          transition-all duration-300 hover:scale-110 hover:shadow-xl`}
            >
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        width: 10,
                        height: 10,
                        background: "black", // Tailwind emerald-500
                        border: "2px solid white",
                        borderRadius: "50%",
                        boxShadow: "0 0 4px white",
                    }}
                />
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        width: 10,
                        height: 10,
                        background: "white", // Tailwind indigo-500
                        border: "2px solid black",
                        borderRadius: "50%",
                        boxShadow: "0 0 4px white",
                    }}
                />
            </div>

            {isHovered &&
                hoverPos &&
                ReactDOM.createPortal(
                    <div
                        className="fixed z-[9999] pointer-events-none"
                        style={{
                            top: `${hoverPos.top + 75}px`,
                            left: `${hoverPos.left + 125}px`,
                            transform: "translate(-50%, -100%)",
                        }}
                    >
                        <div className="bg-white bg-opacity-90 text-gray-800 text-xs rounded-xl px-4 py-3 shadow-xl max-w-xs w-[240px] backdrop-blur-sm border border-gray-200 transition-opacity duration-200 animate-fadeIn">
                            <div className="flex items-start gap-2 mb-2">
                                <FaTasks className="text-yellow-500 mt-[1px]" />
                                <span>
                                    <strong>Task:</strong> {data.task}
                                </span>
                            </div>
                            <div className="flex items-start gap-2 mb-2">
                                <FaUser className="text-blue-500 mt-[1px]" />
                                <span>
                                    <strong>Assigned:</strong> {data.assignedTo}
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <FcOvertime className="mt-[1px]" />
                                <span>
                                    <strong>Remaining:</strong>{" "}
                                    {data.deadline
                                        ? getRemainingTime(data.deadline)
                                        : "None"}
                                </span>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

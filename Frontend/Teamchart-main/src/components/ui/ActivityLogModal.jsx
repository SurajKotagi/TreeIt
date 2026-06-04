import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaHistory, FaSyncAlt } from "react-icons/fa";
import api from "../utility/BaseAPI";

const ActivityLogModal = ({ isOpen, onClose, projectId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await api.get(`/logs/project/${projectId}`);
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch activity logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, projectId]);

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <FaHistory size={18} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Audit Trail
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchLogs}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="Refresh Logs"
                                >
                                    <FaSyncAlt className={loading ? "animate-spin" : ""} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 custom-scrollbar">
                            {loading && logs.length === 0 ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="flex flex-col justify-center items-center h-full text-gray-400">
                                    <FaHistory size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No activity yet</p>
                                    <p className="text-sm">Action logs will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {logs.map((log, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            key={log.logId}
                                            className="flex gap-4"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 z-10 shadow-sm ring-4 ring-white"></div>
                                                {index !== logs.length - 1 && (
                                                    <div className="w-px h-full bg-indigo-100 my-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="text-gray-700 text-sm leading-relaxed">
                                                        <span className="font-semibold text-gray-900">
                                                            {log.username}
                                                        </span>{" "}
                                                        {log.actionMessage}
                                                    </p>
                                                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md">
                                                        {formatTime(log.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActivityLogModal;

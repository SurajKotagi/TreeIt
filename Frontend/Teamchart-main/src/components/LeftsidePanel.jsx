import React, { useState, useEffect } from "react";
import api from "./utility/BaseAPI";
import { Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaFolderOpen,
    FaFolder,
    FaPlus,
    FaUserPlus,
    FaTrashAlt,
    FaSearch,
    FaTimes,
} from "react-icons/fa";

const LeftSidebar = ({
    projects = [],
    onAddProject,
    onSelectProject,
    selectedProjectId,
    setSelectedProjectId,
}) => {
    const username = localStorage.getItem("username") || "User";
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundType=gradientLinear&fontFamily=Trebuchet%20MS&fontSize=41`;

    const [isProjectOpen, setIsProjectOpen] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [avatar, setAvatar] = useState(defaultAvatar);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [candidateMembers, setCandidateMembers] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [modalProject, setModalProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all members when Add Members modal is opened
    useEffect(() => {
        const fetchAllMembers = async () => {
            try {
                const res = await api.get(`/members`);
                setAllMembers(res.data);
            } catch (error) {
                console.error("Error fetching members:", error);
                setAllMembers([]);
            }
        };

        if (modalProject) fetchAllMembers();
    }, [modalProject]);

    const availableCandidates = allMembers.filter(
        (member) => !modalProject?.members?.some((m) => m._id === member._id)
    );

    // Toggle menu visibility
    const toggleMenu = (pid) =>
        setMenuOpenId((prev) => (prev === pid ? null : pid));

    const onSelectProjectClick = (pid) => {
        onSelectProject(pid);
        setMenuOpenId(null);
    };

    const openAddMemberModal = async (project) => {
        setModalProject(project);

        const res = await api.get(`/projects/${selectedProjectId}/members`);

        // compute candidates not in project
        const currentIds = res.data?.map((m) => m.memberId) || [];
        const candidates = allMembers.filter(
            (m) => !currentIds.includes(m.memberId)
        );
        setCandidateMembers(candidates);
        setSelectedCandidates([]);
        setMenuOpenId(null);
    };

    const handleUpdateMembers = async () => {
        if (!modalProject) return;
        try {
            await api.put(`/projects/${modalProject.projectId}/add-members`, {
                memberIds: selectedCandidates,
            });

            // Use a toast notification instead of alert
            const toast = document.createElement("div");
            toast.className =
                "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn";
            toast.innerText = "Members updated successfully";
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add("animate-fadeOut");
                setTimeout(() => document.body.removeChild(toast), 500);
            }, 3000);

            setSelectedProjectId(null);
            setTimeout(() => setSelectedProjectId(modalProject.projectId), 0);
            setModalProject(null);
        } catch (err) {
            console.error(err);
            alert("Error updating members");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("Are you sure you want to delete this project?"))
            return;
        try {
            await api.delete(`/projects/${projectId}`);

            const toast = document.createElement("div");
            toast.className =
                "fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn";
            toast.innerText = "Project deleted successfully";
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add("animate-fadeOut");
                setTimeout(() => document.body.removeChild(toast), 500);
            }, 3000);

            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Error deleting project");
        }
    };

    return (
        <>
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-64 h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 px-4 py-6 fixed top-0 left-0 shadow-sm"
            >
                {/* User Profile */}
                <motion.div
                    className="flex items-center justify-between mb-6"
                    whileHover={{ scale: 1.02 }}
                >
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setIsProfileModalOpen(true)}
                    >
                        <motion.img
                            src={avatar}
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-md group-hover:shadow-blue-200"
                            whileHover={{ scale: 1.1 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                            }}
                        />
                        <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {username}
                        </span>
                    </div>
                </motion.div>

                {/* Folder toggle */}
                <motion.div
                    className="flex justify-between items-center mb-4 cursor-pointer bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                    whileHover={{ y: -2 }}
                    onClick={() => setIsProjectOpen((prev) => !prev)}
                >
                    <p className="text-md font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
                        {isProjectOpen ? (
                            <>
                                <FaFolderOpen className="text-blue-500" />{" "}
                                Projects
                            </>
                        ) : (
                            <>
                                <FaFolder className="text-blue-500" /> Open
                                Projects
                            </>
                        )}
                    </p>
                    <motion.span
                        animate={{ rotate: isProjectOpen ? 0 : -90 }}
                        transition={{ duration: 0.3 }}
                    >
                        ▼
                    </motion.span>
                </motion.div>

                {/* Projects list with transition */}
                <AnimatePresence>
                    {isProjectOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-y-auto pr-1 max-h-[calc(100vh-220px)] custom-scrollbar"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#CBD5E0 #F1F5F9",
                            }}
                        >
                            {projects.map((project) => {
                                const isSelected =
                                    project.projectId === selectedProjectId;
                                return (
                                    <motion.div
                                        key={project.projectId}
                                        className={`mb-3 rounded-2xl shadow-sm border ${
                                            isSelected
                                                ? "bg-blue-50 border-blue-300"
                                                : "bg-white border-gray-200"
                                        } overflow-hidden`}
                                        whileHover={{
                                            y: -2,
                                            boxShadow:
                                                "0 4px 6px rgba(0, 0, 0, 0.1)",
                                        }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex justify-between items-center px-4 py-3 hover:bg-blue-100 transition-colors duration-200">
                                            <button
                                                onClick={() =>
                                                    onSelectProjectClick(
                                                        project.projectId
                                                    )
                                                }
                                                className="text-left w-full font-semibold text-gray-800 truncate"
                                            >
                                                {project.name}
                                            </button>
                                            <motion.button
                                                className="ml-2 w-8 h-8 flex items-center justify-center hover:bg-blue-200 text-gray-700 rounded-full transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(
                                                        project.projectId
                                                    );
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                ⋮
                                            </motion.button>
                                        </div>

                                        <AnimatePresence>
                                            {menuOpenId ===
                                                project.projectId && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                    className="px-4 pb-3 text-sm text-gray-700 space-y-2 overflow-hidden"
                                                >
                                                    <motion.button
                                                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                                                        onClick={() =>
                                                            openAddMemberModal(
                                                                project
                                                            )
                                                        }
                                                        whileHover={{ x: 2 }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                        <FaUserPlus className="text-blue-500" />{" "}
                                                        Add Members
                                                    </motion.button>
                                                    <motion.button
                                                        className="w-full text-left py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                        onClick={() =>
                                                            handleDeleteProject(
                                                                project.projectId
                                                            )
                                                        }
                                                        whileHover={{ x: 2 }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                        <FaTrashAlt className="text-red-500" />{" "}
                                                        Delete Project
                                                    </motion.button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Project Button */}
                <motion.div
                    className="mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<FaPlus />}
                        sx={{
                            textTransform: "none",
                            bgcolor: "#3b82f6",
                            "&:hover": {
                                bgcolor: "#2563eb",
                            },
                            borderRadius: 2,
                            py: 1.2,
                            fontWeight: 600,
                            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
                        }}
                        onClick={onAddProject}
                    >
                        Create Project
                    </Button>
                </motion.div>
            </motion.div>

            {/* Add Members Modal */}
            <AnimatePresence>
                {modalProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{
                                type: "spring",
                                damping: 20,
                                stiffness: 300,
                            }}
                            className="bg-white p-6 rounded-2xl shadow-2xl w-96 max-w-full"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Add Members to{" "}
                                    <span className="text-blue-600">
                                        {modalProject.name}
                                    </span>
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setModalProject(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes size={18} />
                                </motion.button>
                            </div>

                            <div className="relative mb-5">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search by username"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                />
                            </div>

                            <div className="max-h-48 overflow-y-auto mb-5 space-y-2 custom-scrollbar pr-1">
                                {candidateMembers.length === 0 ? (
                                    <p className="text-center text-gray-500 italic py-4">
                                        No members available to add
                                    </p>
                                ) : (
                                    candidateMembers
                                        .filter((m) =>
                                            m.username
                                                .toLowerCase()
                                                .includes(
                                                    searchQuery.toLowerCase()
                                                )
                                        )
                                        .sort((a, b) =>
                                            a.username.localeCompare(b.username)
                                        )
                                        .map((m) => (
                                            <motion.label
                                                key={m.memberId}
                                                className="flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
                                                whileHover={{ y: -2 }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={m.memberId}
                                                    className="w-4 h-4 accent-blue-500"
                                                    onChange={(e) => {
                                                        const id = m.memberId;
                                                        setSelectedCandidates(
                                                            (prev) =>
                                                                e.target.checked
                                                                    ? [
                                                                          ...prev,
                                                                          id,
                                                                      ]
                                                                    : prev.filter(
                                                                          (x) =>
                                                                              x !==
                                                                              id
                                                                      )
                                                        );
                                                    }}
                                                />
                                                <span className="text-gray-700">
                                                    {m.username}
                                                </span>
                                            </motion.label>
                                        ))
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setModalProject(null)}
                                    className="px-4 py-2 rounded-xl text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleUpdateMembers}
                                    disabled={selectedCandidates.length === 0}
                                    className="px-4 py-2 rounded-xl text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-md disabled:shadow-none"
                                >
                                    Add {selectedCandidates.length}{" "}
                                    {selectedCandidates.length === 1
                                        ? "Member"
                                        : "Members"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Modal */}
            <AnimatePresence>
                {isProfileModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="bg-white p-8 rounded-2xl w-[90%] max-w-[500px] shadow-2xl relative"
                        >
                            <motion.button
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                                onClick={() => setIsProfileModalOpen(false)}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FaTimes size={20} />
                            </motion.button>

                            <motion.div
                                className="flex flex-col items-center mb-6"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <motion.img
                                    src={avatar}
                                    alt="Current Avatar"
                                    className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4 shadow-lg"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow:
                                            "0 0 0 4px rgba(59, 130, 246, 0.5)",
                                    }}
                                />
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                    {username}
                                </h2>
                                <p className="text-gray-500">
                                    {localStorage.getItem("email") ||
                                        "Email not set"}
                                </p>
                            </motion.div>

                            <motion.div
                                className="bg-gray-50 rounded-xl p-5 mb-6 shadow-inner"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-lg font-semibold mb-3 text-blue-600">
                                    Analytics
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <p className="text-gray-500 text-sm">
                                            Total Projects
                                        </p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {projects.length}
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <p className="text-gray-500 text-sm">
                                            Member ID
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {localStorage.getItem("memberId")}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="flex justify-end"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    Close
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add global style for animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out forwards;
                }
                .animate-fadeOut {
                    animation: fadeOut 0.3s ease-in-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a0aec0;
                }
            `}</style>
        </>
    );
};

export default LeftSidebar;

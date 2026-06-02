import React, { useState, useEffect } from "react";
import api from "./utility/BaseAPI";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaPlus,
    FaUserPlus,
    FaTrashAlt,
    FaSearch,
    FaTimes,
    FaLeaf,
    FaCog,
    FaQuestionCircle,
} from "react-icons/fa";
import Avatar from "boring-avatars";

const LeftSidebar = ({
    projects = [],
    onAddProject,
    onSelectProject,
    selectedProjectId,
    setSelectedProjectId,
}) => {
    const username = localStorage.getItem("username") || "User";

    const defaultAvatar = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${username}&backgroundColor=49de80,f77272,fabd23,3b82f6&eyes=closed,glasses,stars&mouth=lilSmile`;
    const [isProjectOpen, setIsProjectOpen] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [avatar, setAvatar] = useState(defaultAvatar);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [candidateMembers, setCandidateMembers] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [modalProject, setModalProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    useEffect(() => {
        if (isProfileModalOpen && username) {
            setLoadingAnalytics(true);
            api.get(`/members/${username}/analytics`)
                .then(res => setAnalytics(res.data))
                .catch(err => console.error("Failed to fetch analytics:", err))
                .finally(() => setLoadingAnalytics(false));
        }
    }, [isProfileModalOpen, username]);

    const availableCandidates = allMembers.filter(
        (member) => !modalProject?.members?.some((m) => m._id === member._id),
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
        setMenuOpenId(null); // Close the 3-dot dropdown immediately for a snappy UI

        try {
            // ✨ FIX: Use project.projectId instead of selectedProjectId!
            const [projectMembersRes, allMembersRes] = await Promise.all([
                api.get(`/projects/${project.projectId}/members`),
                api.get(`/members`),
            ]);

            const freshAllMembers = allMembersRes.data || [];
            setAllMembers(freshAllMembers); // Keep in state for backup

            // Compute candidates not in the project using the FRESH data
            const currentIds =
                projectMembersRes.data?.map((m) => m.memberId) || [];
            const candidates = freshAllMembers.filter(
                (m) => !currentIds.includes(m.memberId),
            );

            setCandidateMembers(candidates);
            setSelectedCandidates([]);
        } catch (error) {
            console.error("Failed to load members for modal", error);
            // Fallback in case of error
            setCandidateMembers([]);
        }
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
    // Array of soft colors for the project dots
    const dotColors = [
        "bg-red-400",
        "bg-amber-400",
        "bg-green-400",
        "bg-purple-400",
        "bg-blue-400",
        "bg-pink-400",
    ];

    // This picks a random color from your brand palette ONCE when the sidebar loads
    const [avatarColor] = useState(() => {
        const colors = ["#f77272", "#fabd23", "#49de80"];
        return colors[Math.floor(Math.random() * colors.length)];
    });

    return (
        <>
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-64 h-screen bg-[#fafafa] border-r border-gray-200 flex flex-col fixed top-0 left-0 font-poppins"
            >
                {/* 1. App Logo Header */}
                <div className="flex items-center gap-3 px-5 py-6">
                    {/* New Brand Logo (Concept D) */}
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <svg
                            viewBox="0 0 200 200"
                            className="w-full h-full drop-shadow-sm"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g strokeLinecap="round" strokeWidth="12">
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="100"
                                    y2="45"
                                    stroke="#3b82f6"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="139"
                                    y2="61"
                                    stroke="#49de80"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="155"
                                    y2="100"
                                    stroke="#49de80"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="100"
                                    y2="155"
                                    stroke="#c083fc"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="61"
                                    y2="139"
                                    stroke="#f77272"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="45"
                                    y2="100"
                                    stroke="#f77272"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="61"
                                    y2="61"
                                    stroke="#fabd23"
                                />
                            </g>
                            <circle cx="100" cy="45" r="14" fill="#3b82f6" />
                            <circle cx="139" cy="61" r="14" fill="#49de80" />
                            <circle cx="155" cy="100" r="14" fill="#49de80" />
                            <circle cx="100" cy="155" r="14" fill="#c083fc" />
                            <circle cx="61" cy="139" r="14" fill="#f77272" />
                            <circle cx="45" cy="100" r="14" fill="#f77272" />
                            <circle cx="61" cy="61" r="14" fill="#fabd23" />
                            <circle cx="100" cy="100" r="22" fill="#3b82f6" />
                        </svg>
                    </div>

                    {/* Project Name */}
                    <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                        Tree
                        <span className="text-[#1f2a38] font-black ml-1">
                            It
                        </span>
                    </h1>
                </div>

                {/* 2. User Profile Card */}
                <div className="px-4 mb-6">
                    <motion.div
                        className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm p-3 rounded-2xl cursor-pointer hover:border-[#fafafa]/30 transition-colors group"
                        onClick={() => setIsProfileModalOpen(true)}
                        whileHover={{ y: -1 }}
                    >
                        {/* Fun Emoji Avatar Container (Square with rounded corners) */}
                        <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm group-hover:border-[#fafafa] transition-colors">
                            <img
                                src={avatar}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex flex-col flex-1 overflow-hidden pr-2">
                            <span className="text-[16px] font-bold text-gray-900 leading-tight truncate group-hover:text-[#3b82f6] transition-colors">
                                {username}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Project Lead
                            </span>
                        </div>

                        <FaCog className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                    </motion.div>
                </div>

                {/* 3. Projects Section */}
                <div className="flex-grow flex flex-col overflow-hidden">
                    <div className="px-5 mb-2">
                        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Projects
                        </h2>
                    </div>

                    {/* Scrollable Project List */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar px-2">
                        {projects.map((project, index) => {
                            const isSelected =
                                project.projectId === selectedProjectId;
                            const dotColor =
                                dotColors[index % dotColors.length];

                            return (
                                <motion.div
                                    key={project.projectId}
                                    className="mb-0.5"
                                >
                                    <div
                                        // CHANGED: items-center is now items-start so the 3-dots stay near the top
                                        className={`flex items-start justify-between px-3 py-2 cursor-pointer rounded-r-lg transition-all duration-200 group ${
                                            isSelected
                                                ? "bg-blue-50/60 border-l-4 border-blue-600"
                                                : "border-l-4 border-transparent hover:bg-gray-100"
                                        }`}
                                        onClick={() =>
                                            onSelectProjectClick(
                                                project.projectId,
                                            )
                                        }
                                    >
                                        {/* CHANGED: items-center is now items-start, added flex-1 and pr-2 */}
                                        <div className="flex items-start gap-3 flex-1 pr-2">
                                            {/* CHANGED: Added mt-1.5 to push the dot down slightly to align with the first line of text */}
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dotColor}`}
                                            ></span>

                                            {/* CHANGED: Removed 'truncate', added 'leading-snug break-words' */}
                                            <span
                                                className={`text-sm leading-snug break-words ${isSelected ? "font-semibold text-blue-700" : "font-medium text-gray-600 group-hover:text-gray-800"}`}
                                            >
                                                {project.name}
                                            </span>
                                        </div>

                                        {/* Subtle 3-Dots Menu */}
                                        <button
                                            className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                                                isSelected
                                                    ? "text-blue-500 hover:bg-blue-100"
                                                    : "text-gray-400 hover:bg-gray-200 opacity-0 group-hover:opacity-100"
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(project.projectId);
                                            }}
                                        >
                                            ⋮
                                        </button>
                                    </div>

                                    {/* Project Actions Dropdown */}
                                    <AnimatePresence>
                                        {menuOpenId === project.projectId && (
                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="ml-6 mr-2 mt-1 mb-2 space-y-1 overflow-hidden"
                                            >
                                                <button
                                                    className="w-full text-left py-1.5 px-3 text-xs font-medium text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                                                    onClick={() =>
                                                        openAddMemberModal(
                                                            project,
                                                        )
                                                    }
                                                >
                                                    <FaUserPlus className="text-blue-500" />{" "}
                                                    Add Members
                                                </button>
                                                <button
                                                    className="w-full text-left py-1.5 px-3 text-xs font-medium text-red-500 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
                                                    onClick={() =>
                                                        handleDeleteProject(
                                                            project.projectId,
                                                        )
                                                    }
                                                >
                                                    <FaTrashAlt className="text-red-400" />{" "}
                                                    Delete Project
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}

                        {/* 4. Subtle Create Project Button */}
                        <div className="px-2 mt-2">
                            <button
                                onClick={onAddProject}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200"
                            >
                                <FaPlus className="text-xs opacity-70" />
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>

                {/* 5. Bottom Footer (Settings & Help) */}
                <div className="p-4 mt-auto border-t border-gray-200/60 bg-[#fafafa]">
                    <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200/50">
                            <FaCog /> Settings
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200/50">
                            <FaQuestionCircle /> Help
                        </button>
                    </div>
                </div>
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
                                                    searchQuery.toLowerCase(),
                                                ),
                                        )
                                        .sort((a, b) =>
                                            a.username.localeCompare(
                                                b.username,
                                            ),
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
                                                                              id,
                                                                      ),
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
                            className="bg-white p-8 rounded-2xl w-[90%] max-w-[700px] shadow-2xl relative"
                        >
                            <motion.button
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                                onClick={() => setIsProfileModalOpen(false)}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FaTimes size={20} />
                            </motion.button>

                            <div className="flex flex-col md:flex-row gap-8">
                                <motion.div
                                    className="flex flex-col items-center flex-shrink-0 md:w-1/3"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {/* Large Fun Emoji Avatar for Modal */}
                                    <div className="w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 shadow-lg mb-4">
                                        <img
                                            src={avatar}
                                            alt="Current Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
                                        {username}
                                    </h2>
                                    <p className="text-gray-500 text-sm text-center mb-4">
                                        {localStorage.getItem("email") ||
                                            "Email not set"}
                                    </p>
                                    
                                    <div className="w-full bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                                        <p className="text-xs text-blue-500 uppercase tracking-wider font-bold mb-1">Member ID</p>
                                        <p className="text-sm font-mono text-blue-800 truncate">{localStorage.getItem("memberId")}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex-grow flex flex-col"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                                        Performance Analytics
                                    </h3>
                                    
                                    {loadingAnalytics ? (
                                        <div className="flex-grow flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl shadow-sm border border-green-200 flex flex-col justify-center items-center">
                                                    <p className="text-green-700 text-sm font-semibold mb-1">Tasks Completed</p>
                                                    <p className="text-3xl font-black text-green-600">{analytics?.tasksCompleted || 0}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-4 rounded-xl shadow-sm border border-amber-200 flex flex-col justify-center items-center">
                                                    <p className="text-amber-700 text-sm font-semibold mb-1">Tasks Pending</p>
                                                    <p className="text-3xl font-black text-amber-600">{analytics?.tasksPending || 0}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-red-50 to-rose-100 p-4 rounded-xl shadow-sm border border-red-200 flex flex-col justify-center items-center">
                                                    <p className="text-red-700 text-sm font-semibold mb-1 text-center">Overdue / Long Pending</p>
                                                    <p className="text-3xl font-black text-red-600">{analytics?.tasksPendingForLong || 0}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-4 rounded-xl shadow-sm border border-indigo-200 flex flex-col justify-center items-center">
                                                    <p className="text-indigo-700 text-sm font-semibold mb-1">Total Projects</p>
                                                    <p className="text-3xl font-black text-indigo-600">{projects.length}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-2 shadow-inner">
                                                <h4 className="text-sm font-semibold text-gray-600 mb-3">Activity Heatmap (Last 14 Days)</h4>
                                                <div className="flex items-end justify-between h-20 gap-1">
                                                    {Array.from({ length: 14 }).map((_, i) => {
                                                        const d = new Date();
                                                        d.setDate(d.getDate() - (13 - i));
                                                        const dateStr = d.toISOString().split('T')[0];
                                                        const count = analytics?.activityHeatMap?.[dateStr] || 0;
                                                        
                                                        // Max height calc
                                                        const maxCount = Math.max(...Object.values(analytics?.activityHeatMap || {0:1}), 1);
                                                        const heightPercent = count > 0 ? Math.max((count / maxCount) * 100, 15) : 5;
                                                        
                                                        let colorClass = "bg-gray-200";
                                                        if (count > 0) colorClass = "bg-blue-300";
                                                        if (count > 2) colorClass = "bg-blue-500";
                                                        if (count > 5) colorClass = "bg-blue-700";

                                                        return (
                                                            <div key={i} className="flex flex-col items-center flex-1 group relative">
                                                                <div 
                                                                    className={`w-full rounded-t-sm ${colorClass} transition-all duration-300 group-hover:opacity-80`} 
                                                                    style={{ height: `${heightPercent}%` }}
                                                                ></div>
                                                                {/* Tooltip */}
                                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                                                    {count} tasks on {d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
                                                    <span>14 days ago</span>
                                                    <span>Today</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            <motion.div
                                className="flex justify-end mt-6 pt-4 border-t"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="bg-gray-800 text-white px-8 py-2.5 rounded-xl hover:bg-gray-900 transition-colors shadow-lg font-medium"
                                >
                                    Close Profile
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

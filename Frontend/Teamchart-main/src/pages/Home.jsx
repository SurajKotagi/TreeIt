import React, { useEffect, useState } from "react";
import api from "../components/utility/BaseAPI";
import ReactFlowProviderContent from "../components/GraphPage";
import LeftSidebar from "../components/LeftsidePanel";
import PageWrapper from "../components/ui/PageWrapper";
import { FaBars, FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import { useGlobalContext } from "../components/utility/SidebarSlide";
import {
    showError,
    showSuccess,
    showInfo,
} from "../components/utility/ToastNotofication";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
    const { openSidebar, isSidebarOpen } = useGlobalContext();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [nameError, setNameError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllMembers = async () => {
        try {
            const res = await api.get(`/members`);
            setAllMembers(res.data);
        } catch (error) {
            console.error("Error fetching members:", error);
            setAllMembers([]);
        }
    };

    useEffect(() => {
        if (isModalOpen) fetchAllMembers();
    }, [isModalOpen]);

    // Fetch projects from backend on mount with loading state
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            const memberId = localStorage.getItem("memberId");
            if (!memberId) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await api.get(`/projects/member/${memberId}`);
                setProjects(res.data);
                if (res.data.length > 0) {
                    setSelectedProjectId(
                        res.data[res.data.length - 1].projectId,
                    );
                }
            } catch (err) {
                console.error("Error fetching user projects", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const openCreateModal = () => {
        setIsModalOpen(true);
    };

    // Add new project to backend
    const handleAddProject = async (name) => {
        if (!newProjectName.trim()) {
            setNameError(true);
            showInfo("Project name is mandatory!");
            return;
        }
        setNameError(false);

        try {
            const memberId = localStorage.getItem("memberId");
            const response = await api.post(`/projects`, {
                name: name,
                memberId: memberId,
                memberIds: selectedMembers,
            });

            setProjects((prev) => [...prev, response.data]);
            setIsModalOpen(false);
            setNewProjectName("");
            setSelectedMembers([]);
            setSelectedProjectId(response.data.projectId);
            showSuccess("Project created successfully!");
        } catch (err) {
            showInfo(
                "Please select at least one member before creating project",
            );
        }
    };

    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[projects.length - 1].projectId);
        }
    }, [projects, selectedProjectId]);

    const handleSelectProject = (projectId) => {
        setSelectedProjectId(projectId);
    };

    return (
        <PageWrapper>
            <div className="font-poppins h-screen overflow-hidden bg-[#fafafa]">
                {/* 1. Sidebar - Unchanged */}
                <LeftSidebar
                    projects={projects}
                    onAddProject={openCreateModal}
                    onSelectProject={handleSelectProject}
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                />

                {/* 3. The Full-Screen Graph Canvas */}
                <motion.div
                    className={`h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <motion.div
                                className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                        </div>
                    ) : (
                        <ReactFlowProviderContent
                            selectedProjectId={selectedProjectId}
                        />
                    )}
                </motion.div>

                {/* 4. Create Project Modal - Keeping your exact logic, just slightly modernized UI */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsModalOpen(false)}
                        >
                            <motion.div
                                className="bg-white w-full max-w-md p-7 rounded-2xl shadow-2xl border border-gray-100"
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                        Create New Project
                                    </h2>

                                    <motion.button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
                                        whileHover={{ rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FaTimes size={14} />
                                    </motion.button>
                                </div>

                                {/* Project Name Input */}
                                <div className="mb-5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Q3 Marketing Campaign"
                                        value={newProjectName}
                                        onChange={(e) => {
                                            setNewProjectName(e.target.value);
                                            if (nameError) setNameError(false);
                                        }}
                                        className={`w-full rounded-xl px-4 py-3 bg-gray-50 border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm ${
                                            nameError
                                                ? "border-red-400 bg-red-50"
                                                : "border-gray-200"
                                        }`}
                                    />
                                    {nameError && (
                                        <motion.p
                                            className="text-red-500 text-xs mt-1.5 pl-1 font-medium"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            Project name is required.
                                        </motion.p>
                                    )}
                                </div>

                                {/* Search Members */}
                                <div className="mb-3 relative">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                        Add Team Members
                                    </label>
                                    <FaSearch className="absolute left-3.5 top-[38px] text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by username..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full rounded-xl pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                {/* Member List */}
                                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl p-2 mb-6 bg-white shadow-inner custom-scrollbar pr-1">
                                    {allMembers
                                        .filter(
                                            (m) =>
                                                m.memberId !==
                                                localStorage.getItem(
                                                    "memberId",
                                                ),
                                        )
                                        .filter((m) =>
                                            m.username
                                                .toLowerCase()
                                                .includes(
                                                    searchTerm.toLowerCase(),
                                                ),
                                        )
                                        .sort((a, b) =>
                                            a.username.localeCompare(
                                                b.username,
                                            ),
                                        )
                                        .map((member) => (
                                            <label
                                                key={member.memberId}
                                                className="flex items-center cursor-pointer p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={member.memberId}
                                                    checked={selectedMembers.includes(
                                                        member.memberId,
                                                    )}
                                                    onChange={() => {
                                                        const id =
                                                            member.memberId;
                                                        setSelectedMembers(
                                                            (prev) =>
                                                                prev.includes(
                                                                    id,
                                                                )
                                                                    ? prev.filter(
                                                                          (x) =>
                                                                              x !==
                                                                              id,
                                                                      )
                                                                    : [
                                                                          ...prev,
                                                                          id,
                                                                      ],
                                                        );
                                                    }}
                                                    className="mr-3 accent-blue-500 h-4 w-4 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 font-medium group-hover:text-blue-700 transition-colors">
                                                    {member.username}
                                                </span>
                                            </label>
                                        ))}
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                    <motion.button
                                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
                                        onClick={() => setIsModalOpen(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Cancel
                                    </motion.button>

                                    <motion.button
                                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
                                        onClick={() =>
                                            handleAddProject(newProjectName)
                                        }
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FaPlus size={12} />
                                        Create Project
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

export default Home;

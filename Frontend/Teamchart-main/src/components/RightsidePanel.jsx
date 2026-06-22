import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
    FaSave,
    FaDownload,
    FaPlus,
    FaRegLightbulb,
    FaChevronRight,
    FaUsers, // ✨ NEW
    FaTimes, // ✨ NEW
    FaTasks, // ✨ NEW
} from "react-icons/fa";
import CustomDropdown from "../components/ui/CustomDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { forwardRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import api from "../components/utility/BaseAPI"; // ✨ NEW: Adjust path if necessary
import Avatar from "boring-avatars"; // ✨ NEW

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
    isOpen,
    closePanel,
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

    // ✨ NEW: State for Team Workload Modal
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTasks, setMemberTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    // ✨ NEW: Fetch and group member tasks
    const handleMemberClick = async (member) => {
        setSelectedMember(member);
        setIsLoadingTasks(true);
        try {
            // ⚠️ Ensure this endpoint exists in your Spring Boot backend!
            // It should return an array of tasks with their associated project names
            const res = await api.get(
                `/members/${member.username}/tasks/incomplete`,
            );
            setMemberTasks(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            setMemberTasks([]);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    // ✨ NEW: Group tasks by project name for the UI
    const groupedTasks = memberTasks.reduce((acc, task) => {
        const pName = task.projectName || "Other Tasks";
        if (!acc[pName]) acc[pName] = [];
        acc[pName].push(task);
        return acc;
    }, {});

    return (
        <AnimatePresence>
            {isOpen && (
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
                            onClick={closePanel}
                            className="absolute top-4 left-[-1.5rem] bg-white border border-gray-200 p-2 rounded-full shadow-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </button>

                        {/* Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Node{" "}
                                <span className="text-gray-800">Details</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Configure your task parameters
                            </p>
                        </div>

                        {/* Form Inputs (Tailwind Styled) */}
                        {/* CHANGED: Added px-1 to give the focus rings horizontal room to expand without getting clipped! */}
                        <div className="flex flex-col gap-4 flex-grow overflow-y-auto px-1 pr-3 custom-scrollbar">
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
                                    scale: 1.01,
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

                            {/* ✨ NEW: View Team Workload Button */}
                            <motion.button
                                onClick={() => setIsTeamModalOpen(true)}
                                whileHover={{
                                    scale: 1.01,
                                    backgroundColor: "#f8fafc",
                                }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-start pl-6 gap-3 bg-white border border-blue-200 text-blue-600 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md mt-2 group"
                            >
                                <FaUsers className="text-blue-500 group-hover:text-blue-600" />
                                <span className="text-[14px] tracking-wide">
                                    Team Workload
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
            {/* ✨ NEW: Team Workload Split Modal */}
            <AnimatePresence>
                {isTeamModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[75vh] flex overflow-hidden border border-gray-200 relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsTeamModalOpen(false)}
                                className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-colors"
                            >
                                <FaTimes size={14} />
                            </button>

                            {/* LEFT PANE: Member List */}
                            <div className="w-1/3 bg-gray-50 flex flex-col border-r border-gray-200">
                                <div className="px-5 py-4 border-b border-gray-200 bg-white shadow-sm z-10">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        <FaUsers className="text-blue-500" />{" "}
                                        Project Team
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Select a member to view pending tasks
                                    </p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                                    {projectMembers &&
                                    projectMembers.length > 0 ? (
                                        projectMembers.map((member) => (
                                            <button
                                                key={
                                                    member.memberId ||
                                                    member._id
                                                }
                                                onClick={() =>
                                                    handleMemberClick(member)
                                                }
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                                    selectedMember?.username ===
                                                    member.username
                                                        ? "bg-blue-100 border border-blue-200 shadow-sm"
                                                        : "bg-transparent border border-transparent hover:bg-gray-100"
                                                }`}
                                            >
                                                {/* ✨ UPDATED: Left Pane Avatar with Cloudinary support */}
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white">
                                                    {member.avatarUrl ? (
                                                        <img
                                                            src={
                                                                member.avatarUrl
                                                            }
                                                            alt={
                                                                member.username
                                                            }
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            size={32}
                                                            name={
                                                                member.username
                                                            }
                                                            variant="beam"
                                                            colors={[
                                                                "#f77272",
                                                                "#fabd23",
                                                                "#49de80",
                                                                "#3b82f6",
                                                                "#c083fc",
                                                            ]}
                                                        />
                                                    )}
                                                </div>
                                                <span
                                                    className={`font-semibold text-sm ${selectedMember?.username === member.username ? "text-blue-700" : "text-gray-700"}`}
                                                >
                                                    {member.username}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-gray-400 mt-10 italic">
                                            No members assigned.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT PANE: Analytics & Tasks */}
                            <div className="w-2/3 bg-white flex flex-col">
                                {!selectedMember ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                        <FaTasks
                                            size={48}
                                            className="mb-4 opacity-20"
                                        />
                                        <p className="text-sm font-medium">
                                            Select a team member to view their
                                            universal workload.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Right Pane Header */}
                                        <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                                                    {selectedMember.username}'s
                                                    Workload
                                                </h2>
                                                <p className="text-sm text-red-500 font-semibold mt-1">
                                                    Showing all incomplete tasks
                                                </p>
                                            </div>
                                            {/* ✨ UPDATED: Right Pane Header Avatar with Cloudinary support */}
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-white">
                                                {selectedMember.avatarUrl ? (
                                                    <img
                                                        src={
                                                            selectedMember.avatarUrl
                                                        }
                                                        alt={
                                                            selectedMember.username
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : memberTasks.length > 0 &&
                                                  memberTasks[0].avatarUrl ? (
                                                    <img
                                                        src={
                                                            memberTasks[0]
                                                                .avatarUrl
                                                        }
                                                        alt={
                                                            selectedMember.username
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Avatar
                                                        size={48}
                                                        name={
                                                            selectedMember.username
                                                        }
                                                        variant="beam"
                                                        colors={[
                                                            "#f77272",
                                                            "#fabd23",
                                                            "#49de80",
                                                            "#3b82f6",
                                                            "#c083fc",
                                                        ]}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Task List */}
                                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-gray-50/30">
                                            {isLoadingTasks ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                </div>
                                            ) : Object.keys(groupedTasks)
                                                  .length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-green-500">
                                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                                                        <FaRegLightbulb
                                                            size={24}
                                                        />
                                                    </div>
                                                    <p className="text-sm font-bold">
                                                        Awesome! No pending
                                                        tasks.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {Object.entries(
                                                        groupedTasks,
                                                    ).map(
                                                        ([
                                                            projectName,
                                                            tasks,
                                                        ]) => (
                                                            <div
                                                                key={
                                                                    projectName
                                                                }
                                                                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                                                            >
                                                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                        Project:{" "}
                                                                        <span className="text-gray-800">
                                                                            {
                                                                                projectName
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                                <ul className="divide-y divide-gray-100">
                                                                    {tasks.map(
                                                                        (
                                                                            task,
                                                                            idx,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                                            >
                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                    {
                                                                                        task.task
                                                                                    }
                                                                                </span>
                                                                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                                                                                    {task.status ||
                                                                                        "Pending"}
                                                                                </span>
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

export default RightsidePanel;

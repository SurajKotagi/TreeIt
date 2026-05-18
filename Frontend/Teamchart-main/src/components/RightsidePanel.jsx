import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Button, Tooltip, Zoom } from "@mui/material";
import { BiSolidDockLeft } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaSave, FaDownload, FaPlus, FaRegLightbulb } from "react-icons/fa";

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
    const [activateInput, setActivateInput] = useState(false);
    const [showTip, setShowTip] = useState(false);

    // Tips for better workflow
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
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 z-40 h-screen"
                >
                    <motion.div
                        className="relative flex flex-col w-72 h-full px-5 py-6 bg-white shadow-xl border-l border-gray-200 rounded-l-xl"
                        whileHover={{
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                    >
                        {/* Close Button with tooltip */}
                        <Tooltip
                            title="Close Panel"
                            placement="left"
                            TransitionComponent={Zoom}
                        >
                            <motion.button
                                onClick={closeSidebar}
                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                                whileHover={{
                                    rotate: 180,
                                    backgroundColor: "#EEF2FF",
                                }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <BiSolidDockLeft className="w-5 h-5" />
                            </motion.button>
                        </Tooltip>

                        {/* Title with animation */}
                        <motion.h2
                            className="text-2xl font-bold text-gray-800 mb-2"
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Node <span className="text-blue-500">Details</span>
                        </motion.h2>
                        <motion.p
                            className="text-sm text-gray-400 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Enter task and deadline info
                        </motion.p>
                        <motion.hr
                            className="mb-4 border-gray-200"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* Content Wrapper */}
                        <div className="flex flex-col justify-between h-full">
                            {/* Node Creation Form with animations */}
                            <div className="space-y-4 flex-grow">
                                {/* Task */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    onFocus={() => setActivateInput(true)}
                                >
                                    <TextField
                                        label="Task"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        placeholder="Enter task title"
                                        value={newNodeInput.task}
                                        onChange={(e) =>
                                            setNewNodeInput((prev) => ({
                                                ...prev,
                                                task: e.target.value,
                                            }))
                                        }
                                        sx={{
                                            backgroundColor: "#f9f9f9",
                                            borderRadius: 2,
                                            "& .MuiOutlinedInput-root": {
                                                "&:hover fieldset": {
                                                    borderColor: "#3b82f6",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#3b82f6",
                                                    boxShadow:
                                                        "0 0 0 4px rgba(59, 130, 246, 0.1)",
                                                },
                                            },
                                        }}
                                    />
                                </motion.div>

                                {/* Description */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <TextField
                                        label="Description"
                                        variant="outlined"
                                        multiline
                                        minRows={2}
                                        maxRows={5}
                                        fullWidth
                                        value={description}
                                        placeholder="Optional notes..."
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        sx={{
                                            backgroundColor: "#f9f9f9",
                                            borderRadius: 2,
                                            "& .MuiOutlinedInput-root": {
                                                "&:hover fieldset": {
                                                    borderColor: "#3b82f6",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#3b82f6",
                                                    boxShadow:
                                                        "0 0 0 4px rgba(59, 130, 246, 0.1)",
                                                },
                                            },
                                        }}
                                    />
                                </motion.div>

                                {/* Assignee */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <FormControl
                                        fullWidth
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                                backgroundColor: "#f9f9f9",
                                                "&:hover fieldset": {
                                                    borderColor: "#3b82f6",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#3b82f6",
                                                    boxShadow:
                                                        "0 0 0 4px rgba(59, 130, 246, 0.1)",
                                                },
                                            },
                                        }}
                                    >
                                        <InputLabel id="assignTo-label">
                                            Assign To
                                        </InputLabel>
                                        <Select
                                            labelId="assignTo-label"
                                            value={newNodeInput.assignedTo}
                                            label="Assign To"
                                            onChange={(e) =>
                                                setNewNodeInput((prev) => ({
                                                    ...prev,
                                                    assignedTo: e.target.value,
                                                }))
                                            }
                                        >
                                            {projectMembers.map((member) => (
                                                <MenuItem
                                                    key={member.memberId}
                                                    value={member.username}
                                                >
                                                    {member.username}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </motion.div>

                                {/* Deadline */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <LocalizationProvider
                                        dateAdapter={AdapterDateFns}
                                    >
                                        <DateTimePicker
                                            label="Deadline"
                                            value={
                                                new Date(newNodeInput.deadline)
                                            }
                                            minDateTime={new Date()}
                                            onChange={(newValue) =>
                                                setNewNodeInput((prev) => ({
                                                    ...prev,
                                                    deadline:
                                                        newValue.toISOString(),
                                                }))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        backgroundColor:
                                                            "#f9f9f9",
                                                        borderRadius: 2,
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                "&:hover fieldset":
                                                                    {
                                                                        borderColor:
                                                                            "#3b82f6",
                                                                    },
                                                                "&.Mui-focused fieldset":
                                                                    {
                                                                        borderColor:
                                                                            "#3b82f6",
                                                                        boxShadow:
                                                                            "0 0 0 4px rgba(59, 130, 246, 0.1)",
                                                                    },
                                                            },
                                                    }}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </motion.div>

                                {/* Pro tip section */}
                                <AnimatePresence>
                                    {showTip && (
                                        <motion.div
                                            className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex items-start gap-2">
                                                <FaRegLightbulb className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-blue-700">
                                                    {randomTip}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Button section */}
                            <div className="space-y-4 mt-auto pt-4">
                                {/* Create Button */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<FaPlus />}
                                        sx={{
                                            textTransform: "none",
                                            bgcolor: "#3b82f6", // Tailwind blue-500
                                            "&:hover": {
                                                bgcolor: "#2563eb", // Tailwind blue-600
                                            },
                                            borderRadius: 2,
                                            py: 1.2,
                                            fontWeight: 600,
                                            boxShadow:
                                                "0 4px 6px rgba(59, 130, 246, 0.2)",
                                        }}
                                        onClick={handleCreateNode}
                                        onMouseEnter={() => setShowTip(true)}
                                        onMouseLeave={() => setShowTip(false)}
                                    >
                                        Create Node
                                    </Button>
                                </motion.div>

                                {/* Save & Download Buttons */}
                                <motion.div
                                    className="flex gap-3"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <motion.div
                                        className="w-1/2"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Tooltip
                                            title="Save Flow Chart"
                                            placement="top"
                                            TransitionComponent={Zoom}
                                        >
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<FaSave />}
                                                sx={{
                                                    textTransform: "none",
                                                    borderRadius: 2,
                                                    borderColor: "#3b82f6",
                                                    color: "#3b82f6",
                                                    "&:hover": {
                                                        borderColor: "#2563eb",
                                                        backgroundColor:
                                                            "rgba(59, 130, 246, 0.1)",
                                                    },
                                                    boxShadow:
                                                        "0 2px 4px rgba(0, 0, 0, 0.05)",
                                                }}
                                                onClick={saveGraph}
                                            >
                                                Save
                                            </Button>
                                        </Tooltip>
                                    </motion.div>

                                    <motion.div
                                        className="w-1/2"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Tooltip
                                            title="Download as Image"
                                            placement="top"
                                            TransitionComponent={Zoom}
                                        >
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<FaDownload />}
                                                sx={{
                                                    textTransform: "none",
                                                    borderRadius: 2,
                                                    borderColor: "#3b82f6",
                                                    color: "#3b82f6",
                                                    "&:hover": {
                                                        borderColor: "#2563eb",
                                                        backgroundColor:
                                                            "rgba(59, 130, 246, 0.1)",
                                                    },
                                                    boxShadow:
                                                        "0 2px 4px rgba(0, 0, 0, 0.05)",
                                                }}
                                                onClick={handleDownload}
                                            >
                                                Download
                                            </Button>
                                        </Tooltip>
                                    </motion.div>
                                </motion.div>

                                {/* Version indicator */}
                                <motion.div
                                    className="text-center mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.7 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <span className="text-xs text-gray-400">
                                        TeamManager Flow v1.2
                                    </span>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RightsidePanel;

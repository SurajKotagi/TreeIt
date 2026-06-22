import React, {
    useCallback,
    useState,
    useEffect,
    useRef,
    useMemo,
} from "react";
import Avatar from "boring-avatars";
import { useViewport } from "reactflow";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { FaLocationArrow } from "react-icons/fa"; // Using this as the cursor pointer!
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    updateEdge,
    useReactFlow,
    getRectOfNodes,
    getTransformForBounds,
    MarkerType,
    getBezierPath,
    Panel,
} from "reactflow";

import CircleNode from "./node/Node";
import RightsidePanel from "./RightsidePanel";
import NodeProperties from "./node/NodeRightClick";
import Nodecard from "./node/Nodecard";
import RectangularNode from "./node/RectangularNode";

import { v4 as uuidv4 } from "uuid";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";

import api from "./utility/BaseAPI";
import { useGlobalContext } from "./utility/SidebarSlide";
import { showError, showSuccess, showLog } from "./utility/ToastNotofication";
import ActivityLogModal from "./ui/ActivityLogModal";

import "reactflow/dist/style.css";
import "react-quill/dist/quill.snow.css";
import { FaBars } from "react-icons/fa";
import {
    FaSave,
    FaDownload,
    FaCheckCircle,
    FaSignOutAlt,
    FaChevronLeft,
    FaHistory,
} from "react-icons/fa"; // Ensure these are imported!

const imageWidth = 1024;
const imageHeight = 768;
const nodeTypes = {
    circle: CircleNode,
    card: RectangularNode,
};

function downloadImage(dataUrl) {
    const a = document.createElement("a");
    a.setAttribute("download", "flowchart.png");
    a.setAttribute("href", dataUrl);
    a.click();
}

const Content = ({ selectedProjectId, projectName }) => {
    const { getNodes } = useReactFlow();
    const ref = useRef(null);

    // States
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [id, setId] = useState(0);
    const [projectMembers, setProjectMembers] = useState([]);
    const { isSidebarOpen, closeSidebar, openSidebar } = useGlobalContext();
    const [selectedNode, setSelectedNode] = useState(null);
    const [newNodeInput, setNewNodeInput] = useState({
        id: "",
        task: "",
        assignedTo: "",
        deadline: new Date(),
        color: "#ffffff",
    });
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [nodeId, setNodeId] = useState();
    const [nodeName, setNodeName] = useState();
    const [nodeDescription, setNodeDescription] = useState("");
    const [description, setDescription] = useState("");
    const [nodeColor, setNodeColor] = useState("#ffffff");
    const [isCompleted, setIsCompleted] = useState(false);
    const [status, setStatus] = useState("");
    const [stuckReason, setStuckReason] = useState("");
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const edgeUpdateSuccessful = useRef(true);
    const [showModal, setShowModal] = useState(false);
    const [menu, setMenu] = useState(null);
    const [todos, setTodos] = useState([]);
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("Saved"); // "Save", "Saving...", "Saved"
    // ✨ ADD THIS NEW STATE: Acts as a lock to prevent bad saves
    const [isFetchingGraph, setIsFetchingGraph] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    // ✨ LIVE CURSOR STATES ✨
    const [cursors, setCursors] = useState({});
    const stompClient = useRef(null);
    const viewport = useViewport(); // Gets current pan/zoom so cursors stick to the canvas
    const lastMouseUpdate = useRef(0);

    // Pick a random cursor color for this user once
    const [myCursorColor] = useState(() => {
        const colors = ["#f77272", "#fabd23", "#49de80", "#3b82f6", "#c083fc"];
        return colors[Math.floor(Math.random() * colors.length)];
    });

    // ✨ NEW: Combine local user and remote users into one active list
    const activeUsers = useMemo(() => {
        const localUser = {
            username: localStorage.getItem("username"),
            avatarUrl: localStorage.getItem("customAvatar"),
            color: myCursorColor,
        };

        const remoteUsers = Object.values(cursors).filter(
            (u) => u.username !== localUser.username,
        );

        return [localUser, ...remoteUsers];
    }, [cursors, myCursorColor]);

    // 1. Establish WebSocket Connection & Handle "Leave" Signals
    useEffect(() => {
        if (!selectedProjectId) return;

        const BACKEND_URL =
            process.env.REACT_APP_API_URL ||
            "https://your-backend-name.onrender.com"; // Use your actual URL
        const socket = new SockJS(`${BACKEND_URL}/ws`);

        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(
                    `/topic/cursors/${selectedProjectId}`,
                    (message) => {
                        const data = JSON.parse(message.body);
                        const currentUsername =
                            localStorage.getItem("username");

                        if (data.username !== currentUsername) {
                            // ✨ NEW: If the user left, delete them from the state
                            if (data.type === "LEAVE") {
                                setCursors((prev) => {
                                    const newCursors = { ...prev };
                                    delete newCursors[data.username];
                                    return newCursors;
                                });
                            } else {
                                // Otherwise, update their position and add a timestamp for the garbage collector
                                setCursors((prev) => ({
                                    ...prev,
                                    [data.username]: {
                                        ...data,
                                        lastUpdate: Date.now(),
                                    },
                                }));
                            }
                        }
                    },
                );
            },
        });

        client.activate();
        stompClient.current = client;

        // ✨ NEW: Cleanup function when user switches projects or unmounts
        return () => {
            if (client.connected) {
                // Broadcast that this user is leaving before severing the connection
                client.publish({
                    destination: `/app/cursor.move/${selectedProjectId}`,
                    body: JSON.stringify({
                        username: localStorage.getItem("username"),
                        type: "LEAVE",
                    }),
                });
            }
            client.deactivate();
        };
    }, [selectedProjectId]);

    // 2. Capture and Broadcast Mouse Movement
    const handleMouseMove = useCallback(
        (e) => {
            if (!stompClient.current?.connected || !reactFlowInstance) return;

            // Throttle updates to ~20 frames per second to save bandwidth
            const now = Date.now();
            if (now - lastMouseUpdate.current < 50) return;
            lastMouseUpdate.current = now;

            // Convert the raw screen pixels into React Flow's graph coordinates
            const position = reactFlowInstance.screenToFlowPosition({
                x: e.clientX,
                y: e.clientY,
            });

            stompClient.current.publish({
                destination: `/app/cursor.move/${selectedProjectId}`,
                body: JSON.stringify({
                    username: localStorage.getItem("username"),
                    x: position.x,
                    y: position.y,
                    color: myCursorColor,
                    avatarUrl: localStorage.getItem("customAvatar") || "",
                    type: "MOVE", // ✨ ADDED THIS LINE
                }),
            });
        },
        [reactFlowInstance, selectedProjectId, myCursorColor],
    );

    // Activity Log Handler
    const logActivity = async (actionMessage) => {
        if (!selectedProjectId) return;
        const currentUsername = localStorage.getItem("username") || "User";
        try {
            await api.post("/logs/", {
                projectId: selectedProjectId,
                username: currentUsername,
                actionMessage,
            });
            showLog(`${currentUsername} ${actionMessage}`);
        } catch (error) {
            console.error("Failed to log activity", error);
        }
    };

    // Handle user sign out
    const handleSignOut = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.clear(); // Clears memberId, username, etc.
            window.location.href = "/"; // Redirects to your login page (change to "/login" if needed)
        }
    };

    // ✨ NEW: The Garbage Collector (Removes ghost cursors after 10 seconds of inactivity)
    useEffect(() => {
        const sweepInterval = setInterval(() => {
            const now = Date.now();
            setCursors((prev) => {
                let hasChanges = false;
                const activeCursors = { ...prev };

                for (const username in activeCursors) {
                    // If we haven't received a signal from this user in 10 seconds, remove them
                    if (now - activeCursors[username].lastUpdate > 10000) {
                        delete activeCursors[username];
                        hasChanges = true;
                    }
                }

                return hasChanges ? activeCursors : prev;
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(sweepInterval);
    }, []);

    // ✨ NEW: The Autosave Engine
    useEffect(() => {
        // 1. Skip if no project, empty graph, OR if we are currently transitioning/fetching
        if (!selectedProjectId || nodes.length === 0 || isFetchingGraph) return;

        // 2. Double Security Check: Ensure we don't accidentally save Project A's nodes into Project B
        const currentProjectNodes = nodes.filter(
            (n) => `${n.data.projectId}` === `${selectedProjectId}`,
        );
        if (currentProjectNodes.length !== nodes.length) return;

        setSaveStatus("Unsaved");

        const autoSaveTimer = setTimeout(async () => {
            setIsAutosaving(true);
            setSaveStatus("Saving...");

            try {
                // 3. Save ONLY the nodes verified for this project
                await saveGraphNoAlert(currentProjectNodes, edges);
                setSaveStatus("Saved");
            } catch (error) {
                console.error("Autosave failed", error);
                setSaveStatus("Error");
            } finally {
                setIsAutosaving(false);
            }
        }, 1500);

        return () => clearTimeout(autoSaveTimer);
    }, [nodes, edges, selectedProjectId, isFetchingGraph]);

    // Fetch project members when project changes
    useEffect(() => {
        const fetchProjectMembers = async () => {
            if (!selectedProjectId) return;
            try {
                const res = await api.get(
                    `/projects/${selectedProjectId}/members`,
                );
                setProjectMembers(res.data);
            } catch (err) {
                console.error("Failed to fetch project members:", err);
            }
        };
        fetchProjectMembers();
    }, [selectedProjectId]);

    // Load graph data when project changes
    useEffect(() => {
        const fetchGraphData = async () => {
            if (!selectedProjectId) return;

            // 1. LOCK AUTOSAVE & CLEAR OLD DATA
            setIsFetchingGraph(true);
            setNodes([]);
            setEdges([]);

            try {
                const res = await api.get(`/load/${selectedProjectId}`);

                const backendNodes = res.data.nodes.map((node) => ({
                    id: node.graphNodeId.toString(),
                    position: { x: node.posX, y: node.posY },
                    type: node.type || "card",
                    data: {
                        projectId: node.projectId,
                        task: node.task,
                        assignedTo: node.assignedTo,
                        assignedBy: node.assignedBy,
                        creatorId: node.creatorId,
                        createdTime: node.createdTime,
                        deadline: node.deadline,
                        status: node.status,
                        stuckReason: node.stuckReason,
                        description: node.description,
                        // ✨ NEW: Load the saved time metrics from the backend
                        accumulatedTimeMs: node.accumulatedTimeMs || 0,
                        lastActivatedAt: node.lastActivatedAt || null,
                    },
                }));

                const backendEdges = res.data.edges.map((edge) => ({
                    id:
                        edge.graphEdgeId?.toString() ||
                        `e${edge.source}-${edge.target}`,
                    source: edge.source.toString(),
                    target: edge.target.toString(),
                }));

                setNodes(enhanceNodesWithStatusHandler(backendNodes));
                setEdges(backendEdges);
            } catch (err) {
                console.error("❌ Failed to fetch graph data", err);
            } finally {
                // 2. UNLOCK AUTOSAVE (with a 500ms delay to let ReactFlow settle the canvas first)
                setTimeout(() => setIsFetchingGraph(false), 500);
            }
        };
        fetchGraphData();
    }, [selectedProjectId, setNodes, setEdges]);

    // ReactFlow utility functions
    const getId = useCallback(() => {
        setId((prevId) => prevId + 1);
        return `node_${id}`;
    }, [id]);

    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();
            const pane = ref.current.getBoundingClientRect();
            setMenu({
                id: node.id,
                top: event.clientY < pane.height - 200 && event.clientY - 60,
                left:
                    event.clientX < pane.width - 200 &&
                    (isSidebarOpen ? event.clientX - 300 : event.clientX),
                right:
                    event.clientX >= pane.width - 200 &&
                    pane.width -
                        (isSidebarOpen ? event.clientX - 300 : event.clientX),
                bottom:
                    event.clientY >= pane.height - 200 &&
                    pane.height - event.clientY + 70,
            });
        },
        [setMenu, isSidebarOpen],
    );

    const onEdgeUpdate = useCallback(
        (oldEdge, newConnection) => {
            edgeUpdateSuccessful.current = true;
            setEdges((els) => updateEdge(oldEdge, newConnection, els));
        },
        [setEdges],
    );

    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdateEnd = useCallback(
        (_, edge) => {
            if (!edgeUpdateSuccessful.current) {
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            }
            edgeUpdateSuccessful.current = true;
        },
        [setEdges],
    );

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow");
            if (typeof type === "undefined" || !type) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node` },
                style: {
                    background: "#ffffff",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, getId, setNodes],
    );

    const handleDownload = () => {
        const nodesBounds = getRectOfNodes(getNodes());
        const transform = getTransformForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.5,
            2,
        );

        toPng(document.querySelector(".react-flow__viewport"), {
            backgroundColor: "#f8fafc", // Light gray background
            width: imageWidth,
            height: imageHeight,
            style: {
                width: imageWidth,
                height: imageHeight,
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        }).then(downloadImage);
    };

    // Close the context menu when clicking elsewhere
    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    // Create a new node
    const handleCreateNode = async () => {
        const task = newNodeInput.task.trim();
        if (task === "") {
            showError("Task is mandatory");
            return;
        }
        if (!newNodeInput.assignedTo) {
            showError("Please select a member before creating the node.");
            return;
        }
        if (new Date(newNodeInput.deadline) < new Date()) {
            showError(
                "Your deadline has passed before creation, please select new deadline",
            );
            return;
        }

        const memberId = localStorage.getItem("memberId");
        const assignedBy = localStorage.getItem("username");

        const newNode = {
            id: uuidv4(),
            position: { x: 100, y: 100 },
            type: "card",
            data: {
                projectId: selectedProjectId,
                task: newNodeInput.task,
                assignedTo: newNodeInput.assignedTo,
                creatorId: memberId,
                assignedBy: assignedBy,
                createdTime: new Date().toISOString(),
                deadline: newNodeInput.deadline || new Date().toISOString(),
                status: "unpicked",
                description: description,
                stuckReason: "",
                onStatusChange: (newStatus) => {
                    setNodes((prevNodes) =>
                        prevNodes.map((n) =>
                            n.id === newNode.id
                                ? {
                                      ...n,
                                      data: { ...n.data, status: newStatus },
                                  }
                                : n,
                        ),
                    );
                },
            },
        };

        const updatedNodes = [...nodes, newNode];
        setNodes(updatedNodes);
        setNewNodeInput({
            id: "",
            assignedTo: "",
            task: "",
            deadline: new Date().toISOString(),
            name: "",
            color: "#ffffff",
        });

        await api.post(`/mail`, {
            node: newNode,
        });
        showSuccess("Node created successfully");
        logActivity(`created a new task '${newNodeInput.task}'`);
    };

    // Save graph data to backend without alert
    const saveGraphNoAlert = async (nodesArg, edgesArg) => {
        const formattedNodes = nodesArg.map((node) => ({
            graphNodeId: node.id,
            projectId: node.data.projectId,
            task: node.data.task,
            assignedTo: node.data.assignedTo,
            creatorId: node.data.creatorId,
            assignedBy: node.data.assignedBy,
            createdTime: node.data.createdTime,
            assignedAt: new Date().toISOString(),
            deadline: node.data.deadline,
            status: node.data.status,
            stuckReason: node.data.stuckReason || "",
            description: node.data.description || "",
            posX: node.position.x,
            posY: node.position.y,
            // ✨ NEW: Send the updated time metrics back to the database
            accumulatedTimeMs: node.data.accumulatedTimeMs || 0,
            lastActivatedAt: node.data.lastActivatedAt || null,
        }));

        const formattedEdges = edgesArg.map((edge) => ({
            graphEdgeId: edge.id,
            projectId: selectedProjectId,
            source: edge.source,
            target: edge.target,
        }));

        await api.post(`/save`, {
            projectId: selectedProjectId,
            nodes: formattedNodes,
            edges: formattedEdges,
        });

        setDescription("");
    };

    // Save graph with success notification
    const saveGraph = async () => {
        // 1. Instantly trigger the UI loading state
        setIsAutosaving(true);
        setSaveStatus("Saving...");

        try {
            // 2. Force the immediate save
            await saveGraphNoAlert(nodes, edges);

            // 3. Update the UI to success
            setSaveStatus("Saved");
            showSuccess("Graph saved successfully!");
        } catch (error) {
            console.error("Manual save failed", error);
            setSaveStatus("Error");
            showError("Failed to save graph");
        } finally {
            setIsAutosaving(false);
        }
    };

    // Filter nodes by project ID
    const filteredNodes = useMemo(() => {
        return nodes.filter(
            (node) => `${node.data.projectId}` === `${selectedProjectId}`,
        );
    }, [nodes, selectedProjectId]);

    // Add status change handler to nodes
    const enhanceNodesWithStatusHandler = (nodes) => {
        return nodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                onStatusChange: (newStatus) => {
                    setNodes((prevNodes) =>
                        prevNodes.map((n) =>
                            n.id === node.id
                                ? {
                                      ...n,
                                      data: {
                                          ...n.data,
                                          status: newStatus,
                                      },
                                  }
                                : n,
                        ),
                    );
                },
            },
        }));
    };

    // Handle node click
    const onNodeClick = useCallback(async (event, node) => {
        setSelectedNode(node);
        setNodeName(node.data.task);
        setNodeId(node.id);
        setNodeColor("transparent");
        setStatus(node.data.status || "");
        setStuckReason(node.data.stuckReason || "");

        try {
            const res = await api.get(`/nodes/${node.id}/todos`);
            setTodos(res.data);
            setNodeDescription(node.data.description || "");
            setIsCompleted(node.data.status === "completed");
            setShowModal(true);
        } catch (error) {
            console.error("Failed to fetch todos", error);
        }
    }, []);

    // Toggle todo completion status
    const onToggleTodo = async (todoId) => {
        await api.post(`/todos/${todoId}/toggle`);
        const res = await api.get(`/nodes/${nodeId}/todos`);
        setTodos(res.data);
    };

    // Mark node as completed
    const onMarkCompleted = async () => {
        try {
            await api.post(`/nodes/${nodeId}/complete`);
            setIsCompleted(true);
            setNodeColor("green");
            setShowModal(false);
            setNodes((prevNodes) =>
                prevNodes.map((node) =>
                    node.id === nodeId
                        ? {
                              ...node,
                              data: { ...node.data, status: "completed" },
                          }
                        : node,
                ),
            );
            showSuccess("Node marked as completed successfully!");

            // Log it
            const node = nodes.find((n) => n.id === nodeId);
            if (node) {
                logActivity(`completed task '${node.data.task}'`);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                showError(
                    error.response.data.message ||
                        "All todos must be completed before marking as completed.",
                );
            } else {
                showError("Something went wrong. Please try again.");
            }
        }
    };

    // Add a new todo to node
    const onAddTodo = async (newTask) => {
        const localMemberId = localStorage.getItem("memberId");
        await api.post(`/nodes/${nodeId}/todos`, {
            task: newTask,
            memberId: localMemberId,
        });
        const res = await api.get(`/nodes/${nodeId}/todos`);
        setTodos(res.data);
        showSuccess("Added new todo");

        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
            logActivity(`added a subtask '${newTask}' to '${node.data.task}'`);
        }
    };

    // Change node status
    const onStatusChange = (newStatus) => {
        if (!nodeId) return;

        const currentUsername = localStorage.getItem("username");
        const node = nodes.find((n) => n.id === nodeId);

        if (!node) return showError("Node not found.");
        if (node.data.assignedTo !== currentUsername) {
            return showError("You are not assigned to this node.");
        }

        const colorMap = {
            pending: "#3b82f6",
            stuck: "#facc15",
            completed: "#10b981",
            "in need": "#a855f7",
            working: "#14b8a6",
            busy: "#f97316",
        };

        const oldStatus = node.data.status || "unpicked";
        const isOldStatusActive =
            oldStatus === "working" || oldStatus === "in need";
        const isNewStatusActive =
            newStatus === "working" || newStatus === "in need";

        const nowIso = new Date().toISOString();
        let newAccumulatedTime = node.data.accumulatedTimeMs || 0;
        let newLastActivatedAt = node.data.lastActivatedAt || null;

        // If transitioning OUT of an active state, finalize the time chunk
        if (isOldStatusActive && !isNewStatusActive && newLastActivatedAt) {
            const timeSpentMs = new Date() - new Date(newLastActivatedAt);
            newAccumulatedTime += timeSpentMs > 0 ? timeSpentMs : 0;
            newLastActivatedAt = null; // Reset the stopwatch
        }
        // If transitioning INTO an active state, start the stopwatch
        else if (!isOldStatusActive && isNewStatusActive) {
            newLastActivatedAt = nowIso;
        }

        setNodeColor(colorMap[newStatus] || "#ffffff");
        setStatus(newStatus);
        if (newStatus !== "stuck") setStuckReason("");

        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === nodeId
                    ? {
                          ...n,
                          data: {
                              ...n.data,
                              status: newStatus,
                              accumulatedTimeMs: newAccumulatedTime,
                              lastActivatedAt: newLastActivatedAt,
                              stuckReason:
                                  newStatus === "stuck"
                                      ? n.data.stuckReason
                                      : "",
                          },
                      }
                    : n,
            ),
        );
        logActivity(
            `changed status of task '${node.data.task}' to ${newStatus}`,
        );
    };

    // Update stuck reason
    const onStuckReasonChange = async (reason) => {
        setStuckReason(reason);

        try {
            await api.post(`/nodes/${nodeId}/update-stuck-reason`, {
                stuckReason: reason,
            });

            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.id === nodeId
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  stuckReason: reason,
                              },
                          }
                        : n,
                ),
            );
            showSuccess("Updated stuck reason");
        } catch (err) {
            console.error("Error updating stuck reason:", err);
            showError("Failed to update reason");
        }
    };

    // 1. Modernized Edge Styling
    const edgeStyle = {
        type: "smoothstep", // Changes from loose curves to sleek rounded corners
        animated: true, // The animation looks great on smoothstep!
        style: {
            stroke: "#94a3b8", // Soft slate color
            strokeWidth: 2.5, // Slightly thicker for a premium feel
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#94a3b8",
            width: 15, // Smaller, sharper arrows
            height: 15,
        },
    };

    // 2. Modernized Connection Line (When you drag to connect nodes)
    const customEdgeLine = ({ fromX, fromY, toX, toY }) => {
        const [edgePath] = getBezierPath({
            sourceX: fromX,
            sourceY: fromY,
            targetX: toX,
            targetY: toY,
        });

        return (
            <path
                d={edgePath}
                stroke="#3b82f6" // Tailwind Blue 500
                strokeWidth={3}
                fill="none"
                style={{
                    // Removed the dashed array!
                    filter: "drop-shadow(0 2px 6px rgba(59, 130, 246, 0.4))", // Added a subtle blue glow
                }}
            />
        );
    };

    // Update node deadline
    const onDeadlineChange = async (newDeadline) => {
        try {
            await api.post(`/nodes/${nodeId}/update-deadline`, {
                deadline: newDeadline,
            });
            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.id === nodeId
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  deadline: newDeadline,
                              },
                          }
                        : n,
                ),
            );
        } catch (err) {
            console.error("Error updating deadline:", err);
            throw err;
        }
    };

    return (
        // ✨ Add onPointerMove here to track the mouse across the whole graph area
        <div className="w-full h-full relative" onPointerMove={handleMouseMove}>
            {/* ✨ RENDER REMOTE CURSORS ON TOP OF THE GRAPH ✨ */}
            {Object.values(cursors).map((cursor) => {
                // Math magic: Convert graph coordinates back to screen pixels based on current zoom/pan!
                const screenX = cursor.x * viewport.zoom + viewport.x;
                const screenY = cursor.y * viewport.zoom + viewport.y;

                return (
                    <motion.div
                        key={cursor.username}
                        animate={{ x: screenX, y: screenY }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            mass: 0.5,
                        }}
                        className="absolute top-0 left-0 z-50 pointer-events-none flex flex-col items-start"
                        style={{ originX: 0, originY: 0 }}
                    >
                        <FaLocationArrow
                            size={16}
                            // ✨ CHANGED: -45deg is now -90deg
                            style={{
                                color: cursor.color,
                                transform: "rotate(-80deg)",
                                filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.2))",
                            }}
                        />
                        <div
                            className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-md ml-3"
                            style={{ backgroundColor: cursor.color }}
                        >
                            {cursor.username}
                        </div>
                    </motion.div>
                );
            })}
            <ReactFlow
                ref={ref}
                nodes={filteredNodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onEdgeUpdate={onEdgeUpdate}
                onEdgeUpdateStart={onEdgeUpdateStart}
                onEdgeUpdateEnd={onEdgeUpdateEnd}
                defaultEdgeOptions={edgeStyle}
                connectionLineComponent={customEdgeLine}
                onPaneClick={onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                fitView
            >
                {/* Rightside panel */}
                <RightsidePanel
                    isOpen={isRightPanelOpen}
                    closePanel={() => setIsRightPanelOpen(false)}
                    projectMembers={projectMembers}
                    newNodeInput={newNodeInput}
                    setNewNodeInput={setNewNodeInput}
                    description={description}
                    setDescription={setDescription}
                    handleCreateNode={handleCreateNode}
                    saveGraph={saveGraph}
                    onClick={handleDownload}
                />

                {/* ✨ UNIFIED TOP-LEFT CONTROL PILL ✨ */}
                <Panel
                    position="top-left"
                    className="mt-5 ml-5 bg-white/80 backdrop-blur-md p-1.5 pr-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3"
                >
                    {/* 1. Integrated Left Sidebar Toggle */}
                    <motion.button
                        onClick={() =>
                            isSidebarOpen ? closeSidebar() : openSidebar()
                        }
                        className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 hover:border-blue-200 rounded-lg shadow-sm transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Toggle Projects Sidebar"
                    >
                        <FaBars size={14} />
                    </motion.button>

                    {/* 2. Vertical Divider */}
                    <div className="w-[1px] h-5 bg-gray-200"></div>

                    {/* 3. Project Status Breadcrumb */}
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex h-2.5 w-2.5">
                            {selectedProjectId && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            )}
                            <span
                                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${selectedProjectId ? "bg-blue-500" : "bg-gray-400"}`}
                            ></span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700 mt-0.5 whitespace-nowrap">
                            {selectedProjectId
                                ? projectName || "Unnamed Project"
                                : "No Project Selected"}
                        </div>
                    </div>

                    {/* ✨ NEW: 4. Active Users Stack */}
                    {selectedProjectId && activeUsers.length > 0 && (
                        <>
                            <div className="w-[1px] h-5 bg-gray-200 ml-1"></div>
                            <div className="flex items-center -space-x-2 pl-1">
                                {activeUsers.map((user, index) => (
                                    <div
                                        key={user.username}
                                        className="relative group z-10 hover:z-20 transition-all hover:-translate-y-1"
                                        title={`${user.username} is viewing this project`}
                                    >
                                        {/* Avatar Circle */}
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm flex-shrink-0"
                                            style={{ borderColor: "white" }} // Ensures clean cutout between overlapping circles
                                        >
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Avatar
                                                    size={28}
                                                    name={user.username}
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

                                        {/* Green Online Dot */}
                                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Panel>

                {/* ✨ TOP-RIGHT GLOBAL ACTIONS ✨ */}
                <Panel
                    position="top-right"
                    className="mt-5 mr-5 flex gap-3 z-40"
                    style={{
                        transition: "transform 0.3s ease-in-out",
                        transform: isRightPanelOpen
                            ? "translateX(-340px)"
                            : "translateX(0px)",
                    }}
                >
                    {/* Smart Autosave Button */}
                    <motion.button
                        onClick={saveGraph}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isAutosaving || saveStatus === "Saved"}
                        className={`group flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm
                        ${saveStatus === "Unsaved" ? "border-amber-300 text-amber-600 hover:bg-amber-50" : ""}
                        ${saveStatus === "Saving..." ? "border-blue-300 text-blue-500 opacity-80 cursor-wait" : ""}
                        ${saveStatus === "Saved" ? "border-gray-200 text-gray-500 cursor-default" : "border-gray-200 text-gray-700 hover:text-indigo-600"}
                    `}
                    >
                        {saveStatus === "Saving..." ? (
                            // A spinning icon while communicating with backend
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : saveStatus === "Saved" ? (
                            <FaCheckCircle className="text-green-500" />
                        ) : (
                            <FaSave
                                className={`${saveStatus === "Unsaved" ? "text-amber-500" : "text-gray-400 group-hover:text-indigo-500"} transition-colors`}
                            />
                        )}

                        {saveStatus === "Unsaved" ? "Save Now" : saveStatus}
                    </motion.button>

                    {/* Export Button (unchanged) */}
                    <motion.button
                        onClick={handleDownload}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="group flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 hover:border-gray-300 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                    >
                        <FaDownload className="text-gray-400 group-hover:text-indigo-500 transition-colors" />{" "}
                        Export
                    </motion.button>

                    {/* Logs Button */}
                    <motion.button
                        onClick={() => setIsLogsModalOpen(true)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="group flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                    >
                        <FaHistory className="text-gray-400 group-hover:text-indigo-500 transition-colors" />{" "}
                        Logs
                    </motion.button>

                    {/* ✨ NEW: Sign Out Button */}
                    <motion.button
                        onClick={handleSignOut}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="group flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                    >
                        <FaSignOutAlt className="text-gray-400 group-hover:text-red-500 transition-colors" />{" "}
                        Sign Out
                    </motion.button>

                    {/* ✨ NEW: Button to re-open the Right Panel when it's closed */}
                    <AnimatePresence>
                        {!isRightPanelOpen && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                onClick={() => setIsRightPanelOpen(true)}
                                className="flex items-center justify-center w-10 h-10 ml-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full shadow-sm transition-all"
                                title="Open Task Configurator"
                            >
                                <FaChevronLeft size={14} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </Panel>

                {/* ✨ MOVED TO BOTTOM-LEFT SAFE ZONE ✨ */}
                <Controls
                    position="bottom-left"
                    className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 ml-5 mb-5"
                />

                <MiniMap
                    position="bottom-right"
                    zoomable
                    pannable
                    className="rounded-xl shadow-md overflow-hidden border border-gray-200 mb-5"
                    style={{
                        transition:
                            "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: isRightPanelOpen
                            ? "translateX(-340px)"
                            : "translateX(0px)",
                    }}
                    nodeBorderRadius={8}
                    // Down in your return block for the MiniMap
                    nodeColor={(node) => {
                        const statusColors = {
                            completed: "#10b981",
                            pending: "#3b82f6",
                            stuck: "#facc15",
                            "in need": "#a855f7",
                            working: "#14b8a6",
                            busy: "#f97316", // Orange ✨ NEW
                            unpicked: "#94a3b8",
                        };
                        return statusColors[node.data?.status] || "#cbd5e1";
                    }}
                />

                <Background
                    variant="dots"
                    gap={24}
                    size={2}
                    color="#cbd5e1"
                    style={{ backgroundColor: "#fafafa" }}
                />

                {/* Node properties on right click */}
                {menu && (
                    <NodeProperties
                        onClick={onPaneClick}
                        logActivity={logActivity}
                        {...menu}
                    />
                )}

                <ActivityLogModal
                    isOpen={isLogsModalOpen}
                    onClose={() => setIsLogsModalOpen(false)}
                    projectId={selectedProjectId}
                />

                <Nodecard
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    nodeName={nodeName}
                    description={nodeDescription}
                    todos={todos}
                    isCompleted={isCompleted}
                    assignedTo={selectedNode?.data?.assignedTo}
                    creatorId={selectedNode?.data?.creatorId}
                    onToggleTodo={onToggleTodo}
                    onMarkCompleted={onMarkCompleted}
                    onAddTodo={onAddTodo}
                    status={status}
                    onStatusChange={onStatusChange}
                    nodeData={selectedNode?.data}
                    onDeadlineChange={onDeadlineChange}
                    stuckReason={stuckReason}
                    onStuckReasonChange={onStuckReasonChange}
                />
            </ReactFlow>
        </div>
    );
};

const ReactFlowProviderContent = ({ selectedProjectId, projectName }) => {
    const { isSidebarOpen } = useGlobalContext();

    return (
        <ReactFlowProvider>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col h-screen flex-1 w-full min-w-0 overflow-hidden relative"
            >
                <Content
                    selectedProjectId={selectedProjectId}
                    projectName={projectName}
                />
            </motion.div>
        </ReactFlowProvider>
    );
};

export default ReactFlowProviderContent;

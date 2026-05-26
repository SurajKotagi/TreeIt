import React, { useCallback } from "react";
import { useReactFlow } from "reactflow";

import api from "../utility/BaseAPI";
import { layoutNodesWithDagre } from "../utility/DagreLayoutHelper";

export default function NodeProperties({
    id,
    top,
    left,
    right,
    bottom,
    ...props
}) {
    const {
        getNode,
        setNodes,
        addNodes,
        setEdges,
        getNodes,
        getEdges,
        fitView,
    } = useReactFlow();

    const applyAutoLayout = () => {
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        const layouted = layoutNodesWithDagre(currentNodes, currentEdges, "LR"); // or "LR"
        setNodes(layouted);

        setTimeout(() => {
            fitView({ padding: 0.3, includeHiddenNodes: true });
        }, 100); // delay to ensure layout is applied
    };

    const deleteNode = useCallback(() => {
        // 1. Remove the node from the local ReactFlow state
        setNodes((nodes) => nodes.filter((node) => node.id !== id));

        // 2. Safely remove any edges that were connected to this node (both outgoing and incoming!)
        setEdges((edges) =>
            edges.filter((edge) => edge.source !== id && edge.target !== id),
        );

        // 3. We NO LONGER call the backend delete API here.
        // The Autosave useEffect in GraphPage will automatically detect this state change
        // and send the new, smaller lists to the /save endpoint.
    }, [id, setNodes, setEdges]);

    return (
        <div
            style={{ top, left, right, bottom }}
            className="absolute z-50 min-w-[160px] bg-white border border-gray-300 rounded-lg shadow-lg p-2 transition-all duration-150"
            {...props}
        >
            <ul className="mt-2 space-y-1">
                <li>
                    <button
                        onClick={deleteNode}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition"
                    >
                        🗑️ Delete Node
                    </button>
                </li>

                <li>
                    <button
                        onClick={applyAutoLayout}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition"
                    >
                        🧠 Auto Layout
                    </button>
                </li>
            </ul>
        </div>
    );
}

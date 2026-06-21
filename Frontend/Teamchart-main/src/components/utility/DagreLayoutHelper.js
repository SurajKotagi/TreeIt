import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// ✨ FIX 1: Explicitly define the dimensions of your RectangularNode.
// Looking at your screenshot, they are roughly 300px wide and 200px tall.
const NODE_WIDTH = 300;
const NODE_HEIGHT = 200;

export const layoutNodesWithDagre = (nodes, edges, direction = "LR") => {
    // ✨ FIX 2: Set spacing margins between nodes
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 50, // Vertical gap between nodes in the same column
        ranksep: 100, // Horizontal gap between connected nodes (the length of the arrow)
    });

    // 1. Add nodes to Dagre with strict dimensions
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            // ReactFlow usually populates node.width/height after first render,
            // but we fallback to our constants if it's not ready yet.
            width: node.width || NODE_WIDTH,
            height: node.height || NODE_HEIGHT,
        });
    });

    // 2. Add edges to Dagre
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // 3. Execute the math
    dagre.layout(dagreGraph);

    // 4. Map the calculated positions back to ReactFlow format
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // ✨ FIX 3: Offset correction.
        // Dagre returns the (x,y) of the CENTER of the node.
        // ReactFlow draws nodes from the TOP-LEFT corner.
        // We must subtract half the width/height to center them correctly.
        const actualWidth = node.width || NODE_WIDTH;
        const actualHeight = node.height || NODE_HEIGHT;

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - actualWidth / 2,
                y: nodeWithPosition.y - actualHeight / 2,
            },
        };
    });

    return layoutedNodes;
};

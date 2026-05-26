package arc.teamManager.models;

import java.util.List;

import arc.teamManager.entities.GraphEdge;
import arc.teamManager.entities.GraphNode;
import lombok.Data;

@Data
public class GraphDataRequest {

	private String projectId;

	private List<GraphNode> nodes;
	private List<GraphEdge> edges;

	public List<GraphNode> getNodes() {
		return nodes;
	}

	public void setNodes(List<GraphNode> nodes) {
		this.nodes = nodes;
	}

	public List<GraphEdge> getEdges() {
		return edges;
	}

	public void setEdges(List<GraphEdge> edges) {
		this.edges = edges;
	}

}

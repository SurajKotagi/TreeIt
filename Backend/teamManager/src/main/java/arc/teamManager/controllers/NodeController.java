package arc.teamManager.controllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import arc.teamManager.dto.DeadlineUpdateRequest;
import arc.teamManager.dto.TodoRequest;
import arc.teamManager.entities.GraphEdge;
import arc.teamManager.entities.GraphNode;
import arc.teamManager.entities.Todo;
import arc.teamManager.models.GraphDataRequest;
import arc.teamManager.models.MailRequest;
import arc.teamManager.repositories.EdgeRepository;
import arc.teamManager.repositories.NodeRepository;
import arc.teamManager.services.EmailService;
import arc.teamManager.services.NodeService;
import arc.teamManager.services.TodoService;

@RestController
public class NodeController {
    @Autowired
    private NodeRepository nodeRepo;

    @Autowired
    private EdgeRepository edgeRepo;

    @Autowired
    private TodoService todoService;

    @Autowired
    private NodeService nodeService;

    @Autowired
    private EmailService mailService;

    Logger log = LoggerFactory.getLogger(this.getClass());

    @PostMapping("/save")
    public ResponseEntity<?> saveGraph(@RequestBody GraphDataRequest request) {
        String projectId = request.getProjectId();
        if (projectId == null || projectId.isEmpty()) {
            return ResponseEntity.badRequest().body("Project ID is required for saving.");
        }

        // ==========================================
        // 1. HANDLE NODES (Delta Merge)
        // ==========================================
        if (request.getNodes() != null && !request.getNodes().isEmpty()) {
            // Extract all Node IDs currently visible on the frontend canvas
            List<String> activeNodeIds = request.getNodes().stream()
                    .map(GraphNode::getGraphNodeId)
                    .collect(Collectors.toList());

            // Delete any nodes in the DB that belong to this project but aren't on the
            // canvas anymore
            nodeRepo.deleteGhostNodes(projectId, activeNodeIds);

            // Save new nodes & Update existing ones
            nodeRepo.saveAll(request.getNodes());
        } else {
            // If the request contains 0 nodes, the user deleted everything. Clear the
            // project.
            nodeRepo.deleteAllByProjectId(projectId);
        }

        // ==========================================
        // 2. HANDLE EDGES (Delta Merge)
        // ==========================================
        if (request.getEdges() != null && !request.getEdges().isEmpty()) {
            // Extract all Edge IDs currently visible on the frontend canvas
            List<String> activeEdgeIds = request.getEdges().stream()
                    .map(GraphEdge::getGraphEdgeId)
                    .collect(Collectors.toList());

            // Delete any edges in the DB that aren't on the canvas anymore
            edgeRepo.deleteGhostEdges(projectId, activeEdgeIds);

            // Save new edges & Update existing ones
            edgeRepo.saveAll(request.getEdges());
        } else {
            // If the request contains 0 edges, clear all edges for the project.
            edgeRepo.deleteAllByProjectId(projectId);
        }

        return ResponseEntity.ok("Graph synced successfully");
    }

    @PostMapping("/mail")
    public ResponseEntity<?> mailAlert(@RequestBody MailRequest request) {
        mailService.sendTaskAssignedEmail("surajsanjaykotagi@gmail.com", request.getNode().getData().getAssignedBy(),
                request.getNode().getData().getTask(), request.getNode().getData().getDescription());
        return ResponseEntity.ok("Saved successfully");
    }

    // to modify description
    @PostMapping("/updateDescription")
    public ResponseEntity<String> updateDescription(@RequestBody String description, @RequestBody String nodeId) {
        String updatedDescription = nodeService.updatedDescription(description, nodeId);
        return ResponseEntity.ok("");
    }

    public String postMethodName(@RequestBody String entity) {
        // TODO: process POST request

        return entity;
    }

    @GetMapping("/load/{projectId}")
    public ResponseEntity<GraphDataRequest> loadGraph(@PathVariable String projectId) {
        try {
            List<GraphNode> nodes = nodeRepo.findByProjectId(projectId);
            List<GraphEdge> edges = edgeRepo.findByProjectId(projectId);

            GraphDataRequest response = new GraphDataRequest();
            response.setNodes(nodes);
            response.setEdges(edges);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new GraphDataRequest());
        }
    }

    // Todos controllers
    @GetMapping("/nodes/{nodeId}/todos")
    public ResponseEntity<List<Todo>> getTodos(@PathVariable String nodeId) {
        System.out.println("get todos called");
        List<Todo> todos = todoService.getTodosByNodeId(nodeId);
        log.info("todos get -->" + todos);
        return ResponseEntity.ok(todos);
    }

    // 2. Add a todo to a node
    @PostMapping("/nodes/{nodeId}/todos")
    public Todo addTodo(@PathVariable String nodeId, @RequestBody TodoRequest rq) {
        log.info("inside addTodo --> ");
        log.info("node Id --> " + nodeId);
        log.info("Req.get(task) -->" + rq.getTask());
        log.info("creator member id -->" + rq.getMemberId());
        return todoService.addTodo(nodeId, rq, rq.getMemberId());
    }

    // 3. Toggle a todo (mark done/undone)
    @PostMapping("/todos/{todoId}/toggle")
    public Todo toggleTodo(@PathVariable Long todoId) {
        return todoService.toggleTodo(todoId);
    }

    // 4. Mark node as complete (if all todos are done)
    @PostMapping("/nodes/{nodeId}/complete")
    public GraphNode markNodeCompleted(@PathVariable String nodeId) {
        return todoService.markNodeComplete(nodeId);
    }

    @PostMapping("/nodes/{nodeId}/deleteNode")
    public GraphNode deleteNode(@PathVariable String nodeId) {
        return nodeService.deleteNode(nodeId);
    }

    @PostMapping("/nodes/{nodeId}/deleteEdges")
    public String deleteEdges(@PathVariable String nodeId) {
        return nodeService.deleteNodeEdges(nodeId);
    }

    @PostMapping("/nodes/{id}/update-deadline")
    public ResponseEntity<String> updateDeadline(
            @PathVariable("id") String nodeId,
            @RequestBody Map<String, String> payload) {
        String newDeadline = payload.get("deadline");
        try {
            nodeService.updateDeadline(nodeId, newDeadline);
            return ResponseEntity.ok("Deadline updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating deadline: " + e.getMessage());
        }
    }

    @PostMapping("/nodes/{nodeId}/update-stuck-reason")
    public ResponseEntity<String> updateStuckReason(
            @PathVariable("nodeId") String nodeId,
            @RequestBody Map<String, String> payload) {
        String stuckReason = payload.get("stuckReason");
        try {
            nodeService.updateStuckReason(nodeId, stuckReason);
            return ResponseEntity.ok("Stuck reason updated successfully.");
        } catch (Exception e) {
            log.error("Error updating stuck reason: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating stuck reason: " + e.getMessage());
        }
    }
}

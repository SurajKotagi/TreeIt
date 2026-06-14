package arc.teamManager.entities;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "GRAPH_NODE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphNode {
	@Id
	@Column(name = "GRAPHNODE_ID", nullable = false)
	private String graphNodeId;

	@Column(name = "PROJECT_ID")
	private String projectId;

	@Column(name = "TASK")
	private String task;

	@Column(name = "ASSIGNED_TO")
	private String assignedTo;

	@Column(name = "ASSIGNED_BY")
	private String assignedBy;

	@Column(name = "CREATOR_ID")
	private String creatorId;

	@Column(name = "ASSIGNED_AT")
	private LocalDateTime assignedAt;

	@Column(name = "DEADLINE")
	private String deadline;

	@Column(name = "STATUS")
	private String status;

	@Column(columnDefinition = "TEXT", name = "STUCK_REASON")
	private String stuckReason;

	@Column(name = "POS_X")
	private int posX;

	@Column(name = "POS_Y")
	private int posY;

	@OneToMany(mappedBy = "node", cascade = CascadeType.ALL)
	private List<Todo> todos;

	@Column(columnDefinition = "TEXT", name = "DESCRIPTION")
	private String description;

	@Column(name = "CREATED_TIME")
	private String createdTime; // Store as ISO string since your frontend sends it this way

	// ✨ NEW: Tracks total active time accumulated so far (in milliseconds)
	@Column(name = "ACCUMULATED_TIME_MS")
	private Long accumulatedTimeMs = 0L;

	// ✨ NEW: Records the exact moment the task entered an "Active" state
	@Column(name = "LAST_ACTIVATED_AT")
	private String lastActivatedAt; // Store as ISO String

	public String getCreatedTime() {
		return createdTime;
	}

	public void setCreatedTime(String createdTime) {
		this.createdTime = createdTime;
	}

	public String getGraphNodeId() {
		return graphNodeId;
	}

	public void setGraphNodeId(String graphNodeId) {
		this.graphNodeId = graphNodeId;
	}

	public String getProjectId() {
		return projectId;
	}

	public void setProjectId(String projectId) {
		this.projectId = projectId;
	}

	public String getTask() {
		return task;
	}

	public void setTask(String task) {
		this.task = task;
	}

	public String getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(String assignedTo) {
		this.assignedTo = assignedTo;
	}

	public String getAssignedBy() {
		return assignedBy;
	}

	public void setAssignedBy(String assignedBy) {
		this.assignedBy = assignedBy;
	}

	public String getCreatorId() {
		return creatorId;
	}

	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

	public LocalDateTime getAssignedAt() {
		return assignedAt;
	}

	public void setAssignedAt(LocalDateTime assignedAt) {
		this.assignedAt = assignedAt;
	}

	public String getDeadline() {
		return deadline;
	}

	public void setDeadline(String deadline) {
		this.deadline = deadline;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getStuckReason() {
		return stuckReason;
	}

	public void setStuckReason(String stuckReason) {
		this.stuckReason = stuckReason;
	}

	public int getPosX() {
		return posX;
	}

	public void setPosX(int posX) {
		this.posX = posX;
	}

	public int getPosY() {
		return posY;
	}

	public void setPosY(int posY) {
		this.posY = posY;
	}

	public List<Todo> getTodos() {
		return todos;
	}

	public void setTodos(List<Todo> todos) {
		this.todos = todos;
	}

}

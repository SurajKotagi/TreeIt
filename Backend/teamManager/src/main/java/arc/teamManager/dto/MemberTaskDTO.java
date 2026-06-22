package arc.teamManager.dto;

public class MemberTaskDTO {
    private String projectName;
    private String task;
    private String status;
    private String avatarUrl; // ✨ NEW FIELD

    public MemberTaskDTO(String projectName, String task, String status, String avatarUrl) {
        this.projectName = projectName;
        this.task = task;
        this.status = status;
        this.avatarUrl = avatarUrl;
    }

    // Getters and Setters
    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getTask() {
        return task;
    }

    public void setTask(String task) {
        this.task = task;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}

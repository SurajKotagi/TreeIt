package arc.teamManager.dto;

import java.util.Map;

public class MemberAnalyticsDTO {
    private int tasksCompleted;
    private int tasksPending;
    private int tasksPendingForLong;
    private Map<String, Integer> activityHeatMap;

    public int getTasksCompleted() {
        return tasksCompleted;
    }

    public void setTasksCompleted(int tasksCompleted) {
        this.tasksCompleted = tasksCompleted;
    }

    public int getTasksPending() {
        return tasksPending;
    }

    public void setTasksPending(int tasksPending) {
        this.tasksPending = tasksPending;
    }

    public int getTasksPendingForLong() {
        return tasksPendingForLong;
    }

    public void setTasksPendingForLong(int tasksPendingForLong) {
        this.tasksPendingForLong = tasksPendingForLong;
    }

    public Map<String, Integer> getActivityHeatMap() {
        return activityHeatMap;
    }

    public void setActivityHeatMap(Map<String, Integer> activityHeatMap) {
        this.activityHeatMap = activityHeatMap;
    }
}

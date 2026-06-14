package arc.teamManager.controllers;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import arc.teamManager.entities.Member;
import arc.teamManager.entities.GraphNode;
import arc.teamManager.entities.ActivityLog;
import arc.teamManager.repositories.MemberRepository;
import arc.teamManager.repositories.NodeRepository;
import arc.teamManager.repositories.ActivityLogRepository;
import arc.teamManager.dto.MemberAnalyticsDTO;

@RestController
public class MemberController {
    @Autowired
    MemberRepository memberRepository;

    @Autowired
    NodeRepository nodeRepository;

    @Autowired
    ActivityLogRepository activityLogRepository;

    @GetMapping("/members")
    public List<Member> getAllUsers() {
        return memberRepository.findAll();
    }

    @GetMapping("/members/{username}/analytics")
    public MemberAnalyticsDTO getMemberAnalytics(@PathVariable String username) {
        List<GraphNode> nodes = nodeRepository.findByAssignedTo(username);
        
        int completed = 0;
        int pending = 0;
        int pendingForLong = 0;
        Map<String, Integer> heatMap = new HashMap<>();

        LocalDate today = LocalDate.now();

        for (GraphNode node : nodes) {
            String status = node.getStatus();
            if ("completed".equalsIgnoreCase(status)) {
                completed++;
            } else if ("pending".equalsIgnoreCase(status) || "stuck".equalsIgnoreCase(status)) {
                pending++;
                
                // Check if pending for long (e.g., more than 7 days since createdTime or deadline passed)
                boolean isOld = false;
                if (node.getCreatedTime() != null) {
                    try {
                        LocalDate createdDate = LocalDate.parse(node.getCreatedTime().substring(0, 10)); // Assuming ISO format "YYYY-MM-DDTHH:mm:ss.sssZ"
                        if (ChronoUnit.DAYS.between(createdDate, today) > 7) {
                            isOld = true;
                        }
                    } catch (Exception e) {
                        // ignore parse errors
                    }
                }
                if (node.getDeadline() != null && !node.getDeadline().isEmpty()) {
                    try {
                        LocalDate deadlineDate = LocalDate.parse(node.getDeadline().substring(0, 10));
                        if (deadlineDate.isBefore(today)) {
                            isOld = true;
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                }
                
                if (isOld) {
                    pendingForLong++;
                }
            }
        }

        // Populate heatmap based on user's actual activity logs
        List<ActivityLog> logs = activityLogRepository.findByUsername(username);
        for (ActivityLog log : logs) {
            if (log.getTimestamp() != null) {
                try {
                    String dateKey = log.getTimestamp().toLocalDate().toString(); // ISO format: YYYY-MM-DD
                    heatMap.put(dateKey, heatMap.getOrDefault(dateKey, 0) + 1);
                } catch (Exception e) {
                    // ignore
                }
            }
        }

        MemberAnalyticsDTO dto = new MemberAnalyticsDTO();
        dto.setTasksCompleted(completed);
        dto.setTasksPending(pending);
        dto.setTasksPendingForLong(pendingForLong);
        dto.setActivityHeatMap(heatMap);
        
        return dto;
    }
}

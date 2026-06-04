package arc.teamManager.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import arc.teamManager.dto.LogRequest;
import arc.teamManager.entities.ActivityLog;
import arc.teamManager.repositories.ActivityLogRepository;

@RestController
@RequestMapping("/logs")
public class LogController {

    @Autowired
    private ActivityLogRepository logRepository;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ActivityLog>> getLogsByProject(@PathVariable String projectId) {
        List<ActivityLog> logs = logRepository.findByProjectIdOrderByTimestampDesc(projectId);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/")
    public ResponseEntity<ActivityLog> addLog(@RequestBody LogRequest request) {
        ActivityLog log = new ActivityLog();
        log.setProjectId(request.getProjectId());
        log.setUsername(request.getUsername());
        log.setActionMessage(request.getActionMessage());
        log.setTimestamp(LocalDateTime.now());
        ActivityLog savedLog = logRepository.save(log);
        return ResponseEntity.ok(savedLog);
    }
}

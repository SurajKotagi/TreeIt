package arc.teamManager.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ACTIVITY_LOG")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOG_ID")
    private Long logId;

    @Column(name = "PROJECT_ID")
    private String projectId;

    @Column(name = "USERNAME")
    private String username;

    @Column(columnDefinition = "TEXT", name = "ACTION_MESSAGE")
    private String actionMessage;

    @Column(name = "TIMESTAMP")
    private LocalDateTime timestamp;
}

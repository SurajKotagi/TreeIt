package arc.teamManager.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "OTP_TOKEN")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpToken {
    @Id
    private String mail;
    private String otp;
    private LocalDateTime expiryTime;
}

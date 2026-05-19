package arc.teamManager.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthControler {

    @GetMapping("api/health")
    public ResponseEntity<String> getAllUsers() {
        return ResponseEntity.ok("Backend is Up");
    }

}

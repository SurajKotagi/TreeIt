package arc.teamManager.controllers;

import arc.teamManager.dto.CursorPayload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CursorController {

    // Receives from: /app/cursor.move/{projectId}
    // Broadcasts to: /topic/cursors/{projectId}
    @MessageMapping("/cursor.move/{projectId}")
    @SendTo("/topic/cursors/{projectId}")
    public CursorPayload broadcastCursor(@DestinationVariable String projectId, CursorPayload payload) {
        return payload;
    }
}

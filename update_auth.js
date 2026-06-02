const fs=require("fs");
let auth = fs.readFileSync("Backend/teamManager/src/main/java/arc/teamManager/controllers/AuthController.java", "utf8");
if (!auth.includes("/google")) {
    auth = auth.replace("import org.springframework.web.bind.annotation.*;", "import org.springframework.web.bind.annotation.*;\nimport org.springframework.beans.factory.annotation.Value;\nimport com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;\nimport com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;\nimport com.google.api.client.http.javanet.NetHttpTransport;\nimport com.google.api.client.json.gson.GsonFactory;\nimport java.util.Collections;\nimport java.util.UUID;");
    let googleAuthMethod = `
    @Value("${spring.security.oauth2.client.registration.google.client-id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null) return ResponseEntity.badRequest().body("Token is required");

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                if (name == null || name.isEmpty()) name = email.split("@")[0];
                
                Optional<Member> memberOpt = memberRepository.findByMail(email);
                Member member;
                if (memberOpt.isPresent()) {
                    member = memberOpt.get();
                } else {
                    member = new Member();
                    member.setMail(email);
                    member.setUsername(name.replaceAll("\\\\s+", ""));
                    member.setEmployeeId("GOOG-" + new Random().nextInt(99999));
                    member.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    member.setRole("USER");
                    member = memberRepository.save(member);
                }
                return ResponseEntity.ok(member.getMemberId());
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Token verification failed");
        }
    }
`;
    auth = auth.replace("public class AuthController {", "public class AuthController {" + googleAuthMethod);
    fs.writeFileSync("Backend/teamManager/src/main/java/arc/teamManager/controllers/AuthController.java", auth);
}


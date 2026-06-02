package arc.teamManager.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import arc.teamManager.entities.Member;
import arc.teamManager.entities.OtpToken;
import arc.teamManager.models.LoginRequest;
import arc.teamManager.dto.RegisterRequest;
import arc.teamManager.repositories.MemberRepository;
import arc.teamManager.repositories.OtpTokenRepository;
import arc.teamManager.services.MemberService;
import arc.teamManager.services.EmailService;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            Member member = memberRepository.findByUsername(request.getUsername()).orElse(null);

            if (member == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            return ResponseEntity.ok(member.getMemberId()); // Return memberId or a token
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid mail or username or password");
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String mail = request.get("mail");
        String name = request.get("name");

        if (mail == null || mail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mail is required");
        }

        // Try to find the member by email
        Member member = memberRepository.findByMail(mail).orElse(null);

        if (member == null) {
            // Register a new member via Google if not found
            member = new Member();
            member.setMail(mail);
            
            // Ensure unique username
            String username = name.replaceAll("\\s+", "");
            if (memberService.usernameExists(username)) {
                username = username + new Random().nextInt(1000);
            }
            member.setUsername(username);
            
            // Generate dummy employee ID
            member.setEmployeeId("GOOG-" + new Random().nextInt(999999));
            
            // Set dummy password (they won't use it to login directly)
            member.setPassword(passwordEncoder.encode(Long.toHexString(new Random().nextLong())));
            member.setRole("USER");
            
            member = memberRepository.save(member);
        }

        return ResponseEntity.ok(member.getMemberId());
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
        String mail = request.get("mail");
        if (mail == null || mail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mail is required");
        }
        if (memberService.mailExists(mail)) {
            return ResponseEntity.ok().body("Mail already exists");
        }
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        OtpToken otpToken = new OtpToken();
        otpToken.setMail(mail);
        otpToken.setOtp(otp);
        otpToken.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpTokenRepository.save(otpToken);
        
        try {
            emailService.sendOtpEmail(mail, otp);
            return ResponseEntity.ok("OTP sent to email");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send OTP email");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (memberService.mailExists(request.getMail())) {
            return ResponseEntity.ok().body("Mail already exists");
        }
        if (memberService.employeeIdExists(request.getEmployeeId())) {
            return ResponseEntity.ok().body("Employee ID already exists");
        }
        if (memberService.usernameExists(request.getUsername())) {
            return ResponseEntity.ok().body("Username already exists");
        }

        // Verify OTP
        Optional<OtpToken> otpTokenOpt = otpTokenRepository.findById(request.getMail());
        if (!otpTokenOpt.isPresent()) {
            return ResponseEntity.badRequest().body("OTP not requested or expired");
        }

        OtpToken otpToken = otpTokenOpt.get();
        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpTokenRepository.delete(otpToken);
            return ResponseEntity.badRequest().body("OTP expired");
        }

        if (!otpToken.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        // Create Member
        Member member = new Member();
        member.setUsername(request.getUsername());
        member.setMail(request.getMail());
        member.setEmployeeId(request.getEmployeeId());
        member.setPassword(passwordEncoder.encode(request.getPassword()));
        member.setRole(request.getRole());

        Member savedMember = memberRepository.save(member);

        // Delete OTP after successful registration
        otpTokenRepository.delete(otpToken);

        return ResponseEntity.ok("User registered successfully with ID: " + savedMember.getMemberId());
    }
}

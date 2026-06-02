package arc.teamManager.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTaskAssignedEmail(String toEmail, String assignedBy, String taskTitle, String taskDescription) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("New Task Assigned: " + taskTitle);
        message.setText(
                "Hello,\n\n" +
                "A new task has been assigned to you.\n\n" +
                "Assigned By: " + assignedBy + "\n" +
                "Task Title: " + taskTitle + "\n" +
                "Description: " + taskDescription + "\n" +
                "Please check the application for more details.\n\n" +
                "Regards,\nTreeIt Team"
        );
        mailSender.send(message);
    }

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your OTP for Registration");
        message.setText(
                "Hello,\n\n" +
                "Your OTP for registration is: " + otp + "\n" +
                "This OTP will expire in 5 minutes.\n\n" +
                "Regards,\nTreeIt Team"
        );
        mailSender.send(message);
    }
}

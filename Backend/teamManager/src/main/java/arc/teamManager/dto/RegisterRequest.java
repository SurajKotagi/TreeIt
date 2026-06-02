package arc.teamManager.dto;

public class RegisterRequest {
    private String username;
    private String mail;
    private String employeeId;
    private String password;
    private String role;
    private String otp;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}

package arc.teamManager.dto;

public class MemberDTO {
    private Long memberId;
    private String username;
    private String avatarUrl; // ✨ NEW: Added avatarUrl field

    // ✨ UPDATED: Constructor now accepts avatarUrl
    public MemberDTO(Long memberId, String username, String avatarUrl) {
        this.memberId = memberId;
        this.username = username;
        this.avatarUrl = avatarUrl;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // ✨ NEW: Getter and Setter for avatarUrl
    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

}
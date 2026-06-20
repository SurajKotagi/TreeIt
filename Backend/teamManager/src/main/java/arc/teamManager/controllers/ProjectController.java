package arc.teamManager.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import arc.teamManager.dto.MemberDTO;
import arc.teamManager.dto.MemberIdsRequest;
import arc.teamManager.dto.ProjectDTO;
import arc.teamManager.entities.Member;
import arc.teamManager.entities.Project;
import arc.teamManager.repositories.MemberRepository;
import arc.teamManager.repositories.ProjectRepository;
import arc.teamManager.services.ProjectService;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private ProjectService projectService;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<MemberDTO>> getProjectMembers(@PathVariable Long projectId) {
        List<MemberDTO> members = projectService.getProjectMembers(projectId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/member/{memberId}")
    public List<Project> getProjectsByMemberId(@PathVariable Long memberId) {
        return projectService.getProjectsByMemberId(memberId);
    }

    @PostMapping
    public Project createProject(@RequestBody ProjectDTO projectDTO) {
        Member member = memberRepository.findById(projectDTO.getMemberId()).orElseThrow();
        Project project = new Project();
        project.setMember(member);
        project.setName(projectDTO.getName());
        List<Member> projectMembers = memberRepository.findAllById(projectDTO.getMemberIds());
        projectMembers.add(member);
        project.setMembers(projectMembers);

        Project savedProject = projectRepository.save(project);
        return savedProject;
    }

    @PutMapping("/{projectId}/add-members")
    public ResponseEntity<?> addMembersToProject(
            @PathVariable Long projectId,
            @RequestBody MemberIdsRequest request) {
        List<Long> memberIds = request.getMemberIds();
        projectService.addMembersToProject(projectId, memberIds);
        return ResponseEntity.ok("Members added successfully");
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok("Project deleted");
    }

    // 1. Endpoint to handle clicking the 3-dots "Mark as Completed"
    @PutMapping("/{projectId}/status")
    public ResponseEntity<?> updateProjectStatus(@PathVariable Long projectId,
            @RequestBody Map<String, String> payload) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setStatus(payload.get("status"));
        projectRepository.save(project);

        return ResponseEntity.ok(project);
    }

    // 2. Endpoint to handle Drag and Drop saving
    @PutMapping("/reorder")
    public ResponseEntity<?> reorderProjects(@RequestBody List<Map<String, Object>> payload) {
        for (Map<String, Object> item : payload) {
            Long projectId = Long.valueOf(item.get("projectId").toString());
            Integer sortOrder = Integer.valueOf(item.get("sortOrder").toString());

            Project project = projectRepository.findById(projectId).orElse(null);
            if (project != null) {
                project.setSortOrder(sortOrder);
                projectRepository.save(project);
            }
        }
        return ResponseEntity.ok().build();
    }

}

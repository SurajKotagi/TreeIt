package arc.teamManager.services;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import arc.teamManager.dto.MemberDTO;
import arc.teamManager.entities.Member;
import arc.teamManager.entities.Project;
import arc.teamManager.repositories.MemberRepository;
import arc.teamManager.repositories.ProjectRepository;

@Service
public class ProjectService {
    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    MemberRepository memberRepository;

    public List<MemberDTO> getProjectMembers(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Convert Member entities to DTOs
        return project.getMembers()
                .stream()
                .map(member -> new MemberDTO(member.getMemberId(), member.getUsername(), member.getAvatarUrl()))
                .collect(Collectors.toList());
    }

    public List<Project> getProjectsByMemberId(Long memberId) {
        Optional<Member> memberOpt = memberRepository.findById(memberId);
        if (memberOpt.isEmpty())
            return Collections.emptyList();

        Member member = memberOpt.get();

        // Use JPA to fetch all projects where the member is in the list
        return projectRepository.findProjectsVisibleToMember(member);
    }

    public void addMembersToProject(Long projectId, List<Long> memberIds) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<Member> users = memberRepository.findAllById(memberIds);
        project.getMembers().addAll(users);
        projectRepository.save(project);
    }

    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException("Project not found");
        }
        projectRepository.deleteById(projectId);
    }

}

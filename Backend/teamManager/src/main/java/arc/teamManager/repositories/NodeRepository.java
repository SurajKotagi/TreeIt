package arc.teamManager.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import arc.teamManager.entities.GraphNode;

@Repository
public interface NodeRepository extends JpaRepository<GraphNode, String> {
    List<GraphNode> findByProjectId(String projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM GraphNode n WHERE n.projectId = :projectId AND n.graphNodeId NOT IN :activeIds")
    void deleteGhostNodes(@Param("projectId") String projectId, @Param("activeIds") List<String> activeIds);

    @Modifying
    @Transactional
    @Query("DELETE FROM GraphNode n WHERE n.projectId = :projectId")
    void deleteAllByProjectId(@Param("projectId") String projectId);
}
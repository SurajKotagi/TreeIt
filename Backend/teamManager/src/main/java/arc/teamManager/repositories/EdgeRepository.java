package arc.teamManager.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import arc.teamManager.entities.GraphEdge;

@Repository
public interface EdgeRepository extends JpaRepository<GraphEdge, String> {
    List<GraphEdge> findByProjectId(String projectId);

    void deleteBySource(String source);

    void deleteByTarget(String target);

    @Modifying
    @Transactional
    @Query("DELETE FROM GraphEdge e WHERE e.projectId = :projectId AND e.graphEdgeId NOT IN :activeIds")
    void deleteGhostEdges(@Param("projectId") String projectId, @Param("activeIds") List<String> activeIds);

    @Modifying
    @Transactional
    @Query("DELETE FROM GraphEdge e WHERE e.projectId = :projectId")
    void deleteAllByProjectId(@Param("projectId") String projectId);
}
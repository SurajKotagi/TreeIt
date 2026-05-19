package arc.teamManager.services;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import arc.teamManager.dto.TodoRequest;
import arc.teamManager.entities.GraphNode;
import arc.teamManager.entities.Member;
import arc.teamManager.entities.Todo;
import arc.teamManager.repositories.MemberRepository;
import arc.teamManager.repositories.NodeRepository;
import arc.teamManager.repositories.TodoRepository;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepo;

    @Autowired
    private NodeRepository nodeRepo;

    @Autowired
    private MemberRepository memberRepo;

    Logger log = LoggerFactory.getLogger(this.getClass());

    public List<Todo> getTodosByNodeId(String nodeId) {
        log.info("Todos  from databse -->" + todoRepo.findByNode_GraphNodeId(nodeId));
        List<Todo> todos = todoRepo.findByNode_GraphNodeId(nodeId);
        return todos;
    }

    public Todo toggleTodo(Long todoId) {
        Todo todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        todo.setCompleted(!todo.isCompleted());
        return todoRepo.save(todo);
    }

    public GraphNode markNodeComplete(String nodeId) {
        GraphNode node = nodeRepo.findById(nodeId)
                .orElseThrow(() -> new RuntimeException("Node not found"));

        List<Todo> todos = todoRepo.findByNode_GraphNodeId(nodeId);

        boolean allDone = todos.stream().allMatch(Todo::isCompleted);
        if (!allDone) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "All todos must be completed before marking the node as completed.");
        }

        node.setStatus("completed");
        return nodeRepo.save(node);
    }

    public Todo addTodo(String nodeId, TodoRequest request, Long memberId) {
        GraphNode node = nodeRepo.findById(nodeId)
                .orElseThrow(() -> new RuntimeException("Graph node with ID " + nodeId + " not found"));

        Member creator = memberRepo.findMyMember(memberId)
                .orElseThrow(() -> new RuntimeException("Member with ID " + memberId + " not found"));
        Todo todo = new Todo();
        todo.setNode(node);
        todo.setTask(request.getTask());
        todo.setCompleted(false);
        todo.setCreatedBy(creator);
        todoRepo.save(todo);
        return todo;
    }
}

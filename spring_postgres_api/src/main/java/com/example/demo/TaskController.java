package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    private String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            return "unknown";
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("serverHost", getHostName());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("serverHost", getHostName());
        response.put("data", tasks);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(@RequestBody Task task) {
        Task savedTask = taskRepository.save(task);
        Map<String, Object> response = new HashMap<>();
        response.put("serverHost", getHostName());
        response.put("data", savedTask);
        response.put("message", "Task created successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

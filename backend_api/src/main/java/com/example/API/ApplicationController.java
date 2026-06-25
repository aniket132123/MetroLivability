package com.example.API;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApplicationController {
    @GetMapping("/hello")
    public String index(){
        return "Hola!";
    }

    @GetMapping("/data")
    public List<String> getData(){
        List<String> data = new ArrayList<>();
        data.add("Test 1");
        data.add("Test 2");
        data.add("Test 3");
        return data;
    }
}

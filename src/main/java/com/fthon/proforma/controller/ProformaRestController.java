package com.fthon.proforma.controller;

import com.fthon.proforma.model.Proforma;
import com.fthon.proforma.model.ProformaDetail;
import com.fthon.proforma.service.ProformaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proforma")
@CrossOrigin(origins = "*")
public class ProformaRestController {

    @Autowired
    private ProformaService proformaService;

    @GetMapping
    public ResponseEntity<List<Proforma>> getAllProformas() {
        return ResponseEntity.ok(proformaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proforma> getProformaById(@PathVariable Long id) {
        return ResponseEntity.ok(proformaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Proforma> createProforma(@RequestBody Proforma proforma) {
        return ResponseEntity.ok(proformaService.save(proforma));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proforma> updateProforma(@PathVariable Long id, @RequestBody Proforma proforma) {
        proforma.setId(id);
        return ResponseEntity.ok(proformaService.update(proforma));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProforma(@PathVariable Long id) {
        proformaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/details")
    public ResponseEntity<ProformaDetail> addDetail(@PathVariable Long id, @RequestBody ProformaDetail detail) {
        return ResponseEntity.ok(proformaService.addDetail(id, detail));
    }

    @GetMapping("/{id}/calculate")
    public ResponseEntity<Double> calculateTotal(@PathVariable Long id) {
        return ResponseEntity.ok(proformaService.calculateTotal(id));
    }
}


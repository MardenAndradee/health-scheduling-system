package com.tcc.triagem.controller;

import com.tcc.triagem.dto.AnamneseDTO;
import com.tcc.triagem.model.Anamnese;
import com.tcc.triagem.model.enums.NivelUrgencia;
import com.tcc.triagem.service.AnamneseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/anamneses")
@RequiredArgsConstructor
public class AnamneseController {

    private final AnamneseService anamneseService;

    @PostMapping
    public ResponseEntity<Anamnese> criar(@Valid @RequestBody AnamneseDTO dto) {
        Anamnese anamnese = anamneseService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(anamnese);
    }

    @GetMapping
    public ResponseEntity<List<Anamnese>> buscarTodos() {
        return ResponseEntity.ok(anamneseService.buscarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Anamnese> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(anamneseService.buscarPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Anamnese>> buscarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(anamneseService.buscarPorPaciente(pacienteId));
    }

    @GetMapping("/urgencia/{nivelUrgencia}")
    public ResponseEntity<List<Anamnese>> buscarPorNivelUrgencia(@PathVariable NivelUrgencia nivelUrgencia) {
        return ResponseEntity.ok(anamneseService.buscarPorNivelUrgencia(nivelUrgencia));
    }

    @GetMapping("/triagem")
    public ResponseEntity<List<Anamnese>> buscarOrdenadosPorUrgencia() {
        return ResponseEntity.ok(anamneseService.buscarOrdenadosPorUrgencia());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Anamnese> atualizar(@PathVariable Long id, @Valid @RequestBody AnamneseDTO dto) {
        Anamnese anamnese = anamneseService.atualizar(id, dto);
        return ResponseEntity.ok(anamnese);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        anamneseService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

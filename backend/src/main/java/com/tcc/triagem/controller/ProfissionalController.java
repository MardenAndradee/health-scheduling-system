package com.tcc.triagem.controller;

import com.tcc.triagem.dto.ProfissionalDTO;
import com.tcc.triagem.model.Profissional;
import com.tcc.triagem.service.ProfissionalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profissionais")
@RequiredArgsConstructor
public class ProfissionalController {

    private final ProfissionalService profissionalService;

    @PostMapping
    public ResponseEntity<Profissional> criar(@Valid @RequestBody ProfissionalDTO dto) {
        Profissional profissional = profissionalService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(profissional);
    }

    @GetMapping
    public ResponseEntity<List<Profissional>> buscarTodos() {
        return ResponseEntity.ok(profissionalService.buscarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profissional> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(profissionalService.buscarPorId(id));
    }

    @GetMapping("/crm/{crm}")
    public ResponseEntity<Profissional> buscarPorCrm(@PathVariable String crm) {
        return ResponseEntity.ok(profissionalService.buscarPorCrm(crm));
    }

    @GetMapping("/especialidade/{especialidade}")
    public ResponseEntity<List<Profissional>> buscarPorEspecialidade(@PathVariable String especialidade) {
        return ResponseEntity.ok(profissionalService.buscarPorEspecialidade(especialidade));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Profissional> atualizar(@PathVariable Long id, @Valid @RequestBody ProfissionalDTO dto) {
        Profissional profissional = profissionalService.atualizar(id, dto);
        return ResponseEntity.ok(profissional);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        profissionalService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

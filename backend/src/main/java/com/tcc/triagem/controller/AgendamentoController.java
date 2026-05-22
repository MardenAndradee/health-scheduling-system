package com.tcc.triagem.controller;

import com.tcc.triagem.dto.AgendamentoDTO;
import com.tcc.triagem.model.Agendamento;
import com.tcc.triagem.model.enums.StatusAgendamento;
import com.tcc.triagem.service.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @PostMapping
    public ResponseEntity<Agendamento> criar(@Valid @RequestBody AgendamentoDTO dto) {
        Agendamento agendamento = agendamentoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamento);
    }

    @GetMapping
    public ResponseEntity<List<Agendamento>> buscarTodos() {
        return ResponseEntity.ok(agendamentoService.buscarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.buscarPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Agendamento>> buscarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(agendamentoService.buscarPorPaciente(pacienteId));
    }

    @GetMapping("/profissional/{profissionalId}")
    public ResponseEntity<List<Agendamento>> buscarPorProfissional(@PathVariable Long profissionalId) {
        return ResponseEntity.ok(agendamentoService.buscarPorProfissional(profissionalId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Agendamento>> buscarPorStatus(@PathVariable StatusAgendamento status) {
        return ResponseEntity.ok(agendamentoService.buscarPorStatus(status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Agendamento> atualizar(@PathVariable Long id, @Valid @RequestBody AgendamentoDTO dto) {
        Agendamento agendamento = agendamentoService.atualizar(id, dto);
        return ResponseEntity.ok(agendamento);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Agendamento> atualizarStatus(@PathVariable Long id, @RequestParam StatusAgendamento status) {
        Agendamento agendamento = agendamentoService.atualizarStatus(id, status);
        return ResponseEntity.ok(agendamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        agendamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

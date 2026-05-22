package com.tcc.triagem.service;

import com.tcc.triagem.dto.AgendamentoDTO;
import com.tcc.triagem.exception.RecursoNaoEncontradoException;
import com.tcc.triagem.exception.RegraDeNegocioException;
import com.tcc.triagem.model.Agendamento;
import com.tcc.triagem.model.Paciente;
import com.tcc.triagem.model.Profissional;
import com.tcc.triagem.model.enums.StatusAgendamento;
import com.tcc.triagem.repository.AgendamentoRepository;
import com.tcc.triagem.repository.PacienteRepository;
import com.tcc.triagem.repository.ProfissionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfissionalRepository profissionalRepository;

    @Transactional
    public Agendamento criar(AgendamentoDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        Profissional profissional = profissionalRepository.findById(dto.getProfissionalId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Profissional", dto.getProfissionalId()));

        if (dto.getDataConsulta().isBefore(LocalDateTime.now())) {
            throw new RegraDeNegocioException("A data da consulta não pode ser no passado.");
        }

        Agendamento agendamento = Agendamento.builder()
                .dataConsulta(dto.getDataConsulta())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusAgendamento.AGENDADO)
                .observacoes(dto.getObservacoes())
                .paciente(paciente)
                .profissional(profissional)
                .build();

        return agendamentoRepository.save(agendamento);
    }

    @Transactional(readOnly = true)
    public List<Agendamento> buscarTodos() {
        return agendamentoRepository.findAllByOrderByDataConsultaAsc();
    }

    @Transactional(readOnly = true)
    public Agendamento buscarPorId(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento", id));
    }

    @Transactional(readOnly = true)
    public List<Agendamento> buscarPorPaciente(Long pacienteId) {
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new RecursoNaoEncontradoException("Paciente", pacienteId);
        }
        return agendamentoRepository.findByPacienteId(pacienteId);
    }

    @Transactional(readOnly = true)
    public List<Agendamento> buscarPorProfissional(Long profissionalId) {
        if (!profissionalRepository.existsById(profissionalId)) {
            throw new RecursoNaoEncontradoException("Profissional", profissionalId);
        }
        return agendamentoRepository.findByProfissionalId(profissionalId);
    }

    @Transactional(readOnly = true)
    public List<Agendamento> buscarPorStatus(StatusAgendamento status) {
        return agendamentoRepository.findByStatus(status);
    }

    @Transactional
    public Agendamento atualizar(Long id, AgendamentoDTO dto) {
        Agendamento agendamento = buscarPorId(id);

        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        Profissional profissional = profissionalRepository.findById(dto.getProfissionalId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Profissional", dto.getProfissionalId()));

        agendamento.setDataConsulta(dto.getDataConsulta());
        agendamento.setStatus(dto.getStatus() != null ? dto.getStatus() : agendamento.getStatus());
        agendamento.setObservacoes(dto.getObservacoes());
        agendamento.setPaciente(paciente);
        agendamento.setProfissional(profissional);

        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento atualizarStatus(Long id, StatusAgendamento status) {
        Agendamento agendamento = buscarPorId(id);
        agendamento.setStatus(status);
        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public void deletar(Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Agendamento", id);
        }
        agendamentoRepository.deleteById(id);
    }
}

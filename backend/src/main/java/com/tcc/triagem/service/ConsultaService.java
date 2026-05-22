package com.tcc.triagem.service;

import com.tcc.triagem.dto.ConsultaDTO;
import com.tcc.triagem.exception.RecursoNaoEncontradoException;
import com.tcc.triagem.model.Consulta;
import com.tcc.triagem.model.Paciente;
import com.tcc.triagem.model.Profissional;
import com.tcc.triagem.repository.ConsultaRepository;
import com.tcc.triagem.repository.PacienteRepository;
import com.tcc.triagem.repository.ProfissionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfissionalRepository profissionalRepository;

    @Transactional
    public Consulta criar(ConsultaDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        Profissional profissional = profissionalRepository.findById(dto.getProfissionalId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Profissional", dto.getProfissionalId()));

        Consulta consulta = Consulta.builder()
                .diagnostico(dto.getDiagnostico())
                .prescricao(dto.getPrescricao())
                .dataConsulta(dto.getDataConsulta() != null ? dto.getDataConsulta() : LocalDateTime.now())
                .observacoes(dto.getObservacoes())
                .paciente(paciente)
                .profissional(profissional)
                .build();

        return consultaRepository.save(consulta);
    }

    @Transactional(readOnly = true)
    public List<Consulta> buscarTodos() {
        return consultaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Consulta buscarPorId(Long id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta", id));
    }

    @Transactional(readOnly = true)
    public List<Consulta> buscarPorPaciente(Long pacienteId) {
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new RecursoNaoEncontradoException("Paciente", pacienteId);
        }
        return consultaRepository.findByPacienteIdOrderByDataConsultaDesc(pacienteId);
    }

    @Transactional(readOnly = true)
    public List<Consulta> buscarPorProfissional(Long profissionalId) {
        if (!profissionalRepository.existsById(profissionalId)) {
            throw new RecursoNaoEncontradoException("Profissional", profissionalId);
        }
        return consultaRepository.findByProfissionalIdOrderByDataConsultaDesc(profissionalId);
    }

    @Transactional
    public Consulta atualizar(Long id, ConsultaDTO dto) {
        Consulta consulta = buscarPorId(id);

        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        Profissional profissional = profissionalRepository.findById(dto.getProfissionalId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Profissional", dto.getProfissionalId()));

        consulta.setDiagnostico(dto.getDiagnostico());
        consulta.setPrescricao(dto.getPrescricao());
        consulta.setObservacoes(dto.getObservacoes());
        if (dto.getDataConsulta() != null) {
            consulta.setDataConsulta(dto.getDataConsulta());
        }
        consulta.setPaciente(paciente);
        consulta.setProfissional(profissional);

        return consultaRepository.save(consulta);
    }

    @Transactional
    public void deletar(Long id) {
        if (!consultaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Consulta", id);
        }
        consultaRepository.deleteById(id);
    }
}

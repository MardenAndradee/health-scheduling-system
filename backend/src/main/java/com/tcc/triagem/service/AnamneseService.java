package com.tcc.triagem.service;

import com.tcc.triagem.dto.AnamneseDTO;
import com.tcc.triagem.exception.RecursoNaoEncontradoException;
import com.tcc.triagem.model.Anamnese;
import com.tcc.triagem.model.Paciente;
import com.tcc.triagem.model.enums.NivelUrgencia;
import com.tcc.triagem.repository.AnamneseRepository;
import com.tcc.triagem.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnamneseService {

    private final AnamneseRepository anamneseRepository;
    private final PacienteRepository pacienteRepository;

    @Transactional
    public Anamnese criar(AnamneseDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        Anamnese anamnese = Anamnese.builder()
                .sintomas(dto.getSintomas())
                .observacoes(dto.getObservacoes())
                .nivelUrgencia(dto.getNivelUrgencia())
                .dataRegistro(LocalDateTime.now())
                .paciente(paciente)
                .build();

        return anamneseRepository.save(anamnese);
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarTodos() {
        return anamneseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Anamnese buscarPorId(Long id) {
        return anamneseRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Anamnese", id));
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarPorPaciente(Long pacienteId) {
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new RecursoNaoEncontradoException("Paciente", pacienteId);
        }
        return anamneseRepository.findByPacienteIdOrderByDataRegistroDesc(pacienteId);
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarPorNivelUrgencia(NivelUrgencia nivelUrgencia) {
        return anamneseRepository.findByNivelUrgencia(nivelUrgencia);
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarOrdenadosPorUrgencia() {
        return anamneseRepository.findAllOrdenadosPorUrgencia();
    }

    @Transactional
    public Anamnese atualizar(Long id, AnamneseDTO dto) {
        Anamnese anamnese = buscarPorId(id);

        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        anamnese.setSintomas(dto.getSintomas());
        anamnese.setObservacoes(dto.getObservacoes());
        anamnese.setNivelUrgencia(dto.getNivelUrgencia());
        anamnese.setPaciente(paciente);

        return anamneseRepository.save(anamnese);
    }

    @Transactional
    public void deletar(Long id) {
        if (!anamneseRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Anamnese", id);
        }
        anamneseRepository.deleteById(id);
    }
}

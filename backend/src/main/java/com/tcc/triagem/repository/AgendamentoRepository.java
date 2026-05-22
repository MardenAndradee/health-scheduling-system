package com.tcc.triagem.repository;

import com.tcc.triagem.model.Agendamento;
import com.tcc.triagem.model.enums.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByPacienteId(Long pacienteId);

    List<Agendamento> findByProfissionalId(Long profissionalId);

    List<Agendamento> findByStatus(StatusAgendamento status);

    List<Agendamento> findByDataConsultaBetween(LocalDateTime inicio, LocalDateTime fim);

    List<Agendamento> findByProfissionalIdAndDataConsultaBetween(Long profissionalId, LocalDateTime inicio, LocalDateTime fim);

    List<Agendamento> findByPacienteIdAndStatus(Long pacienteId, StatusAgendamento status);

    List<Agendamento> findAllByOrderByDataConsultaAsc();
}

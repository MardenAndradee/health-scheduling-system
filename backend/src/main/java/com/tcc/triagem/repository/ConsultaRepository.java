package com.tcc.triagem.repository;

import com.tcc.triagem.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByPacienteId(Long pacienteId);

    List<Consulta> findByProfissionalId(Long profissionalId);

    List<Consulta> findByDataConsultaBetween(LocalDateTime inicio, LocalDateTime fim);

    List<Consulta> findByPacienteIdOrderByDataConsultaDesc(Long pacienteId);

    List<Consulta> findByProfissionalIdOrderByDataConsultaDesc(Long profissionalId);
}

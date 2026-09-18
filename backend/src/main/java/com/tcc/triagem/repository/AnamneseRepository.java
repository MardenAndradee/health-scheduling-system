package com.tcc.triagem.repository;

import com.tcc.triagem.model.Anamnese;
import com.tcc.triagem.model.enums.NivelUrgencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnamneseRepository extends JpaRepository<Anamnese, Long> {

    List<Anamnese> findByPacienteId(Long pacienteId);

    List<Anamnese> findByNivelUrgencia(NivelUrgencia nivelUrgencia);

    List<Anamnese> findByDataRegistroBetween(LocalDateTime inicio, LocalDateTime fim);

    // Ordem de gravidade real do Protocolo de Manchester: Verde é mais
    // urgente que Azul (ver NivelUrgencia).
    @Query("SELECT a FROM Anamnese a WHERE NOT EXISTS " +
           "(SELECT 1 FROM Agendamento ag WHERE ag.anamnese = a) " +
           "ORDER BY CASE a.nivelUrgencia " +
           "WHEN 'VERMELHO' THEN 1 WHEN 'LARANJA' THEN 2 WHEN 'AMARELO' THEN 3 " +
           "WHEN 'VERDE' THEN 4 WHEN 'AZUL' THEN 5 END, a.dataRegistro ASC")
    List<Anamnese> findAllOrdenadosPorUrgencia();

    List<Anamnese> findByPacienteIdOrderByDataRegistroDesc(Long pacienteId);
}

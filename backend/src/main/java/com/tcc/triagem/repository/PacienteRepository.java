package com.tcc.triagem.repository;

import com.tcc.triagem.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    List<Paciente> findByNomeContainingIgnoreCase(String nome);

    // Ordenação por CASE (não pelo enum direto): EnumType.STRING ordenaria
    // alfabeticamente, o que não reflete a gravidade real do Protocolo de
    // Manchester (mesmo problema já corrigido em AnamneseRepository).
    @Query("SELECT p FROM Paciente p JOIN p.anamneses a " +
           "WHERE a.nivelUrgencia = 'VERMELHO' OR a.nivelUrgencia = 'LARANJA' " +
           "ORDER BY CASE a.nivelUrgencia WHEN 'VERMELHO' THEN 1 WHEN 'LARANJA' THEN 2 END")
    List<Paciente> findPacientesUrgentes();
}

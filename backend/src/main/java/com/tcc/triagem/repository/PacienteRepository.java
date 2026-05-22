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

    @Query("SELECT p FROM Paciente p JOIN p.anamneses a WHERE a.nivelUrgencia = 'VERMELHO' OR a.nivelUrgencia = 'LARANJA' ORDER BY a.nivelUrgencia DESC")
    List<Paciente> findPacientesUrgentes();
}

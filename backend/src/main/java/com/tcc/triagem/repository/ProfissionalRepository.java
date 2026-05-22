package com.tcc.triagem.repository;

import com.tcc.triagem.model.Profissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfissionalRepository extends JpaRepository<Profissional, Long> {

    Optional<Profissional> findByCrm(String crm);

    boolean existsByCrm(String crm);

    List<Profissional> findByEspecialidadeContainingIgnoreCase(String especialidade);

    List<Profissional> findByCargo(String cargo);
}

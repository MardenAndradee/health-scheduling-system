package com.tcc.triagem.dto;

import com.tcc.triagem.model.enums.StatusAgendamento;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgendamentoDTO {

    private Long id;

    @NotNull(message = "Data da consulta é obrigatória")
    private LocalDateTime dataConsulta;

    private StatusAgendamento status;

    private String observacoes;

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "ID do profissional é obrigatório")
    private Long profissionalId;
}

package com.tcc.triagem.dto;

import com.tcc.triagem.model.enums.NivelUrgencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnamneseDTO {

    private Long id;

    @NotBlank(message = "Sintomas são obrigatórios")
    private String sintomas;

    private String observacoes;

    @NotNull(message = "Nível de urgência é obrigatório")
    private NivelUrgencia nivelUrgencia;

    private LocalDateTime dataRegistro;

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;
}

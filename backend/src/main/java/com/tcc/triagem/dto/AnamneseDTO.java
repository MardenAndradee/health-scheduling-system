package com.tcc.triagem.dto;

import com.tcc.triagem.model.enums.NivelUrgencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

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

    private NivelUrgencia nivelUrgencia;

    private LocalDateTime dataRegistro;

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    private String especialidadeId;

    private Integer idade;

    private Map<String, Map<String, Object>> respostas;
}

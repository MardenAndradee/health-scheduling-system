package com.tcc.triagem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfissionalDTO {

    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    private String email;

    // Sem @NotBlank de propósito: obrigatória só na criação (checado em
    // ProfissionalService.criar). Em branco na atualização significa "manter
    // a senha atual" — ver ProfissionalService.atualizar.
    private String senha;

    @NotBlank(message = "Especialidade é obrigatória")
    private String especialidade;

    private String crm;

    private String cargo;
}

package com.tcc.triagem.security.dto;

import com.tcc.triagem.model.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private String token;
    private String tipo;
    private Long id;
    private String nome;
    private String email;
    private TipoUsuario tipoUsuario;
}

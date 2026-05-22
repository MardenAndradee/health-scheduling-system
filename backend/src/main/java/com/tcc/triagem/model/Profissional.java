package com.tcc.triagem.model;

import com.tcc.triagem.model.enums.TipoUsuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profissionais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Profissional extends Usuario {

    @NotBlank(message = "Especialidade é obrigatória")
    @Column(nullable = false, length = 100)
    private String especialidade;

    @Column(length = 20, unique = true)
    private String crm;

    @Column(length = 100)
    private String cargo;

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Agendamento> agendamentos = new ArrayList<>();

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Consulta> consultas = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (getTipoUsuario() == null) {
            setTipoUsuario(TipoUsuario.PROFISSIONAL);
        }
    }
}

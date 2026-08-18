package com.tcc.triagem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tcc.triagem.model.enums.TipoUsuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Paciente extends Usuario {

    @NotBlank(message = "CPF é obrigatório")
    @Size(min = 11, max = 14, message = "CPF deve ter entre 11 e 14 caracteres")
    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(length = 20)
    private String telefone;

    @Column(length = 255)
    private String endereco;

    @NotNull(message = "Data de nascimento é obrigatória")
    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    // @JsonIgnore evita recursão infinita na serialização: Anamnese/Agendamento/
    // Consulta já trazem o próprio `paciente` embutido, então o lado "many" não
    // precisa (e não pode, sob risco de StackOverflow) ser serializado de volta.
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Anamnese> anamneses = new ArrayList<>();

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Agendamento> agendamentos = new ArrayList<>();

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Consulta> consultas = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (getTipoUsuario() == null) {
            setTipoUsuario(TipoUsuario.PACIENTE);
        }
    }
}

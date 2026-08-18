# Modelo de Dados

## Diagrama entidade-relacionamento

```mermaid
erDiagram
    USUARIO ||--o| PACIENTE : "herança (JOINED)"
    USUARIO ||--o| PROFISSIONAL : "herança (JOINED)"
    PACIENTE ||--o{ ANAMNESE : possui
    PACIENTE ||--o{ AGENDAMENTO : possui
    PACIENTE ||--o{ CONSULTA : possui
    PROFISSIONAL ||--o{ AGENDAMENTO : atende
    PROFISSIONAL ||--o{ CONSULTA : realiza

    USUARIO {
        Long id PK
        String nome
        String email UK
        String senha
        TipoUsuario tipoUsuario
    }
    PACIENTE {
        Long usuario_id PK_FK
        String cpf UK
        String telefone
        String endereco
        LocalDate dataNascimento
    }
    PROFISSIONAL {
        Long usuario_id PK_FK
        String especialidade
        String crm UK
        String cargo
    }
    ANAMNESE {
        Long id PK
        String sintomas
        String observacoes
        NivelUrgencia nivelUrgencia
        LocalDateTime dataRegistro
        Long paciente_id FK
    }
    AGENDAMENTO {
        Long id PK
        LocalDateTime dataConsulta
        StatusAgendamento status
        String observacoes
        Long paciente_id FK
        Long profissional_id FK
    }
    CONSULTA {
        Long id PK
        String diagnostico
        String prescricao
        LocalDateTime dataConsulta
        String observacoes
        Long paciente_id FK
        Long profissional_id FK
    }
```

## Entidades

### `Usuario` (tabela `usuarios`)

Classe base de toda autenticação, mapeada com `@Inheritance(strategy = InheritanceType.JOINED)` — ou seja, existe uma tabela `usuarios` com os campos comuns, e `Paciente`/`Profissional` têm tabelas próprias ligadas por chave estrangeira ao `id` do usuário (`@PrimaryKeyJoinColumn(name = "usuario_id")`).

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `Long` | PK, auto incremento (`IDENTITY`) |
| `nome` | `String` | obrigatório |
| `email` | `String` | obrigatório, único, formato de e-mail válido |
| `senha` | `String` | obrigatório, armazenado com hash **BCrypt** |
| `tipoUsuario` | `TipoUsuario` (enum) | obrigatório — `ADMIN`, `PACIENTE` ou `PROFISSIONAL` |

### `Paciente` (tabela `pacientes`, estende `Usuario`)

| Campo | Tipo | Regras |
|---|---|---|
| `cpf` | `String` | obrigatório, único, 11–14 caracteres |
| `telefone` | `String` | opcional |
| `endereco` | `String` | opcional |
| `dataNascimento` | `LocalDate` | obrigatório |
| `anamneses` | `List<Anamnese>` | 1:N, cascade `ALL` + `orphanRemoval` |
| `agendamentos` | `List<Agendamento>` | 1:N, cascade `ALL` + `orphanRemoval` |
| `consultas` | `List<Consulta>` | 1:N, cascade `ALL` + `orphanRemoval` |

`tipoUsuario` é definido automaticamente como `PACIENTE` no `@PrePersist` se não informado.

### `Profissional` (tabela `profissionais`, estende `Usuario`)

| Campo | Tipo | Regras |
|---|---|---|
| `especialidade` | `String` | obrigatório |
| `crm` | `String` | opcional, único |
| `cargo` | `String` | opcional (ex.: médico, enfermeira, secretária) |
| `agendamentos` | `List<Agendamento>` | 1:N, cascade `ALL` + `orphanRemoval` |
| `consultas` | `List<Consulta>` | 1:N, cascade `ALL` + `orphanRemoval` |

`tipoUsuario` é definido automaticamente como `PROFISSIONAL` no `@PrePersist` se não informado.

> O campo `cargo` (texto livre) é o que hoje diferencia, na prática, enfermeira / secretária / médico dentro do papel `PROFISSIONAL` — não existe um enum de cargo dedicado.

### `Anamnese` (tabela `anamneses`)

Registro da triagem: o relato de sintomas do paciente e a classificação de urgência resultante.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `Long` | PK |
| `sintomas` | `String` (TEXT) | obrigatório |
| `observacoes` | `String` (TEXT) | opcional |
| `nivelUrgencia` | `NivelUrgencia` (enum) | obrigatório |
| `dataRegistro` | `LocalDateTime` | preenchido automaticamente (`@PrePersist`) se não informado |
| `paciente` | `Paciente` | obrigatório (`ManyToOne`) |

### `Agendamento` (tabela `agendamentos`)

Um horário marcado entre paciente e profissional.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `Long` | PK |
| `dataConsulta` | `LocalDateTime` | obrigatório; **não pode estar no passado** na criação (regra de negócio no service) |
| `status` | `StatusAgendamento` (enum) | obrigatório, padrão `AGENDADO` |
| `observacoes` | `String` (TEXT) | opcional |
| `paciente` | `Paciente` | obrigatório |
| `profissional` | `Profissional` | obrigatório |

### `Consulta` (tabela `consultas`)

Registro clínico do atendimento efetivamente realizado.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `Long` | PK |
| `diagnostico` | `String` (TEXT) | opcional |
| `prescricao` | `String` (TEXT) | opcional |
| `dataConsulta` | `LocalDateTime` | obrigatório; preenchida com `now()` se ausente (`@PrePersist`) |
| `observacoes` | `String` (TEXT) | opcional |
| `paciente` | `Paciente` | obrigatório |
| `profissional` | `Profissional` | obrigatório |

## Enums

### `TipoUsuario`

```
ADMIN | PACIENTE | PROFISSIONAL
```

Define o papel do usuário e, por consequência, sua *authority* no Spring Security (`ROLE_ADMIN`, `ROLE_PACIENTE`, `ROLE_PROFISSIONAL`).

### `NivelUrgencia`

Escala de classificação de risco, do menos ao mais grave (inspirada no Protocolo de Manchester):

| Valor | Significado |
|---|---|
| `VERDE` | Não urgente |
| `AZUL` | Pouco urgente |
| `AMARELO` | Urgente |
| `LARANJA` | Muito urgente |
| `VERMELHO` | Emergência |

### `StatusAgendamento`

```
AGENDADO → CONFIRMADO → EM_ATENDIMENTO → CONCLUIDO
                                        ↘ CANCELADO
                                        ↘ FALTOU
```

O sistema não impõe transições de estado no código atual (o status pode ser alterado livremente via `PATCH /agendamentos/{id}/status`); a sequência acima é o fluxo esperado de uso.

## Regra de priorização da fila

A ordenação da fila de triagem por gravidade **não é um campo persistido** — é calculada em tempo de consulta pelo `AnamneseRepository`:

```sql
SELECT a FROM Anamnese a ORDER BY CASE a.nivelUrgencia
    WHEN 'VERMELHO' THEN 1
    WHEN 'LARANJA'  THEN 2
    WHEN 'AMARELO'  THEN 3
    WHEN 'AZUL'     THEN 4
    WHEN 'VERDE'    THEN 5
END, a.dataRegistro ASC
```

Ou seja: primeiro por urgência (`VERMELHO` mais prioritário), e dentro do mesmo nível, por ordem de chegada (`dataRegistro` crescente — FIFO). Essa consulta alimenta o endpoint `GET /anamneses/triagem`.

De forma semelhante, `PacienteRepository.findPacientesUrgentes()` retorna os pacientes que têm ao menos uma anamnese `VERMELHO` ou `LARANJA`, usado no endpoint `GET /pacientes/urgentes`.

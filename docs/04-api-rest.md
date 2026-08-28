# API REST

## Convenções gerais

- **Base URL:** `http://localhost:8080/api` (porta e `context-path` definidos em `application.properties`; ver [Guia de Instalação](07-guia-instalacao.md)).
- **Formato:** JSON (`Content-Type: application/json`) em request e response.
- **Autenticação:** header `Authorization: Bearer <token>` obtido em `/auth/login` ou `/auth/registrar`. Detalhes em [Autenticação e Autorização](05-autenticacao-autorizacao.md).
- **Datas:** `LocalDate` como `"YYYY-MM-DD"`, `LocalDateTime` como `"YYYY-MM-DDTHH:mm:ss"` (padrão de serialização do Jackson para `java.time`).

### Formato padrão de erro

Todas as exceções de domínio são convertidas pelo `GlobalExceptionHandler` num corpo JSON consistente:

```json
{
  "timestamp": "2026-08-18T10:15:30",
  "status": 404,
  "erro": "Recurso não encontrado",
  "mensagem": "Paciente com id 42 não encontrado(a)."
}
```

| Situação | Status HTTP | `erro` |
|---|---|---|
| Entidade não encontrada (`RecursoNaoEncontradoException`) | 404 | "Recurso não encontrado" |
| Violação de regra de negócio (`RegraDeNegocioException`) — ex.: CPF/e-mail duplicado, data no passado | 400 | "Violação de regra de negócio" |
| Falha de validação de campos (`@Valid`) | 422 | "Erro de validação" (traz também um mapa `campos` com `{campo: mensagem}`) |
| Erro não tratado | 500 | "Erro interno do servidor" |

## Autenticação — `/auth`

Rotas públicas (não exigem token).

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Autentica e retorna um token JWT |
| `POST` | `/auth/registrar` | Cria um novo `Usuario` genérico e já retorna o token (login automático) |

**`POST /auth/login`**

```json
// Request
{ "email": "usuario@exemplo.com", "senha": "123456" }
```
```json
// Response 200
{
  "token": "eyJhbGciOi...",
  "tipo": "Bearer",
  "id": 1,
  "nome": "Maria Silva",
  "email": "usuario@exemplo.com",
  "tipoUsuario": "PROFISSIONAL"
}
```
Erro: `400` com mensagem "Email ou senha inválidos." se as credenciais forem inválidas.

**`POST /auth/registrar`**

```json
// Request
{
  "nome": "Maria Silva",
  "email": "usuario@exemplo.com",
  "senha": "123456",
  "tipoUsuario": "PROFISSIONAL"
}
```
Response `201` no mesmo formato de `LoginResponseDTO` acima.

> Este endpoint cria apenas um `Usuario` base (sem CPF, CRM etc.) — hoje é usado só para criar contas `ADMIN`/`PROFISSIONAL` diretamente via API, já que não há tela própria para isso. Para cadastrar um paciente completo (com CPF, data de nascimento etc.), use `POST /pacientes`, que é público — mas **não retorna token**: o cliente encadeia uma chamada a `POST /auth/login` em seguida (é o que a tela de cadastro do frontend faz).

## Usuários — `/usuarios`

CRUD genérico sobre a tabela base `usuarios` (todos os tipos).

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/usuarios` | Cria um usuário | autenticado |
| `GET` | `/usuarios` | Lista todos os usuários | autenticado |
| `GET` | `/usuarios/{id}` | Busca por id | autenticado |
| `GET` | `/usuarios/email/{email}` | Busca por e-mail | autenticado |
| `GET` | `/usuarios/tipo/{tipoUsuario}` | Lista por tipo (`ADMIN`\|`PACIENTE`\|`PROFISSIONAL`) | autenticado |
| `PUT` | `/usuarios/{id}` | Atualiza (senha é sempre re-hasheada) | autenticado |
| `DELETE` | `/usuarios/{id}` | Remove | **ADMIN** |

`UsuarioDTO`: `{ nome, email, senha, tipoUsuario }` (`id` opcional em criação).

## Pacientes — `/pacientes`

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/pacientes` | Cadastra paciente (valida CPF e e-mail únicos) | **público** (auto-cadastro) |
| `GET` | `/pacientes` | Lista todos | autenticado |
| `GET` | `/pacientes/{id}` | Busca por id | autenticado |
| `GET` | `/pacientes/cpf/{cpf}` | Busca por CPF | autenticado |
| `GET` | `/pacientes/nome/{nome}` | Busca por nome (contém, case-insensitive) | autenticado |
| `GET` | `/pacientes/urgentes` | Pacientes com anamnese `VERMELHO` ou `LARANJA` | **ADMIN, PROFISSIONAL** |
| `PUT` | `/pacientes/{id}` | Atualiza cadastro | autenticado |
| `DELETE` | `/pacientes/{id}` | Remove paciente (cascade em anamneses/agendamentos/consultas) | autenticado |

`PacienteDTO`: `{ nome, email, senha, cpf, telefone, endereco, dataNascimento }`.

## Profissionais — `/profissionais`

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/profissionais` | Cadastra profissional (valida e-mail e CRM únicos) | **ADMIN** |
| `GET` | `/profissionais` | Lista todos | autenticado |
| `GET` | `/profissionais/{id}` | Busca por id | autenticado |
| `GET` | `/profissionais/crm/{crm}` | Busca por CRM | autenticado |
| `GET` | `/profissionais/especialidade/{especialidade}` | Busca por especialidade (contém, case-insensitive) | autenticado |
| `PUT` | `/profissionais/{id}` | Atualiza cadastro | **ADMIN** |
| `DELETE` | `/profissionais/{id}` | Remove | **ADMIN** |

`ProfissionalDTO`: `{ nome, email, senha, especialidade, crm, cargo }`.

## Anamneses (triagem) — `/anamneses`

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/anamneses` | Registra uma anamnese para um paciente | autenticado |
| `GET` | `/anamneses` | Lista todas | autenticado |
| `GET` | `/anamneses/{id}` | Busca por id | autenticado |
| `GET` | `/anamneses/paciente/{pacienteId}` | Histórico do paciente (mais recente primeiro) | autenticado |
| `GET` | `/anamneses/urgencia/{nivelUrgencia}` | Filtra por nível de urgência | autenticado |
| `GET` | `/anamneses/triagem` | **Fila de triagem** — todas as anamneses ordenadas por urgência e depois por ordem de chegada | **ADMIN, PROFISSIONAL** |
| `PUT` | `/anamneses/{id}` | Atualiza | autenticado |
| `DELETE` | `/anamneses/{id}` | Remove | autenticado |

`AnamneseDTO`: `{ sintomas, observacoes, nivelUrgencia?, pacienteId, especialidadeId?, idade?, respostas? }`.

`nivelUrgencia` é opcional e a API aceita dois caminhos mutuamente exclusivos
para defini-lo — resolvidos em `AnamneseService.resolverNivelUrgencia`:

- **Manual** (usado hoje pela área do profissional): envia `nivelUrgencia`
  diretamente, sem `especialidadeId`/`respostas`.
- **Calculado a partir da triagem por especialidade** (usado pelo wizard do
  paciente): envia `especialidadeId` + `idade` + `respostas`
  (`Map<grupoId, Map<perguntaId, valor>>`, espelhando as perguntas de
  `frontend/lib/especialidades/config.ts`) e **não** envia `nivelUrgencia` —
  o backend calcula via `AnamneseService.defineUrgencia`, que despacha para
  um método por especialidade (`calcularUrgencia<Especialidade>`). Os pesos
  de cada especialidade ainda são um placeholder (todos retornam `VERDE`) até
  serem implementados.

Se nenhum dos dois vier preenchido, a API responde `400`
(`RegraDeNegocioException`).

```json
// POST /anamneses — exemplo (fluxo manual)
{
  "sintomas": "Dor forte no peito e falta de ar",
  "observacoes": "Paciente relata início súbito há 20 minutos",
  "nivelUrgencia": "VERMELHO",
  "pacienteId": 7
}
```

```json
// POST /anamneses — exemplo (wizard do paciente, nível calculado no backend)
{
  "sintomas": "[Clínico Geral] dor forte no peito",
  "observacoes": "...",
  "pacienteId": 7,
  "especialidadeId": "clinico_geral",
  "idade": 45,
  "respostas": {
    "sintomas_alarme": { "sinais_alarme": ["dor_peito"] },
    "intensidade_evolucao": { "intensidade_dor": 9, "dor_subita": true, "febre_vomitos": [] }
  }
}
```

## Agendamentos — `/agendamentos`

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/agendamentos` | Cria agendamento (data não pode ser no passado) | autenticado |
| `GET` | `/agendamentos` | Lista todos (ordenados por data) | autenticado |
| `GET` | `/agendamentos/{id}` | Busca por id | autenticado |
| `GET` | `/agendamentos/paciente/{pacienteId}` | Agendamentos de um paciente | autenticado |
| `GET` | `/agendamentos/profissional/{profissionalId}` | Agenda de um profissional | autenticado |
| `GET` | `/agendamentos/status/{status}` | Filtra por status | autenticado |
| `PUT` | `/agendamentos/{id}` | Atualiza dados do agendamento | autenticado |
| `PATCH` | `/agendamentos/{id}/status?status=CONFIRMADO` | Atualiza somente o status | autenticado |
| `DELETE` | `/agendamentos/{id}` | Remove | autenticado |

`AgendamentoDTO`: `{ dataConsulta, status, observacoes, pacienteId, profissionalId }` (`status` é opcional na criação; padrão `AGENDADO`).

## Consultas — `/consultas`

Registro clínico do atendimento (diagnóstico/prescrição), tipicamente criado após um agendamento ser concluído.

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/consultas` | Registra uma consulta | autenticado |
| `GET` | `/consultas` | Lista todas | autenticado |
| `GET` | `/consultas/{id}` | Busca por id | autenticado |
| `GET` | `/consultas/paciente/{pacienteId}` | Histórico do paciente (mais recente primeiro) | autenticado |
| `GET` | `/consultas/profissional/{profissionalId}` | Histórico do profissional (mais recente primeiro) | autenticado |
| `PUT` | `/consultas/{id}` | Atualiza | autenticado |
| `DELETE` | `/consultas/{id}` | Remove | autenticado |

`ConsultaDTO`: `{ diagnostico, prescricao, dataConsulta, observacoes, pacienteId, profissionalId }` (`dataConsulta` é opcional; padrão `now()`).

## Resumo de autorização por rota

A coluna "Acesso" acima reflete as regras configuradas em `SecurityConfig`. Fora as exceções explícitas na tabela abaixo, **toda rota exige autenticação** (`anyRequest().authenticated()`) — não há hoje nenhuma rota com regras específicas para o papel `PACIENTE` isoladamente. Ver detalhes e lacunas em [Autenticação e Autorização](05-autenticacao-autorizacao.md).

| Regra | Rotas |
|---|---|
| Pública (sem token) | `POST/GET /auth/**`, `POST /pacientes` |
| Somente `ADMIN` | `POST/PUT/DELETE /profissionais/**`, `DELETE /usuarios/**` |
| `ADMIN` ou `PROFISSIONAL` | `GET /anamneses/triagem`, `GET /pacientes/urgentes` |
| Qualquer usuário autenticado | todas as demais rotas |

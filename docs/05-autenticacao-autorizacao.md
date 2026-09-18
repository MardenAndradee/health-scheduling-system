# Autenticação e Autorização

## Visão geral

A API usa **autenticação stateless baseada em JWT** (JSON Web Token). Não há sessão de servidor. O token viaja de duas formas, aceitas em paralelo pelo `JwtAuthenticationFilter`:

- **Cookie `HttpOnly`** (`triagem_token`, nome configurável em `jwt.cookie-name`) — o caminho real usado pelo navegador. O backend define esse cookie no `Set-Cookie` da resposta de `/auth/login`/`/auth/registrar`; como é `HttpOnly`, nenhum JavaScript da página consegue ler ou copiar o token (defesa contra roubo de sessão via XSS). O frontend nunca guarda o token em `localStorage`/`document.cookie` — só o navegador sabe que ele existe, e o anexa automaticamente em toda chamada.
- **Header `Authorization: Bearer <token>`** — mantido para `curl`/Postman/Swagger e qualquer automação de teste. O corpo de `login`/`registrar` continua devolvendo `token` no JSON por esse motivo (o app do navegador simplesmente ignora esse campo).

O header tem prioridade quando os dois vierem juntos.

```mermaid
sequenceDiagram
    participant C as Cliente (frontend)
    participant A as AuthController (/auth)
    participant S as AuthService
    participant U as UsuarioRepository
    participant J as JwtService

    C->>A: POST /auth/login {email, senha}
    A->>S: login(dto)
    S->>S: authenticationManager.authenticate(...)
    S->>U: findByEmail(email)
    U-->>S: Usuario
    S->>J: gerarToken(userDetails)
    J-->>S: token JWT
    S-->>A: LoginResponseDTO {token, tipo, id, nome, email, tipoUsuario}
    A-->>C: 200 OK + Set-Cookie: triagem_token (HttpOnly) + token no corpo

    Note over C: requisições seguintes
    C->>A: GET /pacientes  (Cookie: triagem_token=... — anexado automaticamente pelo navegador)
    Note over A: JwtAuthenticationFilter lê o header Authorization;<br/>se ausente, cai no cookie; valida e popula o SecurityContext
```

**Proxy do frontend (`frontend/next.config.ts`):** o cookie só funciona `HttpOnly` sem HTTPS porque o Next.js repassa `/api/*` para o backend por trás dos panos (`rewrites()`) — do ponto de vista do navegador, frontend e backend são a mesma origem. Sem esse proxy, um cookie entre origens diferentes exigiria `SameSite=None; Secure`, que por sua vez exige HTTPS — inviável em desenvolvimento local. Ver [Frontend](06-frontend.md).

## Componentes

| Classe | Responsabilidade |
|---|---|
| `AuthController` | expõe `POST /auth/login`, `POST /auth/registrar` e `POST /auth/logout`; define/limpa o cookie `HttpOnly` do token |
| `AuthService` | orquestra autenticação (via `AuthenticationManager`) e registro; gera o `LoginResponseDTO` |
| `JwtService` | gera e valida tokens JWT (assinatura HMAC, claims `subject`=e-mail, `issuedAt`, `expiration`) |
| `JwtAuthenticationFilter` | filtro (`OncePerRequestFilter`) que intercepta cada requisição e extrai o token do header `Authorization: Bearer ...` ou, se ausente, do cookie `HttpOnly` (nome em `jwt.cookie-name`); valida e popula o `SecurityContextHolder` |
| `UserDetailsServiceImpl` | carrega o `Usuario` pelo e-mail e converte `tipoUsuario` em uma *authority* Spring Security no formato `ROLE_<TIPO>` (ex.: `ROLE_ADMIN`) |
| `SecurityConfig` | define a cadeia de filtros, as regras de autorização por rota, CORS (`corsConfigurationSource`), `PasswordEncoder` (BCrypt) e é `STATELESS` |

> **CORS:** a API só libera explicitamente as origens `http://localhost:3000` e `http://127.0.0.1:3000` (onde roda o frontend em desenvolvimento). Sem essa configuração, o navegador bloqueia toda chamada cross-origin antes mesmo dela chegar ao Spring Security — `curl`/Postman não são afetados por CORS, então esse tipo de problema só aparece testando a partir de um navegador de verdade. Ao publicar o frontend em outro domínio, adicione a origem de produção em `corsConfigurationSource()`. Na prática, o tráfego do navegador hoje nem passa mais por CORS de verdade — vai pelo proxy do Next.js (mesma origem, ver acima); esse bean segue existindo pra Swagger/testes diretos contra o backend a partir de outra origem.

## Perfis de usuário

O enum `TipoUsuario` define três papéis, mapeados para *roles* do Spring Security:

| `TipoUsuario` | Role Spring Security | Perfil descrito na visão geral |
|---|---|---|
| `ADMIN` | `ROLE_ADMIN` | Administração geral do sistema |
| `PROFISSIONAL` | `ROLE_PROFISSIONAL` | Enfermeira, secretária, médico — o "posto de saúde" |
| `PACIENTE` | `ROLE_PACIENTE` | O paciente final |

## Regras de autorização configuradas (`SecurityConfig`)

```java
.requestMatchers("/auth/**").permitAll()
.requestMatchers(HttpMethod.POST, "/pacientes").permitAll()   // auto-cadastro público de paciente
.requestMatchers(HttpMethod.POST,   "/profissionais/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.PUT,    "/profissionais/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/profissionais/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/usuarios/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.GET, "/anamneses/triagem").hasAnyRole("ADMIN", "PROFISSIONAL")
.requestMatchers(HttpMethod.GET, "/pacientes/urgentes").hasAnyRole("ADMIN", "PROFISSIONAL")
.anyRequest().authenticated()
```

Em resumo:
- **Público**: `/auth/**` (login, registro genérico e logout — logout precisa ser público porque limpar um cookie potencialmente já expirado/ausente não é uma operação sensível) e `POST /pacientes` (auto-cadastro de paciente — é assim que a tela de cadastro do frontend cria uma conta completa, com CPF etc., sem precisar estar logado).
- **Somente `ADMIN`**: gerenciar profissionais (criar/editar/excluir) e excluir usuários.
- **`ADMIN` ou `PROFISSIONAL`**: ver a fila de triagem ordenada por urgência e a lista de pacientes urgentes.
- **Qualquer usuário autenticado** (inclusive `PACIENTE`): todas as demais rotas — incluindo criar/editar/listar pacientes, anamneses, agendamentos e consultas de **qualquer** paciente.

Método (`@EnableMethodSecurity`) está habilitado no `SecurityConfig`, mas atualmente nenhum controller usa `@PreAuthorize` — toda a autorização está centralizada no `SecurityFilterChain`.

## Como autenticar uma chamada

**Pelo navegador (frontend):** nada a fazer manualmente. `POST /auth/login`/`/auth/registrar` já deixa o cookie `HttpOnly` configurado via `Set-Cookie`; toda chamada seguinte pro mesmo site já leva o cookie sozinha. `POST /auth/logout` limpa esse cookie (obrigatório passar por ele — `HttpOnly` não pode ser apagado por JavaScript).

**Por `curl`/Postman/Swagger:**
1. `POST /auth/login` (ou `/auth/registrar`) → recebe `{ token, tipo: "Bearer", id, nome, email, tipoUsuario }` no corpo.
2. Nas chamadas seguintes, enviar o header:
   ```
   Authorization: Bearer <token>
   ```

O token expira em `jwt.expiration` milissegundos (configurado em `application.properties`, atualmente 86400000 ms = 24h) — vale tanto pro cookie (`Max-Age`) quanto pro header. Não há endpoint de refresh — expirado o token, é necessário logar novamente.

**Restrição de segurança do cookie, registrada de propósito:** o cookie é emitido `SameSite=Lax`, sem token CSRF — isso só é seguro enquanto frontend e backend continuarem "mesmo site" (é o que o proxy do Next.js garante hoje, inclusive em produção se o deploy mantiver esse proxy na frente). Se um deploy futuro separar frontend e backend em sites diferentes sem proxy, `SameSite=None` vira obrigatório — e `SameSite=None` não oferece proteção nenhuma contra CSRF, então nesse momento uma defesa de verdade (double-submit cookie ou synchronizer token) precisa entrar, não é pra ficar adiando essa decisão sem repensar.

## Lacunas conhecidas

Estes pontos são relevantes tanto para continuidade do desenvolvimento quanto para a discussão de "trabalhos futuros" no TCC:

1. **Sem escopo por paciente.** Um usuário do tipo `PACIENTE` autenticado tem acesso de leitura/escrita a **todos** os registros (pacientes, anamneses, agendamentos, consultas de qualquer pessoa), pois as regras de autorização atuais só diferenciam `ADMIN`/`PROFISSIONAL` em algumas rotas específicas — não existe uma regra que restrinja o `PACIENTE` a ver/editar apenas os próprios dados. O frontend (portal do paciente) só consulta/cria dados usando o `id` do próprio usuário logado, mas isso é uma convenção de UI, não uma restrição imposta pelo servidor — nada impede uma chamada direta à API com outro id.
2. **`POST /pacientes` não retorna token.** Diferente de `/auth/login`, o cadastro de paciente não devolve `LoginResponseDTO` — o frontend faz duas chamadas em sequência (`POST /pacientes` seguido de `POST /auth/login`) para completar o auto-cadastro com login automático.
3. **`jwt.secret` está hardcoded** em `backend/src/main/resources/application.properties` (não é uma variável de ambiente), assim como as credenciais do banco (`spring.datasource.username/password`). Adequado para desenvolvimento local, mas deve ser externalizado antes de qualquer deploy real (ver [Guia de Instalação](07-guia-instalacao.md#nota-de-segurança)).
4. **`POST /auth/registrar` continua existindo mas sem uso no frontend.** Cria apenas um `Usuario` genérico (sem CPF/data de nascimento) — útil para criar contas `ADMIN`/`PROFISSIONAL` via API diretamente (é como o admin inicial do sistema é criado hoje, na ausência de uma tela própria para isso), mas não é mais o caminho usado pelo cadastro de paciente.

# Planos Concluídos

Histórico centralizado do que já foi planejado e implementado no projeto. Cada entrada resume **o que foi de fato implementado** (incluindo desvios em relação ao plano original), não o plano em si. Quando um plano em `docs/plannings/*.md` é concluído, seu conteúdo é resumido aqui como uma nova entrada (mais recente no topo) e o arquivo de plano é removido.

---

## 2026-09-18 — Perguntas definitivas da anamnese por especialidade + correção Verde/Azul

Substituídas as perguntas de anamnese (antes um rascunho, com pesos placeholder em 4 das 5 especialidades) pelas perguntas e pesos definitivos de "Pesquisa Médica TCC.docx" (seção "Perguntas definitivas e peso"), baseados no Protocolo de Manchester real e nas respostas de um formulário enviado a médicos. Cada especialidade passou de um modelo de "grupos de perguntas com peso por faixa" para exatamente 5 perguntas fixas, sem agrupamento — o wizard do paciente ganhou uma tela por pergunta (8 passos sempre: especialidade, identificação, 5 perguntas, revisão).

- **Frontend** (`lib/especialidades/`): `tipos.ts`/`config.ts` reescritos para o modelo flat (`Especialidade.perguntas: Pergunta[]`, sem `grupos`); dois tipos de pergunta novos (`numero`, para a temperatura medida; `selecao`, pra respostas com mais de dois níveis de gravidade, como o tamanho do sangramento) substituindo `checkbox_multiplo`/`texto_livre` (não usados nas perguntas definitivas). `RespostasEspecialidade` virou `Record<perguntaId, valor>` plano. **Nenhum peso vive mais no frontend** — `pontuacao.ts` ficou só com `escalaDorOpcoes` (rótulos da escala 0-10); o cálculo é 100% backend, evitando a divergência que já existia entre os `pesoMin`/`pesoMax` do config antigo e os pesos reais usados no cálculo.
- **Backend** (`AnamneseService`): as 5 `calcularUrgencia<Especialidade>()` (antes placeholders retornando sempre `VERDE`/`AZUL` pra 4 das 5 especialidades) ganharam os pesos reais do documento. Lookup de resposta virou plano (`Map<perguntaId, Object>`, era `Map<grupoId, Map<perguntaId, Object>>`) — `AnamneseDTO.respostas` mudou de tipo. `calculaPeso()` virou uma função de limiares (`peso >= N`) simples, cobrindo qualquer peso entre 0 e 10, não só os 5 valores oficiais.
- **Correção Verde/Azul**: a paleta tinha os rótulos trocados desde a implementação original — Azul era "pouco urgente" e Verde "não urgente", o oposto do Protocolo de Manchester real (Vermelho > Laranja > Amarelo > **Verde** > **Azul**). Corrigido em `urgenciaConfig` (frontend), `NivelUrgencia` (enum Java, reordenado + comentários), `AnamneseRepository.findAllOrdenadosPorUrgencia` (fila de triagem) e toda a documentação (`docs/03`, `docs/04`, `docs/06`, `docs/08`) — decisão confirmada com o usuário antes de aplicar, por ser uma mudança de significado que afeta badges, ordenação da fila e o próprio protocolo clínico de referência.

**Desvios em relação ao pedido:**
- Duas perguntas do documento davam duas respostas de peso possíveis pra um "Sim" sem critério de corte (ex.: "dor no peito ou falta de ar" valendo 10 ou 8) — usado sempre o peso mais alto, seguindo o princípio de segurança do próprio documento ("na dúvida, eleva a prioridade").
- Duas perguntas foram reescritas pra manter a convenção de que "Sim" sempre indica o sinal de alerta (nunca o oposto), preservando o critério clínico original: "Você consegue caminhar e se manter em pé sem ajuda?" (peso valia pra "não consegue") virou "Você tem dificuldade para caminhar ou se manter em pé sem ajuda?"; mesma lógica pra pergunta de ingestão de água/alimentos da Nutrição.
- O bônus de idade que já existia só em Clínico Geral (idade ≥65 ou <12 → peso mínimo 7) foi removido — não fazia parte das 5 perguntas definitivas de nenhuma especialidade, então ficaria inconsistente mantê-lo só ali.
- Nomes de exibição atualizados pra bater com o documento: "Odontologia" → "Dentista", "Nutrição" → "Nutricionista", "Psicologia" → "Psicólogo" (os ids internos `odontologia`/`nutricao`/`psicologia` não mudaram, só o rótulo mostrado).
- Validação do cálculo de peso feita inteiramente via `curl` (20 cenários cobrindo os 5 níveis nas 5 especialidades, incluindo o tipo `selecao`) — não validei a renderização do wizard no navegador porque a porta 3000 (única liberada no CORS/proxy) estava ocupada por outro projeto do usuário, e ele já tinha sinalizado antes, na tarefa anterior, que não precisava dessa validação específica.

**Arquivos principais alterados:** `frontend/lib/especialidades/{tipos,config,pontuacao,resumo}.ts`, `frontend/app/(paciente)/portal/solicitar/page.tsx`, `frontend/app/(paciente)/portal/solicitar/_components/{PerguntaField,EtapaPergunta,EtapaRevisao}.tsx` (`EtapaGrupoPerguntas.tsx` removido), `frontend/lib/utils.ts`; `backend/.../service/AnamneseService.java`, `backend/.../dto/AnamneseDTO.java`, `backend/.../model/enums/NivelUrgencia.java`, `backend/.../repository/AnamneseRepository.java`; `docs/03-modelo-de-dados.md`, `docs/04-api-rest.md`, `docs/06-frontend.md`, `docs/08-design.md`.

---

## 2026-09-18 — Token de autenticação em cookie HttpOnly

**Plano original:** `token-cookie-httponly.md` (removido)

O JWT saiu do `localStorage` (lido/escrito pelo frontend, vulnerável a roubo via XSS) e passou a viver num cookie `HttpOnly` definido pelo backend — inacessível a qualquer JavaScript da página. Como frontend (`:3000`) e backend (`:8080/api`) são origens diferentes, e cookie `HttpOnly` entre origens diferentes exigiria `SameSite=None; Secure` (HTTPS, inviável em dev local), a peça central da mudança foi ligar um proxy same-origin no Next.js (`rewrites()` em `next.config.ts`, repassando `/api/*` pro backend por trás dos panos) — havia até um rewrite pronto pra isso num arquivo morto (`next.config copy.ts`, nome errado, nunca carregado), só nunca tinha sido ligado no config real.

- **Backend**: `AuthController` passa a definir o cookie (`ResponseCookie`, `HttpOnly`, `SameSite=Lax`, `Path=/api`, `Max-Age` = `jwt.expiration`) no `Set-Cookie` de `login`/`registrar`, mantendo `token` também no corpo JSON (uso deliberado: preserva o fluxo de teste manual via curl/Swagger). Novo `POST /auth/logout` — necessário porque um cookie `HttpOnly` só pode ser limpo por quem o definiu (o servidor), nunca por JavaScript no navegador; usa `/auth/logout` e não `/logout` de propósito, pra não colidir com o `LogoutFilter` que o Spring Security registra por padrão nesse path. `JwtAuthenticationFilter` passou a aceitar o token por dois caminhos — header `Authorization: Bearer` (prioridade, mantém tooling funcionando) ou, se ausente, o cookie.
- **Frontend**: `lib/auth.ts` não guarda mais token nenhum, só os dados de exibição do usuário (`SessaoUsuario`) em `localStorage`. `lib/api.ts` para de injetar `Authorization` manualmente, usa `credentials: 'same-origin'` (falha fechado se algum dia apontar cross-origin) e chama sempre o caminho relativo `/api` (removida a variável `NEXT_PUBLIC_API_URL` — o único ponto de configuração agora é `BACKEND_URL`, lido só no `next.config.ts`). `AuthProvider.logout()` virou assíncrono, chamando o novo endpoint antes de limpar o estado local. A hidratação da sessão ao montar a página é otimista (não dá pra conferir um cookie `HttpOnly` do lado do cliente) — confia no usuário salvo e deixa a primeira chamada de API real corrigir via 401 se a sessão não for mais válida.
- **CSRF**: decisão de não adicionar token CSRF agora — `SameSite=Lax` já bloqueia o vetor clássico (nenhuma rota do projeto muta estado via GET), mas essa segurança depende de frontend e backend continuarem "mesmo site" (o proxy garante isso hoje). Registrada como restrição explícita em `docs/05-autenticacao-autorizacao.md`, não pra ficar esquecida se um deploy futuro separar os dois em sites diferentes.

**Desvios em relação ao plano:** nenhum na implementação em si. A validação em navegador (proxy + cookie juntos, ponta a ponta) não foi concluída nesta sessão — as portas de desenvolvimento "padrão" (3000/8080) estavam ocupadas por processos de outros projetos do usuário, e a alternativa de rodar numa porta fora da lista de CORS esbarrou no próprio propósito do teste (o proxy some, aparece "Invalid CORS request"). O usuário optou por não validar isso agora. O mecanismo do cookie em si (definição, atributos, leitura via cookie ou header, limpeza no logout) foi validado de ponta a ponta direto contra o backend via `curl` com cookie jar.

**Arquivos principais alterados:** `backend/.../security/controller/AuthController.java`, `backend/.../security/filter/JwtAuthenticationFilter.java`, `backend/src/main/resources/application.properties` (+ `jwt.cookie-name`); `frontend/next.config.ts` (novo `rewrites()`), `frontend/next.config copy.ts` (removido), `frontend/lib/api.ts`, `frontend/lib/auth.ts`, `frontend/components/auth/AuthProvider.tsx`; `docs/05-autenticacao-autorizacao.md`, `docs/06-frontend.md`, `docs/07-guia-instalacao.md`.

---

## 2026-08-27 — Definição de `nivelUrgencia` da Anamnese movida para o backend

**Plano original:** `mover-definicao-urgencia-anamnese-backend.md` (removido)

`AnamneseDTO` ganhou `especialidadeId`, `idade` e `respostas`
(`Map<grupoId, Map<perguntaId, valor>>`), e `nivelUrgencia` deixou de ser
obrigatório. `AnamneseService` ganhou `resolverNivelUrgencia(dto)`, chamado
por `criar`/`atualizar`: usa `defineUrgencia(dto)` quando
`especialidadeId`+`respostas` vêm preenchidos (fluxo do wizard do paciente),
usa `dto.getNivelUrgencia()` quando só ele vem preenchido (fluxo manual do
profissional, inalterado), e lança `RegraDeNegocioException` (400) se nenhum
dos dois vier. `defineUrgencia` despacha por `switch` em `especialidadeId`
para um método privado por especialidade (`calcularUrgencia<Especialidade>`),
cada um extraindo as respostas em variáveis já tipadas/nomeadas (via helpers
`respostaSimNao`/`respostaEscala`/`respostaCheckbox`/`valorResposta`) — a
lógica de peso em si ficou fora do escopo deste plano, por combinação
explícita com o usuário (ele mesmo está escrevendo os pesos, começando pelo
`clinico_geral`, em paralelo à execução deste plano).

No frontend, o wizard (`(paciente)/portal/solicitar/page.tsx`) parou de
calcular o nível localmente (`lib/especialidades/pontuacao.ts`) e passou a
enviar `especialidadeId`/`idade`/`respostas` brutos; `resumo.ts` não embute
mais a frase de nível "provisório" no texto de `observacoes`, já que quem
decide agora é o backend. `pontuacao.ts` ficou sem nenhuma referência no
código mas não foi apagado (decisão explícita, fora de escopo).

Corrigido de passagem: `AnamneseService.java` tinha um stub quebrado
(`defineUrgencia` sem corpo, não commitado) que impedia o backend de
compilar — o método completo resolve isso.

Verificado com `cd backend && ./mvnw -q compile` (compila limpo) e via
`curl` direto em `POST /anamneses` rodando contra Postgres local, cobrindo
os três caminhos: `especialidadeId`+`respostas` → salva com `VERDE`
(placeholder); só `nivelUrgencia` → mantém o fluxo do profissional; nenhum
dos dois → `400`. Frontend validado com `tsc --noEmit` e `eslint` (ambos
limpos). **Não foi possível validar o wizard em navegador real** — a
extensão Claude in Chrome não estava conectada nesta sessão; o paciente de
teste criado para esse passo foi removido do banco.

**Arquivos principais alterados:** `backend/.../dto/AnamneseDTO.java`,
`backend/.../service/AnamneseService.java`, `frontend/types/index.ts`,
`frontend/lib/especialidades/resumo.ts`,
`frontend/app/(paciente)/portal/solicitar/page.tsx`,
`frontend/app/(profissional)/anamneses/page.tsx` (ajuste pontual de tipo),
`docs/04-api-rest.md`, `docs/06-frontend.md`.

---

## 2026-08-24 — Solicitar atendimento: escolha de especialidade + anamnese por tipo

**Plano original:** `solicitar-atendimento-especialidades.md` (removido)

Substituído o wizard fixo de 4 passos de `(paciente)/portal/solicitar/page.tsx` por um fluxo dinâmico: o paciente escolhe um tipo de atendimento (Clínico Geral, Enfermagem, Odontologia, Psicologia, Nutrição — cards com ícone/descrição), preenche um bloco fixo de identificação (nome, idade, sexo, CPF, naturalidade, cor/raça, endereço completo com busca automática por CEP via ViaCEP, celular, queixa principal) e depois responde o questionário de anamnese específico da especialidade escolhida, organizado em grupos com peso clínico — número de passos varia por especialidade (3 a 4 grupos).

Modelo de dados config-driven criado em `frontend/lib/especialidades/` (`tipos.ts`, `config.ts`, `pontuacao.ts`, `resumo.ts`), decompondo cada pergunta composta do cliente em sub-perguntas tipadas (`sim_nao`/`escala_0_10`/`checkbox_multiplo`/`texto_livre`) — editar/adicionar pergunta é mudança só em `config.ts`, nunca em componente (`PerguntaField.tsx` decide o controle certo olhando só o `tipo`). Nível de urgência calculado por uma heurística provisória e genérica (soma ponderada por peso do grupo + piso de alarme para grupos peso ≥8), substituindo `lib/triagem.ts` (removido). Busca de CEP via `hooks/useCepLookup.ts`, com estados de carregamento/erro e guarda contra resposta obsoleta. Identificação é pré-preenchida a partir do cadastro já existente do paciente (`pacientesApi.buscarPorId`), permanecendo editável. Novos componentes reutilizáveis em `components/ui/index.tsx`: `Stepper`, `SelecaoCard`, `ToggleSimNao`, `CheckboxGroup`.

Plano **frontend-only**, como definido com o usuário — nenhum contrato de backend mudou (`AnamneseDTO` continua só `sintomas`/`observacoes`/`nivelUrgencia`/`pacienteId`); toda a informação nova é serializada em texto legível dentro de `sintomas` (`"[Especialidade] queixa principal"`) e `observacoes` (bloco multi-linha).

Validado em navegador real (Playwright), não só por `tsc`/`lint`/`build`: fluxo completo em duas especialidades (Odontologia com sinais de alarme marcados → `LARANJA`, confirmando o piso de alarme; Nutrição com todas as respostas padrão → `VERDE`), pré-preenchimento de identificação, busca de CEP válido e inválido, bloqueio de avanço com campo obrigatório vazio, reset de respostas ao trocar de especialidade (com preservação da identificação), e renderização correta (multi-linha) do resumo na fila do profissional.

**Desvios em relação ao plano:** nenhum — a implementação seguiu o plano à risca, incluindo os ícones (`Stethoscope`/`Syringe`/`Smile`/`Brain`/`Apple`, confirmados existentes em `lucide-react` antes de implementar) e a decomposição de perguntas.

**Arquivos principais alterados:** `frontend/lib/especialidades/{tipos,config,pontuacao,resumo}.ts` (novos), `frontend/hooks/useCepLookup.ts` (novo), `frontend/lib/triagem.ts` (removido), `frontend/lib/utils.ts` (+ `maskCep`), `frontend/components/ui/index.tsx` (+ `Stepper`/`SelecaoCard`/`ToggleSimNao`/`CheckboxGroup`), `frontend/app/(paciente)/portal/solicitar/page.tsx` (reescrito) e `_components/{EtapaEspecialidade,EtapaIdentificacao,EtapaGrupoPerguntas,PerguntaField,EtapaRevisao}.tsx` (novos), `frontend/app/(profissional)/anamneses/page.tsx` (`white-space: pre-line` no resumo).

---

## 2026-08-18 — Base do frontend: autenticação e as 3 áreas de acesso

**Plano original:** `base-frontend-auth-e-areas.md` (removido)

Construída em 5 etapas, todas validadas em navegador real (Playwright) e nunca só por `tsc`/`lint`/`build`:

- **Etapa 1 — Fundação:** autenticação real ponta a ponta (login, cadastro, `AuthProvider`, `Guard` por papel), `AppShell` responsivo substituindo os 5 `layout.tsx` duplicados, telas de auth, PWA (manifest, ícones gerados via `next/og`, service worker mínimo).
- **Etapa 2 — Portal do paciente:** início, solicitar atendimento (questionário de 4 passos → `lib/triagem.ts`, cálculo provisório de urgência no cliente), meus agendamentos, minhas consultas.
- **Etapa 3 — Área do profissional:** fila de triagem acionável (agendar direto da fila), "Minha agenda" com a anamnese do paciente ao lado, "Registrar consulta" (fecha o ciclo: cria a consulta e conclui o agendamento), dashboard com 3 gráficos Recharts.
- **Etapa 4 — Área do admin:** painel geral com estatísticas consolidadas, gestão de usuários (filtro por tipo, criação de novos administradores, remoção com trava para a própria conta).
- **Etapa 5 — Direção visual:** redesenho completo sobre a base já funcional, seguindo a skill `frontend-design` — tema claro, paleta e tipografia (Inter) fixadas pelo usuário, cores de risco clínico com uso exclusivo (nunca reaproveitadas em status de agendamento, tipo de usuário ou erro genérico de UI), chrome navy (`#0F172A`) consistente entre a sidebar do profissional e a navegação do paciente, e um elemento-assinatura: o badge de urgência `VERMELHO` pulsa sutilmente (único movimento do sistema, respeita `prefers-reduced-motion`). Documentado em [docs/08-design.md](../08-design.md).

**Desvios em relação ao plano:**

- **Três bugs de backend descobertos e corrigidos só ao testar de ponta a ponta** (nenhum aparecia em `curl`/build): CORS nunca esteve configurado, bloqueando qualquer chamada do navegador; `POST /pacientes` exigia autenticação, impossibilitando o auto-cadastro público; a senha (hash bcrypt) vazava em toda resposta JSON de `Usuario`; e serializar qualquer `Anamnese`/`Agendamento`/`Consulta` entrava em recursão infinita via `Paciente`/`Profissional` (corrigido com `@JsonIgnore`). Nenhum estava no escopo original — todos eram infraestrutura que bloqueava a funcionalidade descrita no plano, não features adiáveis.
- **Cadastro de paciente mudou de mecanismo:** em vez de `POST /auth/registrar` (que só criava um `Usuario` genérico, sem CPF/data de nascimento), passou a usar `POST /pacientes` + `POST /auth/login` em sequência — cria um `Paciente` de verdade, sem o qual nenhuma tela do portal funcionaria.
- **"Gestão do posto de saúde"** (Etapa 4) virou um painel geral com estatísticas consolidadas, não um formulário de dados da unidade — não existe entidade de posto/unidade no backend; decisão tomada com o usuário via pergunta direta em vez de suposição.
- **Gráfico "agendamentos por dia"** (Etapa 3) foi ajustado de uma janela retrospectiva de 7 dias para 3 dias atrás/3 à frente — agendamentos não podem ser no passado (regra do backend), então uma janela só histórica mostraria sempre zero.

**Lacunas conhecidas que permanecem** (documentadas em detalhe em [docs/05-autenticacao-autorizacao.md](../05-autenticacao-autorizacao.md) e [docs/06-frontend.md](../06-frontend.md)): backend não restringe `PACIENTE` aos próprios dados (guarda de papel no frontend é UX, não segurança); recuperar senha é só visual; cálculo de urgência é provisório e roda no cliente; "agendado nesta sessão" na fila de triagem não persiste entre sessões.

**Arquivos principais alterados:** `frontend/app/**` (quase todas as rotas, reorganizadas em route groups `(auth)`, `(profissional)`, `(paciente)/portal`, `(admin)`), `frontend/components/{ui,auth,layout,pwa}/**`, `frontend/lib/{api,auth,triagem,utils}.ts`, `frontend/app/globals.css`; `backend/.../security/config/SecurityConfig.java`, `backend/.../model/{Usuario,Paciente,Profissional}.java`.

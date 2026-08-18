# Base do Frontend — Autenticação e as 3 áreas de acesso

> **Skills em uso:** `.claude/skills/frontend/SKILL.md` (exploração prévia, Server vs. Client Components, tratamento de loading/erro/vazio, validação antes de concluir) guia as Etapas 1–4. `.claude/skills/frontend-design/SKILL.md` guia especificamente a Etapa 5 (direção visual) — ver seção própria abaixo.

## Contexto

O frontend atual é um painel administrativo único: cinco páginas de CRUD (`/dashboard`, `/pacientes`, `/profissionais`, `/anamneses`, `/agendamentos`, `/consultas`) sem tela de login, sem noção de usuário logado e sem envio do header `Authorization`. Como o backend exige autenticação em praticamente todas as rotas (`anyRequest().authenticated()`), o frontend hoje **não opera** contra o backend com Spring Security ligado.

Esta é a base que falta: autenticação real, separação em três áreas por papel (paciente, profissional, admin), responsividade e PWA para o paciente no celular.

**Fluxo do sistema que a base precisa sustentar:**
```
Paciente: login → solicita atendimento (anamnese) → envia
   ↓
Secretária: recebe a anamnese → triagem define a urgência → cria o agendamento
   ↓
Paciente: vê a data e o status do agendamento
   ↓
Médico: vê sua agenda e a anamnese do paciente → registra consulta (diagnóstico, prescrição)
   ↓
Paciente: recebe diagnóstico e prescrição
```

**Premissa acordada:** onde o backend ainda não tem endpoint, o frontend é construído completo mesmo assim, servindo de tela de referência para o backend depois. Isso vale para o cálculo automático de urgência e para os campos extras do cadastro de paciente. A recuperação de senha fica **apenas visual, sem funcionar**, por decisão explícita.

## Decisões que orientam a implementação

| Tema | Decisão |
|---|---|
| Recuperar senha | Tela pronta e navegável, botão sem efeito real + aviso de "em breve". Nenhuma chamada de API. |
| Urgência da triagem | Questionário estruturado no portal do paciente (idade, comorbidades, sintomas, intensidade, duração). Cálculo provisório isolado em **um único arquivo** (`lib/triagem.ts`), fácil de remover quando o backend assumir o cálculo. |
| Campos sem endpoint | Enviados no payload mesmo assim. O Spring Boot ignora propriedades desconhecidas por padrão, então o payload completo já trafega hoje sem quebrar — quando o DTO do backend ganhar os campos, passa a persistir sem tocar no frontend. |
| Gráficos | **Recharts** (`npm i recharts`), com cores derivadas das variáveis CSS do tema. |
| Direção visual | Etapa própria (5), no final — redesenha a interface já funcional das Etapas 1–4 em vez de estilizar enquanto a base ainda está em movimento. Segue a skill `frontend-design`, com paleta fixada pelo usuário (ver seção da Etapa 5). |
| Execução | 5 etapas, com validação do usuário entre elas. |

## Restrições técnicas identificadas na exploração

1. **Token não é legível por Server Component.** O backend devolve o JWT no corpo da resposta (`LoginResponseDTO`), não em cookie `HttpOnly`. Guardando em `localStorage`, o shell das áreas autenticadas precisa ser Client Component.
2. **A UI atual é toda inline-style**, o que impede media queries. Responsividade entra via classes utilitárias em `app/globals.css` + hook `useMediaQuery`.
3. **O backend não restringe o paciente aos próprios dados.** O portal filtra pelo id do usuário logado usando os endpoints que já existem — como `Paciente` herda de `Usuario` (`JOINED`), o `id` do login **é** o `pacienteId`.

## Estrutura de rotas alvo

```
app/
├── layout.tsx                    root: metadata, viewport, manifest, <AuthProvider>
├── page.tsx                      redireciona conforme o papel do usuário
├── (auth)/                       layout centrado, sem navegação
│   ├── login/page.tsx
│   ├── cadastro/page.tsx
│   └── recuperar-senha/page.tsx  visual apenas
├── (profissional)/               guard: PROFISSIONAL | ADMIN
│   ├── layout.tsx                AppShell
│   ├── dashboard/page.tsx        existente + gráficos Recharts
│   ├── pacientes/page.tsx
│   ├── anamneses/page.tsx        vira fila de triagem acionável
│   ├── agendamentos/page.tsx
│   └── consultas/page.tsx
├── (paciente)/portal/            guard: PACIENTE — mobile-first
│   ├── layout.tsx                navegação inferior no celular
│   ├── inicio/page.tsx
│   ├── solicitar/page.tsx        questionário de anamnese
│   ├── agendamentos/page.tsx     status do agendamento
│   └── consultas/page.tsx        diagnóstico e prescrição recebidos
└── (admin)/admin/                guard: ADMIN
    ├── page.tsx
    ├── profissionais/page.tsx    movida de /profissionais
    └── usuarios/page.tsx
```

## Etapas

**Etapa 1 — Fundação:** auth real ponta a ponta (`authApi`, `lib/auth.ts`, `AuthProvider`, `Guard`), `AppShell` responsivo substituindo os 5 `layout.tsx` duplicados, telas de login/cadastro/recuperar-senha (visual), PWA (manifest, viewport, service worker mínimo), `npm i recharts`.

**Etapa 2 — Portal do paciente:** início, solicitar atendimento (questionário → `lib/triagem.ts`), meus agendamentos, minhas consultas.

**Etapa 3 — Área do profissional:** fila de triagem acionável, agenda do médico, registrar consulta a partir do agendamento, dashboard com Recharts (donut de urgência, linha de atendimentos, barras de status).

**Etapa 4 — Área do admin:** gestão do posto, CRUD de profissionais movido para `/admin/profissionais`, gestão de usuários.

**Etapa 5 — Direção visual:** ver seção própria abaixo.

## Etapa 5 — Direção visual

**Por quê agora, e não desde o início:** o design atual (tema escuro genérico, tudo em `style={{ }}` inline) foi herdado do frontend pré-existente e nunca foi pensado para o usuário final — só serviu de suporte enquanto a Etapa 1–4 construíam a funcionalidade. Redesenhar antes da base estar pronta teria significado refazer estilo duas vezes. Esta etapa acontece depois que as 4 áreas (auth, paciente, profissional, admin) já existem e funcionam — é uma repaginação da interface inteira, não a criação de telas novas.

**Skill obrigatória:** `.claude/skills/frontend-design/SKILL.md`, seguida à risca — inclusive o processo em duas passadas (brainstorm do sistema de tokens → crítica contra genérico → só então implementar) e a advertência contra os três "vieses" de design gerado por IA (fundo creme + serifada, quase-preto + acento neon, jornal com hairlines). Nenhum dos três serve para este brief de qualquer forma — a paleta abaixo já está definida pelo usuário e é vinculante.

### Direção e referências

- **Inspiração:** Apple (clareza, hierarquia tipográfica precisa, espaço em branco com intenção), Notion (UI funcional e calma, ícones simples, densidade de informação controlada), Claude (tom acolhedor, cantos suaves, legibilidade em primeiro lugar). Não é para imitar nenhum dos três — é a temperatura estética a mirar: confiável, calma, nada corporativo-frio nem "startup".
- **Domínio:** saúde — um posto de saúde, não uma clínica premium. Precisão sem ser clínico-frio; acolhedor sem ser infantil.
- **Público:** o eixo mais importante do brief. Profissionais (secretária, enfermeira, médico) usam no dia a dia sob pressão de fila; pacientes muitas vezes **sem familiaridade com tecnologia**, no celular. Isso implica, concretamente: alvos de toque grandes, rótulos em português claro (nunca jargão técnico ou de sistema), um caminho óbvio por tela (sem ambiguidade sobre qual é a próxima ação), contraste alto, sem depender de ícone sozinho para comunicar algo crítico (sempre com texto junto).
- **Simplicidade como restrição de design, não como desculpa para ausência de identidade** — a skill pede um elemento-assinatura memorável; ele deve emergir de reduzir ruído até sobrar só o essencial bem executado, não de adicionar um enfeite.

### Paleta (fixada pelo usuário — vinculante, não é ponto de exploração)

| Papel | Cor |
|---|---|
| Primária (ações, links, foco) | `#2563EB` |
| Sidebar / elementos de destaque | `#0F172A` |
| Secundária | `#0D9488` (teal) |
| Fundo | `#F8FAFC` |
| Cards / superfícies | `#FFFFFF` |
| Texto principal | `#0F172A` |
| Texto secundário / muted | `#64748B` |
| Bordas | `#E2E8F0` |

**Cores de classificação de risco — uso exclusivo, não reaproveitar em nenhum outro contexto da UI** (botões, links, estados de sucesso/erro genéricos continuam na paleta acima):

| Nível (`NivelUrgencia`) | Cor |
|---|---|
| `VERMELHO` (emergência) | `#DC2626` |
| `LARANJA` (muito urgente) | `#F97316` |
| `AMARELO` (urgente) | `#EAB308` |
| `VERDE` (não urgente) | `#22C55E` |
| `AZUL` (pouco urgente) | `#3B82F6` |

Isso substitui o mapeamento hoje hardcoded em `lib/utils.ts` (`urgenciaConfig`, `statusConfig`) — os valores atuais são próximos mas não idênticos (ex.: vermelho atual é `#ef4444`, não `#DC2626`) e precisam ser trocados exatamente pelos hex acima. Como essas cores carregam significado clínico (gravidade), devem continuar reservadas só para isso — nunca usar `#DC2626` para "erro de formulário" nem `#22C55E` para "sucesso genérico", por exemplo, sob risco de o usuário confundir severidade de paciente com feedback de UI.

O sistema é **claro (light)**, não escuro — inversão total do tema atual. Tipografia: **Inter** (fixada pelo usuário, substitui DM Sans/DM Mono) — face humanista de alta legibilidade em telas pequenas e para leitores com baixa familiaridade digital, com suporte nativo a variable font (pesos 400–700) para hierarquia sem trocar de família. Escala tipográfica e o elemento-assinatura ficam para o brainstorm da própria etapa.

### Escopo

Repassa **todas** as telas já construídas nas Etapas 1–4: `components/ui/index.tsx` (o design system inteiro é refeito sobre os novos tokens), `AppShell` (sidebar/drawer), telas de auth, portal do paciente, área do profissional (incluindo os gráficos Recharts — precisam de nova paleta), área do admin. É uma camada visual sobre a estrutura e o comportamento já existentes — não deve alterar lógica de negócio, chamadas de API ou navegação estabelecidas nas etapas anteriores.

## Verificação por etapa

`tsc --noEmit`, `npm run lint`, `npm run build`, e teste manual do fluxo real de cada etapa com backend + frontend rodando (detalhado no plano original). Responsivo testado em 375px e 1440px; PWA verificado na aba Application do DevTools.

Etapa 5 soma a isso: captura de tela de cada área (auth, portal, profissional, admin) em desktop e mobile para autocrítica visual (conforme a skill), checagem de contraste texto/fundo em cada combinação de cor da paleta (principalmente texto sobre a sidebar `#0F172A` e sobre os badges de urgência), e navegação por teclado com foco visível.

## Riscos conhecidos

- Token em `localStorage` (vulnerável a XSS) — limitação do contrato atual do backend.
- Proteção por papel no frontend é UX, não segurança — backend ainda não restringe paciente aos próprios dados.
- PWA no Next 16 pode divergir do padrão conhecido — consulta obrigatória a `frontend/node_modules/next/dist/docs/` antes de implementar.

---

*Plano em andamento — este arquivo será removido e seu resultado centralizado em [concluidos.md](concluidos.md) quando a base estiver implementada e validada.*


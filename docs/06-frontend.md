# Frontend

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** para estilos utilitários (a maior parte da UI, porém, usa `style={{ ... }}` inline com variáveis CSS — ver `app/globals.css`)
- Tema **claro**, tipografia **Inter**, paleta de marca e de classificação de risco fixadas — ver [Design](08-design.md) para o sistema de tokens completo
- **Recharts** — 3 gráficos na dashboard do profissional (donut de urgência, barras de status, linha de agendamentos por dia)
- Sem biblioteca de data-fetching/estado global: cada página usa `useState` + `useEffect` e chama a API diretamente. Autenticação é a exceção — vive em Context (`AuthProvider`)
- `AGENTS.md`/`CLAUDE.md` do frontend alertam que este projeto usa uma versão do Next.js com mudanças de API em relação ao conhecimento padrão — consulte `node_modules/next/dist/docs/` antes de alterar convenções de rota/build
- PWA: `app/manifest.ts`, ícones gerados via `next/og` `ImageResponse` (`app/icon.tsx`, `app/apple-icon.tsx`, `app/icon-192/route.tsx`, `app/icon-512/route.tsx`) e um service worker mínimo (`public/sw.js`, registrado por `components/pwa/ServiceWorkerRegister.tsx`) que cacheia o app shell e não intercepta chamadas cross-origin (a API)

## Estrutura

O app é dividido em route groups por área de acesso (grupos entre parênteses não aparecem na URL):

```
frontend/app/
├── layout.tsx                    # <html>/<body>, viewport, <AuthProvider>, registro do service worker
├── page.tsx                      # "/" → redireciona conforme o papel do usuário logado (ou /login)
├── manifest.ts, icon.tsx, apple-icon.tsx, icon-192/, icon-512/   # PWA
├── (auth)/                       # layout centrado, sem navegação — rotas públicas
│   ├── login/page.tsx
│   ├── cadastro/page.tsx          # cadastro público de paciente, com login automático
│   └── recuperar-senha/page.tsx   # só visual — backend ainda não tem endpoint
├── (profissional)/                # guard: PROFISSIONAL | ADMIN — AppShell (sidebar/drawer)
│   ├── dashboard/page.tsx
│   ├── pacientes/page.tsx
│   ├── anamneses/page.tsx           # fila de triagem acionável — "Agendar" cria o agendamento direto do item
│   ├── agendamentos/page.tsx        # toggle "Minha agenda" (profissional) / "Todos" (CRUD completo) + registrar consulta
│   └── consultas/page.tsx
├── (paciente)/portal/              # guard: PACIENTE — mobile-first, PortalShell (header + nav inferior)
│   ├── inicio/page.tsx              # próximo atendimento + atalho + últimas consultas
│   ├── solicitar/page.tsx           # questionário de anamnese em 4 passos → lib/triagem.ts
│   ├── agendamentos/page.tsx        # status dos agendamentos, com texto explicativo por status
│   └── consultas/page.tsx           # diagnóstico e prescrição recebidos
└── (admin)/admin/                   # guard: ADMIN — AppShell
    ├── page.tsx                      # painel geral: estatísticas + atalhos
    ├── profissionais/page.tsx        # movida de /profissionais
    └── usuarios/page.tsx             # todas as contas, filtro por tipo, cria/remove administradores
```

### Autenticação (`lib/auth.ts`, `components/auth/`)

- `lib/auth.ts` — leitura/escrita da sessão (token + dados do usuário) em `localStorage`, e `rotaInicialPorPapel()` (PACIENTE → `/portal/inicio`, demais → `/dashboard`).
- `components/auth/AuthProvider.tsx` — contexto client-side (`useAuth()`) com `usuario`, `carregando`, `login()`, `registrar()`, `logout()`. Envolve toda a aplicação a partir do `app/layout.tsx`. `registrar()` encadeia `pacientesApi.criar()` (cria um `Paciente` de verdade) seguido de `authApi.login()` — `POST /pacientes` não retorna token, então o login é uma segunda chamada.
- `components/auth/Guard.tsx` — protege um route group por papel (`<Guard papeis={['ADMIN']}>`). Mostra `Loading` enquanto a sessão carrega, redireciona ao `/login` se não autenticado, e renderiza uma tela "Acesso negado" (com botão Voltar) se o papel não bate — sem 403 silencioso nem vazamento de conteúdo protegido.
- `hooks/useMediaQuery.ts` — usado pelo `AppShell` para alternar entre sidebar fixa (desktop, ≥768px) e header com menu overlay (mobile).

### Navegação

- `components/layout/AppShell.tsx` — área do profissional/admin. Sensível ao papel do usuário logado: os links "Painel Admin", "Profissionais" e "Usuários" (→ `/admin/**`) só aparecem para `ADMIN`. O destaque de rota ativa usa `pathname === href || pathname.startsWith(href + '/')` — só `startsWith(href)` faria `/admin` ficar destacado junto com `/admin/profissionais` (prefixo em comum). Rodapé com nome/papel do usuário e logout. Mobile vira header fixo com hambúrguer + overlay.
- `components/layout/PortalShell.tsx` — área do paciente. Header simples (logo + Sair) e navegação inferior fixa com 4 destinos (Início, Solicitar, Agenda, Consultas), pensada para uso no celular por alguém sem familiaridade com o sistema.

### Triagem no portal (`lib/triagem.ts`)

Isolado num único arquivo, como decidido no plano — fácil de remover quando o backend assumir o cálculo:

- `calcularNivelUrgencia(respostas)` — pontuação simples por fator de risco (dor, falta de ar, sangramento, febre, idade, comorbidades, tempo desde o início dos sintomas) que resulta num `NivelUrgencia`. **Não é uma classificação clínica validada** — é o que popula a fila do profissional até existir uma regra real no backend.
- `formatarResumoTriagem(respostas)` — serializa as respostas estruturadas em texto legível, gravado em `Anamnese.observacoes` (o backend ainda não tem colunas próprias para idade/comorbidades/etc.).
- A tela `(paciente)/portal/solicitar/page.tsx` é um wizard de 4 passos (sobre você → sintomas → sinais de alerta → revisão) — não mostra o nível calculado ao paciente, só confirma o envio; quem vê e pode ajustar o nível é o profissional, na fila de triagem.

### Fila de triagem acionável e agenda do profissional

- `(profissional)/anamneses/page.tsx` — cada item da fila tem um botão **Agendar**, que abre um modal (profissional + data/hora + observações) e cria o agendamento direto, sem sair da tela. Como `Anamnese` não tem um campo de status (nenhuma FK para `Agendamento` no modelo de dados — ver [Modelo de Dados](03-modelo-de-dados.md)), o item marcado como agendado não desaparece da fila; fica só um indicador "✓ Agendado nesta sessão", válido apenas durante a sessão atual do navegador (estado local, não persistido).
- `(profissional)/agendamentos/page.tsx` — ganhou um toggle **Minha agenda / Todos os agendamentos**, visível só para `PROFISSIONAL` (`ADMIN` só vê "Todos", já que não é dono de uma agenda pessoal). "Minha agenda" busca `GET /agendamentos/profissional/{id}` do usuário logado, mostra a anamnese mais recente de cada paciente ao lado (`GET /anamneses/paciente/{id}`, uma chamada por paciente único da agenda) e oferece **Registrar consulta** em qualquer agendamento ainda aberto (`AGENDADO`/`CONFIRMADO`/`EM_ATENDIMENTO`). Registrar consulta cria a `Consulta` e, na sequência, marca o agendamento como `CONCLUIDO` — duas chamadas em série, sem endpoint único para isso no backend.

### Dashboard (`(profissional)/dashboard/page.tsx`)

Três gráficos Recharts somados aos cards e listas já existentes:
- **Distribuição por urgência** (donut) — anamneses da fila de triagem agrupadas por `nivelUrgencia`, cores de `urgenciaConfig`.
- **Agendamentos por status** (barras) — todos os agendamentos agrupados por `status`, cores de `statusConfig`.
- **Agendamentos por dia** (linha) — janela de 3 dias atrás até 3 dias à frente. Não é uma janela só retrospectiva de propósito: como agendamentos não podem ser criados no passado (regra do backend), uma janela puramente histórica tenderia a mostrar sempre zero.

### Área do admin

- `(admin)/admin/page.tsx` — painel geral: cards com total de pacientes, profissionais, administradores e usuários, mais atalhos para as duas telas abaixo. Não existe entidade de "posto/unidade" no backend (nome, endereço, horário de funcionamento — nada modelado), então esta página é deliberadamente uma visão consolidada dos dados que já existem, e não um formulário de configuração da unidade — decisão explícita para não construir uma tela que finge salvar algo que não tem onde ser persistido.
- `(admin)/admin/usuarios/page.tsx` — lista todas as contas (`GET /usuarios`, todos os tipos misturados, já que é a tabela base), com filtro por tipo e remoção (`DELETE /usuarios/{id}`, `ADMIN`-only no backend). Bloqueia remover a própria conta (`disabled` + `title` explicativo no botão) — só uma trava de UX, o backend não impede. Tem **+ Novo administrador**, que usa `POST /usuarios` com `tipoUsuario` fixo em `ADMIN` — é o único tipo que não precisa de tabela própria (`Paciente`/`Profissional` exigem CPF/especialidade etc.), então criar um `Usuario` genérico já basta; é também como a própria conta `admin@posto.com` foi criada nesta sessão de desenvolvimento, sem precisar mais de `curl`.

### Design system (`components/ui/index.tsx`)

`PageHeader`, `Card`, `Button`, `Input`, `Select`, `Textarea`, `Checkbox` (Etapa 2, questionário de triagem), `Modal`, `Empty`, `Loading`, `Toast`, `StatCard`, `UrgenciaBadge`, `StatusBadge`.

## Cliente de API (`lib/api.ts`)

Módulo único com todas as chamadas HTTP, organizadas por recurso (`usuariosApi`, `pacientesApi`, `profissionaisApi`, `anamnesesApi`, `agendamentosApi`, `consultasApi`, `authApi`). Todos usam a função interna `request<T>()`, que:

- Prefixa a URL com `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8080/api`).
- Injeta `Authorization: Bearer <token>` automaticamente quando há sessão ativa (via `lib/auth.ts`).
- Em `401`, limpa a sessão e redireciona para `/login`.
- Em outro erro HTTP, lê `{ mensagem }` do corpo de erro padronizado do backend (ver [API REST](04-api-rest.md#formato-padrão-de-erro)) e lança um `Error(mensagem)`.
- Trata `204 No Content` retornando `undefined`.

`authApi` só expõe `login` — `registrar` foi removido depois que o cadastro passou a usar `pacientesApi.criar()` diretamente (ver acima).

## Tipos (`types/index.ts`)

Espelham as entidades e enums do backend, mais os tipos de autenticação: `LoginRequest`, `LoginResponse`, `SessaoUsuario`. O cadastro de paciente reaproveita `PacienteForm` (já existente para o CRUD do profissional) em vez de ter um tipo próprio.

## Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Base URL do backend consumida por `lib/api.ts` |

## Lacunas conhecidas

1. **Recuperar senha é só visual.** Botão desabilitado, sem chamada de API — decisão explícita até o backend ganhar esse fluxo.
2. **Guarda de papel é UX, não segurança.** O backend continua sem restringir um `PACIENTE` aos próprios dados (ver [Autenticação e Autorização](05-autenticacao-autorizacao.md#lacunas-conhecidas)) — o frontend não cria a ilusão de que isso está resolvido.
3. **Cálculo de urgência é provisório e roda no cliente** (`lib/triagem.ts`) — não é validado clinicamente, é só o que permite a fila de triagem funcionar antes do backend ter essa regra.
4. **"Agendado nesta sessão" na fila de triagem não persiste.** Sem um campo de status em `Anamnese` no backend, não há como saber (entre sessões, ou para outro atendente) quais itens da fila já viraram agendamento — só um lembrete visual local, que some ao recarregar a página.
5. Existem arquivos de configuração duplicados não usados pelo build padrão (`next.config copy.ts`, `tsconfig copy.json`) — provavelmente rascunhos; vale revisar/remover quando o time decidir a configuração definitiva.

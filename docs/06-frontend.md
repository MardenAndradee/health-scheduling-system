# Frontend

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** para estilos utilitários (a maior parte da UI, porém, usa `style={{ ... }}` inline com variáveis CSS — ver `app/globals.css`)
- Tema **claro**, tipografia **Inter**, paleta de marca e de classificação de risco fixadas — ver [Design](08-design.md) para o sistema de tokens completo
- **Recharts** — 3 gráficos na dashboard do profissional (donut de urgência, barras de status, linha de agendamentos por dia)
- Sem biblioteca de data-fetching/estado global: cada página usa `useState` + `useEffect` e chama a API diretamente. Autenticação é a exceção — vive em Context (`AuthProvider`)
- `next.config.ts` tem um `rewrites()` que repassa `/api/*` pro backend (destino configurável via `BACKEND_URL`) — existe pra fazer o cookie de sessão funcionar como "mesma origem" pro navegador, ver Autenticação abaixo
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
│   ├── anamneses/page.tsx           # fila de triagem (toggle Fila/Lista completa) — "Agendar" cria o agendamento já vinculado à anamnese
│   ├── agendamentos/page.tsx        # toggle "Minha agenda" (profissional) / "Todos" (CRUD completo) + registrar consulta
│   └── consultas/page.tsx
├── (paciente)/portal/              # guard: PACIENTE — mobile-first, PortalShell (header + nav inferior)
│   ├── inicio/page.tsx              # próximo atendimento + atalho + últimas consultas
│   ├── solicitar/page.tsx           # wizard dinâmico: especialidade → identificação → perguntas da especialidade → revisão (lib/especialidades/)
│   ├── agendamentos/page.tsx        # agendamentos reais + anamneses ainda sem agendamento ("Aguardando agendamento")
│   └── consultas/page.tsx           # diagnóstico e prescrição recebidos
└── (admin)/admin/                   # guard: ADMIN — AppShell
    ├── page.tsx                      # painel geral: estatísticas + atalhos
    ├── profissionais/page.tsx        # movida de /profissionais
    └── usuarios/page.tsx             # todas as contas, filtro por tipo, cria/remove administradores
```

### Autenticação (`lib/auth.ts`, `components/auth/`)

- `lib/auth.ts` — leitura/escrita em `localStorage` só dos dados de exibição do usuário (id/nome/email/tipoUsuario), e `rotaInicialPorPapel()` (PACIENTE → `/portal/inicio`, demais → `/dashboard`). **O token não passa mais por aqui** — vive num cookie `HttpOnly` definido pelo backend (`Set-Cookie` de `/auth/login`/`/auth/registrar`), que este JavaScript nunca consegue ler; o navegador anexa esse cookie sozinho em toda chamada, via `lib/api.ts`. Ver [Autenticação e Autorização](05-autenticacao-autorizacao.md).
- `components/auth/AuthProvider.tsx` — contexto client-side (`useAuth()`) com `usuario`, `carregando`, `login()`, `registrar()`, `logout()` (assíncrono agora — precisa chamar `POST /auth/logout` pra limpar o cookie no servidor, já que `HttpOnly` não pode ser apagado via JavaScript). Envolve toda a aplicação a partir do `app/layout.tsx`. `registrar()` encadeia `pacientesApi.criar()` (cria um `Paciente` de verdade) seguido de `authApi.login()` — `POST /pacientes` não retorna token, então o login é uma segunda chamada. A hidratação na montagem é otimista: confia no `usuario` salvo (o cookie não dá pra conferir do lado do cliente) e deixa a primeira chamada de API real corrigir via 401 se a sessão não for mais válida.
- `components/auth/Guard.tsx` — protege um route group por papel (`<Guard papeis={['ADMIN']}>`). Mostra `Loading` enquanto a sessão carrega, redireciona ao `/login` se não autenticado, e renderiza uma tela "Acesso negado" (com botão Voltar) se o papel não bate — sem 403 silencioso nem vazamento de conteúdo protegido.
- `hooks/useMediaQuery.ts` — usado pelo `AppShell` para alternar entre sidebar fixa (desktop, ≥768px) e header com menu overlay (mobile).

### Navegação

- `components/layout/AppShell.tsx` — área do profissional/admin. Sensível ao papel do usuário logado: os links "Painel Admin", "Profissionais" e "Usuários" (→ `/admin/**`) só aparecem para `ADMIN`. O destaque de rota ativa usa `pathname === href || pathname.startsWith(href + '/')` — só `startsWith(href)` faria `/admin` ficar destacado junto com `/admin/profissionais` (prefixo em comum). Rodapé com nome/papel do usuário e logout. Mobile vira header fixo com hambúrguer + overlay.
- `components/layout/PortalShell.tsx` — área do paciente. Header simples (logo + Sair) e navegação inferior fixa com 4 destinos (Início, Solicitar, Agenda, Consultas), pensada para uso no celular por alguém sem familiaridade com o sistema.

### Anamnese por especialidade no portal (`lib/especialidades/`)

O paciente escolhe um tipo de atendimento (Clínico Geral, Enfermagem, Dentista, Psicólogo, Nutricionista) em cards com ícone/descrição, preenche um bloco fixo de identificação (nome, idade, sexo, CPF, naturalidade, cor/raça, endereço completo com busca automática por CEP via ViaCEP, celular, queixa principal) e depois responde, uma por tela, as 5 perguntas definitivas daquela especialidade (`lib/especialidades/config.ts`) — perguntas e pesos baseados na pesquisa sobre o Protocolo de Manchester ("Pesquisa Médica TCC.docx", seção "Perguntas definitivas e peso"). Cada especialidade tem exatamente 5 perguntas, sem agrupamento — o total de passos do wizard é sempre o mesmo (especialidade + identificação + 5 perguntas + revisão = 8).

- `lib/especialidades/tipos.ts` — tipos do modelo config-driven: `Especialidade.perguntas` é uma lista plana; cada `Pergunta` é `sim_nao`, `escala_0_10` (dor 0–10), `numero` (ex.: temperatura) ou `selecao` (múltiplas opções com severidade diferente, ex.: tamanho do sangramento). Só o texto/tipo/opções ficam aqui — **nenhum peso**, de propósito (ver abaixo).
- `lib/especialidades/config.ts` — os dados das 5 especialidades; é este arquivo que muda quando o texto das perguntas for revisado. Editar/adicionar/remover pergunta não exige tocar em componente — `_components/PerguntaField.tsx` decide o controle certo só olhando `pergunta.tipo`.
- `lib/especialidades/resumo.ts` — serializa identificação + especialidade + respostas em texto legível, gravado em `Anamnese.observacoes` (multi-linha, renderizado com `white-space: pre-line` na fila); `Anamnese.sintomas` recebe `"[Especialidade] queixa principal"`.
- `lib/especialidades/pontuacao.ts` — só `escalaDorOpcoes` (rótulos da escala 0–10 pro componente de seleção). **O peso de cada resposta não vive no frontend** — só o backend (`AnamneseService.defineUrgencia`) calcula o nível de urgência, a partir de `especialidadeId` + `idade` + `respostas` enviados crus em `POST /anamneses`. Isso evita ter duas fontes de peso divergentes (já aconteceu antes: os `pesoMin`/`pesoMax` do config antigo não batiam com os valores reais usados no cálculo).
- `hooks/useCepLookup.ts` — busca de endereço por CEP (ViaCEP, sem chave), com estado de carregamento/erro e guarda contra resposta obsoleta; os campos preenchidos automaticamente continuam editáveis.
- A tela não mostra o nível calculado ao paciente, só confirma o envio; quem vê e pode ajustar o nível é o profissional, na fila de triagem.

### Fila de triagem acionável e agenda do profissional

- `(profissional)/anamneses/page.tsx` — toggle **Fila de triagem / Lista completa**. Cada item da fila tem um botão **Agendar**, que abre um modal (profissional + data/hora + observações) e cria o agendamento já vinculado à anamnese (`Agendamento.anamnese`, FK opcional). A fila (`GET /anamneses/triagem`) passa a excluir anamneses que já têm agendamento vinculado — o item some da fila de verdade, persistido no backend, não é mais um indicador local de sessão.
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

`PageHeader`, `Card`, `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Modal`, `Empty`, `Loading`, `Toast`, `StatCard`, `UrgenciaBadge`, `StatusBadge`, `Stepper` (progresso de wizard com total dinâmico), `SelecaoCard` (card de escolha ícone + título + descrição), `ToggleSimNao`, `CheckboxGroup`.

## Cliente de API (`lib/api.ts`)

Módulo único com todas as chamadas HTTP, organizadas por recurso (`usuariosApi`, `pacientesApi`, `profissionaisApi`, `anamnesesApi`, `agendamentosApi`, `consultasApi`, `authApi`). Todos usam a função interna `request<T>()`, que:

- Chama sempre um caminho relativo (`/api/...`) — passa pelo `rewrites()` do `next.config.ts`, nunca direto pro backend. Precisa ser mesma origem pro cookie de sessão funcionar.
- Manda `credentials: 'same-origin'` explicitamente (não `'include'` — falha fechado se `BASE_URL` algum dia apontar pra fora, em vez de tentar mandar o cookie cross-origin).
- Não injeta mais `Authorization` — o navegador já manda o cookie `HttpOnly` sozinho.
- Em `401`, limpa a sessão local (`limparUsuario()`) e redireciona para `/login`.
- Em outro erro HTTP, lê `{ mensagem }` do corpo de erro padronizado do backend (ver [API REST](04-api-rest.md#formato-padrão-de-erro)) e lança um `Error(mensagem)`.
- Trata `204 No Content` retornando `undefined`.

`authApi` expõe `login` e `logout` — `registrar` foi removido depois que o cadastro passou a usar `pacientesApi.criar()` diretamente (ver acima).

## Tipos (`types/index.ts`)

Espelham as entidades e enums do backend, mais os tipos de autenticação: `LoginRequest`, `LoginResponse`, `SessaoUsuario`. O cadastro de paciente reaproveita `PacienteForm` (já existente para o CRUD do profissional) em vez de ter um tipo próprio.

## Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8080/api` | Destino do proxy (`rewrites()` em `next.config.ts`) — só lida no processo do Next, nunca vai pro bundle do navegador. `NEXT_PUBLIC_API_URL` não existe mais: `lib/api.ts` sempre chama o caminho relativo `/api`, que passa por esse proxy. |

## Lacunas conhecidas

1. **Recuperar senha é só visual.** Botão desabilitado, sem chamada de API — decisão explícita até o backend ganhar esse fluxo.
2. **Guarda de papel é UX, não segurança.** O backend continua sem restringir um `PACIENTE` aos próprios dados (ver [Autenticação e Autorização](05-autenticacao-autorizacao.md#lacunas-conhecidas)) — o frontend não cria a ilusão de que isso está resolvido.
3. **Cálculo de urgência por especialidade é uma heurística, não uma classificação clínica validada.** As perguntas e pesos são definitivos (baseados na pesquisa do Protocolo de Manchester), mas o sistema não substitui a avaliação do profissional — a equipe pode corrigir o nível depois em "Editar", na fila de triagem.
4. Existe um arquivo de configuração duplicado não usado pelo build padrão (`tsconfig copy.json`) — provavelmente rascunho; vale revisar/remover quando o time decidir a configuração definitiva.

# Frontend

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** para estilos utilitários (a maior parte da UI, porém, usa `style={{ ... }}` inline com variáveis CSS — ver `app/globals.css`)
- Sem biblioteca de data-fetching/estado global: cada página usa `useState` + `useEffect` e chama a API diretamente
- `AGENTS.md`/`CLAUDE.md` do frontend alertam que este projeto usa uma versão do Next.js com mudanças de API em relação ao conhecimento padrão — consulte `node_modules/next/dist/docs/` antes de alterar convenções de rota/build.

## Estrutura

```
frontend/app/
├── layout.tsx           # <html>/<body>, metadata global ("Triagem | Posto de Saúde")
├── page.tsx              # "/" → redirect("/dashboard")
├── dashboard/page.tsx     # tela inicial (KPIs / visão geral)
├── pacientes/page.tsx      # CRUD de pacientes
├── profissionais/page.tsx  # CRUD de profissionais
├── anamneses/page.tsx       # CRUD de anamneses / triagem
├── agendamentos/page.tsx    # CRUD de agendamentos
└── consultas/page.tsx        # CRUD de consultas
```

Cada rota tem também um `layout.tsx` próprio (ex.: `agendamentos/layout.tsx`) — hoje esses layouts por rota compõem a navegação em torno da página (sidebar + conteúdo).

### Navegação (`components/layout/Sidebar.tsx`)

Menu lateral fixo com os links: Dashboard, Pacientes, Profissionais, Anamneses, Agendamentos, Consultas. Marca a rota ativa comparando `usePathname()` com o `href` de cada item.

### Design system (`components/ui/index.tsx`)

Componentes reutilizados por todas as páginas: `PageHeader`, `Card`, `Button` (variants: default/ghost/danger, sizes), `Input`, `Modal`, `Empty`, `Loading`, `Toast`. Estilo consistente via variáveis CSS (`--surface`, `--border`, `--accent`, `--text`, `--muted`, `--radius`) definidas globalmente.

## Cliente de API (`lib/api.ts`)

Um único módulo concentra todas as chamadas HTTP, organizadas por recurso: `usuariosApi`, `pacientesApi`, `profissionaisApi`, `anamnesesApi`, `agendamentosApi`, `consultasApi`. Todos usam a função interna `request<T>()`, que:

- Prefixa a URL com `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8080/api`).
- Define `Content-Type: application/json`.
- Em caso de erro HTTP, tenta ler `{ mensagem }` do corpo de erro padronizado do backend (ver [API REST](04-api-rest.md#formato-padrão-de-erro)) e lança um `Error(mensagem)`.
- Trata `204 No Content` retornando `undefined`.

Cada função de `*Api` corresponde 1:1 a um endpoint documentado em [API REST](04-api-rest.md). Exemplo — página de pacientes (`app/pacientes/page.tsx`) usa `pacientesApi.listar()`, `.criar()`, `.atualizar()`, `.deletar()` para implementar um CRUD completo com busca client-side, modal de criação/edição e toast de feedback.

## Tipos (`types/index.ts`)

Espelham as entidades e enums do backend em TypeScript: `TipoUsuario`, `NivelUrgencia`, `StatusAgendamento`, `Usuario`, `Paciente`, `Profissional`, `Anamnese`, `Agendamento`, `Consulta`, além dos `*Form` (formato usado nos formulários de criação/edição) e `ApiError`.

## Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Base URL do backend consumida por `lib/api.ts` |

## Lacunas conhecidas

1. **Não há tela de login.** `app/page.tsx` redireciona direto para `/dashboard`; não existe nenhuma rota `/login`, nem lógica de armazenamento de token (`localStorage`/cookies) ou envio do header `Authorization` em `lib/api.ts`. Na prática, como o backend exige autenticação (`anyRequest().authenticated()`) para quase todas as rotas, o frontend atual **não consegue operar contra um backend com Spring Security habilitado sem alterações**.
2. **Um único painel administrativo.** Todas as páginas atuais (`pacientes`, `profissionais`, `anamneses`, `agendamentos`, `consultas`) implementam CRUD completo, adequado ao perfil "profissional do posto de saúde". Ainda não existe a visão simplificada de paciente (preencher a própria anamnese + ver a própria agenda) mencionada na [Visão Geral](01-visao-geral.md#perfis-de-acesso) — isso é o próximo passo natural de UI para materializar os dois níveis de acesso do projeto.
3. Existem arquivos de configuração duplicados não usados pelo build padrão (`next.config copy.ts`, `tsconfig copy.json`) — provavelmente rascunhos; vale revisar/remover quando o time decidir a configuração definitiva.

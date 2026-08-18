# Planos Concluídos

Histórico centralizado do que já foi planejado e implementado no projeto. Cada entrada resume **o que foi de fato implementado** (incluindo desvios em relação ao plano original), não o plano em si. Quando um plano em `docs/plannings/*.md` é concluído, seu conteúdo é resumido aqui como uma nova entrada (mais recente no topo) e o arquivo de plano é removido.

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

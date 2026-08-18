# Design

Sistema de design do frontend — tokens, tipografia e as decisões por trás deles. Implementado na Etapa 5 do plano em [docs/plannings/concluidos.md](plannings/concluidos.md), seguindo a skill `.claude/skills/frontend-design/SKILL.md`.

## Direção

Referências: Apple (clareza, hierarquia tipográfica precisa), Notion (UI funcional e calma, densidade controlada), Claude (tom acolhedor, legibilidade em primeiro lugar) — não para imitar, mas como temperatura estética: confiável, calma, nem corporativo-frio nem "startup".

O eixo que mais pesou nas decisões foi o público: profissionais (secretária, enfermeira, médico) usam o sistema sob pressão de fila; pacientes muitas vezes sem familiaridade com tecnologia, no celular. Daí: alvos de toque grandes, rótulos em português claro, um caminho óbvio por tela, alto contraste, nunca depender só de cor/ícone para comunicar algo crítico.

## Paleta

Fixada pelo usuário — não foi ponto de exploração de design.

| Token CSS | Cor | Uso |
|---|---|---|
| `--accent` | `#2563EB` | Ações primárias, links, foco |
| `--accent-hover` | `#1D4ED8` | Hover de botão primário |
| `--secondary` | `#0D9488` | Confirmação/sucesso (toast, ícone de "enviado") |
| `--bg` | `#F8FAFC` | Fundo da aplicação |
| `--surface` | `#FFFFFF` | Cards, inputs, modais |
| `--surface2` | `#F1F5F9` | Cabeçalho de tabela, estados hover sutis |
| `--text` | `#0F172A` | Texto principal |
| `--muted` | `#64748B` | Texto secundário |
| `--border` | `#E2E8F0` | Bordas |
| `--danger` | `#E11D48` | Erro de formulário, ação destrutiva — **não** é a mesma cor do nível de risco `VERMELHO` |
| `--chrome-bg` | `#0F172A` | Sidebar (desktop) e header/navegação inferior (mobile) — âncora escura deliberada, mesmo com o resto do sistema em tema claro |

### Cores de classificação de risco — uso exclusivo

Definidas em `lib/utils.ts` (`urgenciaConfig`), nunca como token CSS genérico, para deixar claro que são de um domínio à parte:

| Nível | Cor |
|---|---|
| `VERMELHO` | `#DC2626` |
| `LARANJA` | `#F97316` |
| `AMARELO` | `#EAB308` |
| `VERDE` | `#22C55E` |
| `AZUL` | `#3B82F6` |

Nenhuma dessas cinco cores aparece em nenhum outro contexto da UI — nem em `statusConfig` (status de agendamento), nem em `tipoCor` (tipo de usuário na tela de administração), nem nos botões de erro/destrutivos. `statusConfig` e `tipoCor` foram desenhados com paletas próprias, deliberadamente sem nenhum hex em comum com a lista acima (ver `lib/utils.ts` e `app/(admin)/admin/usuarios/page.tsx`).

## Tipografia

**Inter** (Google Fonts, pesos 400–700), única família em todo o sistema — substituiu DM Sans/DM Mono. Onde antes se usava uma fonte monoespaçada para dados tabulares (datas, CPF, CRM), agora é Inter com `font-variant-numeric: tabular-nums`, que alinha os dígitos sem precisar de uma segunda família.

Corpo do texto em 16px (`html { font-size: 16px }`, subiu de 15px) — legibilidade em primeiro lugar para um público que inclui pacientes sem familiaridade digital.

## Elemento-assinatura: o sinal de emergência

O selo de urgência (`UrgenciaBadge`) é o elemento mais repetido do sistema — aparece na fila de triagem, no dashboard, na agenda do profissional. Em vez de um badge estático, o nível `VERMELHO` (emergência) ganha um pulso sutil no ponto colorido (`@keyframes pulso-emergencia`, `app/globals.css`) — o único movimento em todo o sistema, reservado só para o caso mais crítico, para chamar atenção sem gerar ruído visual nos outros quatro níveis. Respeita `prefers-reduced-motion` (a animação só é aplicada dentro de `@media (prefers-reduced-motion: no-preference)`).

## Estrutura visual

- **Chrome sempre escuro, conteúdo sempre claro.** A sidebar do profissional/admin (`AppShell`) e o header/navegação inferior do paciente (`PortalShell`) usam os tokens `--chrome-*` (navy `#0F172A`), enquanto toda a área de conteúdo usa os tokens claros. É a mesma decisão visual nas duas áreas do sistema, reforçando que é o mesmo produto.
- **Cards com sombra suave** (`--shadow-sm`), não só borda — no tema escuro anterior a diferenciação de superfície vinha só de tom; em fundo claro, sombra é o que separa um card do fundo sem depender de um contraste de cor mais forte.
- **Cantos arredondados moderados** (`--radius: 10px`, `--radius-lg: 18px`, `--radius-full` para badges/pills) — acolhedor sem ser infantil.
- **Foco visível** (`:focus-visible` global) e alvos de toque maiores nos componentes usados no portal do paciente (navegação inferior com `min-height: 56px`).

## Onde isso vive no código

- `app/globals.css` — todos os tokens, import da fonte, animação do sinal de emergência, foco visível.
- `components/ui/index.tsx` — cada componente do design system consome os tokens; nenhuma cor hardcoded fora de `lib/utils.ts`.
- `lib/utils.ts` — `urgenciaConfig` (risco, exclusivo) e `statusConfig` (status de agendamento, paleta própria).
- `components/layout/AppShell.tsx` e `PortalShell.tsx` — chrome navy.
- `app/icon.tsx`, `apple-icon.tsx`, `icon-192/route.tsx`, `icon-512/route.tsx`, `manifest.ts` — ícones e cores do PWA usando `--accent`/`--chrome-bg`.

## Ícones

**`lucide-react`** — biblioteca de ícones em linha, um componente React por ícone (`size`, `strokeWidth` como props, sem CSS extra). Substituiu os símbolos geométricos Unicode usados inicialmente (◈ ◉ ◐ etc.), que não formavam um sistema reconhecível. Usados na navegação (`AppShell`, `PortalShell`), nos cabeçalhos de card do dashboard, nos botões de alternância de visualização e no botão de fechar do `Modal`.

Escolha deliberada de um ícone por destino, nunca reaproveitado para dois links diferentes na mesma navegação (ex.: `LayoutDashboard` para "Dashboard" é visualmente distinto de `Building2` para "Painel Admin" — ambos são "grade/prédio", mas não a ponto de se confundirem a um relance).

## Máscaras de CPF e telefone

`lib/utils.ts`: `maskCpf` (`000.000.000-00`) e `maskTelefone` (`(00) 00000-0000` para celular, `(00) 0000-0000` para fixo, conforme a quantidade de dígitos) formatam progressivamente enquanto o usuário digita. O estado do formulário guarda sempre os dígitos puros (`apenasDigitos`) — a máscara é só de exibição (`value={maskCpf(form.cpf)}`), então o valor enviado à API é sempre dígitos, sem depender de que o backend aceite ou não pontuação. Usado em `(auth)/cadastro` e no CRUD de pacientes (`(profissional)/pacientes`).

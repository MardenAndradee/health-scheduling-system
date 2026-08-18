# Plannings

Esta pasta guarda os **planos de implementação** enquanto estão em andamento.

## Fluxo

1. **Início de uma tarefa relevante** (feature, refatoração, mudança de arquitetura): o plano é escrito aqui como `docs/plannings/titulo-curto.md` (nome resumido, sem data — a data já fica no histórico do git), antes de qualquer código ser alterado.
2. **Enquanto a tarefa está em andamento**: o plano pode ser atualizado neste mesmo arquivo conforme a abordagem muda.
3. **Quando a tarefa é concluída**:
   - Um resumo do que foi **de fato implementado** (não o plano original — o resultado real, incluindo eventuais desvios) é adicionado como uma nova entrada em [concluidos.md](concluidos.md).
   - O arquivo de plano correspondente é **removido** desta pasta — `concluidos.md` passa a ser o único registro histórico.

Esse fluxo é automatizado pela skill `planning` (`.claude/skills/planning/SKILL.md`).

## Por que centralizar em um único arquivo

Manter um arquivo por plano concluído geraria uma pasta com dezenas de documentos pequenos e datados, a maioria irrelevante depois de pronta. Centralizar em [concluidos.md](concluidos.md) mantém um histórico único, cronológico e fácil de consultar — útil tanto para dar contexto a novas sessões quanto para o texto do TCC.

## Arquivos

- `concluidos.md` — histórico centralizado de tudo que já foi planejado e implementado.
- `*.md` (demais arquivos) — planos em andamento no momento.

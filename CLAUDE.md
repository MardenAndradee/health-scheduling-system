# CLAUDE.md

Guia rápido deste repositório para trabalho assistido por Claude Code. Para detalhes, sempre prefira a documentação linkada abaixo em vez de assumir — este arquivo é só o mapa.

## O que é este projeto

Sistema de Triagem para Postos de Saúde — TCC (Bacharelado em Ciências da Computação). Backend Java/Spring Boot + frontend Next.js/TypeScript. Classifica pacientes por nível de urgência e organiza a fila de atendimento automaticamente. Visão completa: [docs/01-visao-geral.md](docs/01-visao-geral.md).

## Documentação

Todo o levantamento técnico do projeto vive em [docs/](docs/README.md) — leia o índice lá antes de explorar o código do zero:

- [Visão geral](docs/01-visao-geral.md) · [Arquitetura](docs/02-arquitetura.md) · [Modelo de dados](docs/03-modelo-de-dados.md)
- [API REST](docs/04-api-rest.md) · [Autenticação e autorização](docs/05-autenticacao-autorizacao.md)
- [Frontend](docs/06-frontend.md) · [Guia de instalação](docs/07-guia-instalacao.md)

Esses documentos descrevem o estado real do código (não um ideal) — inclusive lacunas conhecidas (ex.: frontend sem tela de login, `PACIENTE` sem escopo de acesso restrito). Ao implementar algo que fecha uma dessas lacunas, atualize o documento correspondente.

## Regra obrigatória: tarefas de frontend

Qualquer pedido que envolva implementar, alterar ou corrigir algo em `frontend/` (páginas, componentes, hooks, chamadas de API, estilos, tipos) — **antes de tocar em qualquer código**, invoque a skill `frontend` (`Skill(skill: "frontend")`). Isso vale mesmo que o pedido não mencione a palavra "frontend" explicitamente (ex.: "adiciona um filtro na tela de pacientes", "corrige o bug do agendamento"). Não pule essa etapa por já "saber o que fazer" — a skill define o processo de exploração, padrões e validação que este projeto espera antes de considerar a tarefa concluída.

## Fluxo de planejamento

Planos de implementação não triviais são registrados em `docs/plannings/` e, ao concluir a tarefa, centralizados em `docs/plannings/concluidos.md`. O fluxo completo (quando criar, quando fechar, formato) está na skill `.claude/skills/planning/SKILL.md` — use-a ao aprovar um plano ou ao terminar um já registrado.

## Convenções do repositório

- **Idioma:** documentação e nomes de domínio (entidades, DTOs, rotas) em português. Nomes técnicos genéricos (`Controller`, `Service`, `Repository`, `DTO`) em inglês, como já está no código.
- **Arquitetura backend:** Controller → Service → Repository → Database, estritamente. Regra de negócio fica no Service, nunca no Controller. Ver [docs/02-arquitetura.md](docs/02-arquitetura.md).
- **Erros:** exceções de domínio (`RecursoNaoEncontradoException`, `RegraDeNegocioException`) tratadas via `GlobalExceptionHandler` — não capturar e formatar erro manualmente em controller/service.
- **Frontend:** `frontend/` tem seu próprio `CLAUDE.md`/`AGENTS.md` com um aviso importante — a versão do Next.js usada tem breaking changes em relação ao conhecimento padrão de treinamento; leia `frontend/node_modules/next/dist/docs/` antes de escrever código lá. Ver regra obrigatória de skill acima.

## Antes de recomendar algo como "já existe"

Este projeto ainda está em desenvolvimento ativo (TCC). Nomes de arquivo, endpoints e componentes citados em `docs/` podem ter mudado desde a última atualização — confirme no código (`Glob`/`Grep`/`Read`) antes de basear uma implementação em algo que só foi visto na documentação.

# Documentação — Sistema de Triagem para Postos de Saúde

Índice da documentação técnica do projeto. Este material foi levantado a partir do código-fonte atual do repositório (backend Spring Boot + frontend Next.js) e serve como referência para desenvolvimento, manutenção e para o texto do TCC.

## Sumário

1. [Visão Geral](01-visao-geral.md) — objetivo do sistema, funcionalidades, perfis de acesso e status atual do projeto.
2. [Arquitetura](02-arquitetura.md) — arquitetura em camadas, stack tecnológica e estrutura de pastas do backend e do frontend.
3. [Modelo de Dados](03-modelo-de-dados.md) — entidades, relacionamentos, enums e o diagrama entidade-relacionamento.
4. [API REST](04-api-rest.md) — referência completa dos endpoints do backend (autenticação, pacientes, profissionais, anamneses, agendamentos, consultas).
5. [Autenticação e Autorização](05-autenticacao-autorizacao.md) — fluxo JWT, perfis de usuário (ADMIN, PROFISSIONAL, PACIENTE) e regras de acesso por rota.
6. [Frontend](06-frontend.md) — estrutura da aplicação Next.js, páginas, cliente HTTP e componentes de UI.
7. [Guia de Instalação e Execução](07-guia-instalacao.md) — como rodar o backend e o frontend localmente.
8. [Design](08-design.md) — paleta, tipografia e o sistema de tokens visuais do frontend.

Além do índice numerado acima, [plannings/](plannings/README.md) guarda o histórico de planos de implementação (em andamento e concluídos) — ver a skill `.claude/skills/planning/SKILL.md` para o fluxo.

## Sobre o projeto

Sistema web desenvolvido como Trabalho de Conclusão de Curso (TCC — Bacharelado em Ciências da Computação), com o objetivo de otimizar o processo de triagem em postos de saúde por meio da classificação de pacientes conforme o nível de urgência, organizando a fila de atendimento e reduzindo o tempo de espera.

**Autor:** Marden Andrade

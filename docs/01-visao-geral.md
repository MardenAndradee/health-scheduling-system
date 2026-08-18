# Visão Geral

## O que é o sistema

O **Sistema de Triagem para Postos de Saúde** é uma aplicação web que auxilia profissionais de saúde a organizar a fila de atendimento com base no nível de urgência dos pacientes, em vez da tradicional ordem de chegada. O paciente relata seus sintomas em uma anamnese, recebe uma classificação de risco, e o sistema reordena a fila automaticamente priorizando os casos mais graves.

Foi desenvolvido como Trabalho de Conclusão de Curso (TCC) do Bacharelado em Ciências da Computação.

## Objetivo

Desenvolver uma aplicação que auxilie profissionais da saúde na organização da fila de atendimento, reduzindo o tempo de espera e priorizando pacientes de acordo com a gravidade dos sintomas apresentados.

### Objetivos específicos

- Organizar o atendimento em postos de saúde.
- Automatizar a classificação de pacientes.
- Auxiliar profissionais na tomada de decisão.
- Melhorar o fluxo de atendimento.
- Reduzir o tempo de espera.

## Funcionalidades

- Cadastro de pacientes
- Cadastro de usuários (profissionais e administradores)
- Processo de triagem (anamnese)
- Classificação de risco (nível de urgência)
- Organização automática da fila de atendimento, ordenada por urgência
- Gerenciamento de atendimentos (agendamentos e consultas)
- Autenticação de usuários via JWT

## Perfis de acesso

O sistema foi concebido com **dois níveis de acesso**:

| Perfil | Quem usa | O que faz |
|---|---|---|
| **Profissional do posto de saúde** | Enfermeira, secretária, médico (e o papel `ADMIN` para administração geral) | Cadastra pacientes e profissionais, realiza/gerencia a triagem, consulta a fila ordenada por urgência, gerencia agendamentos e registra consultas (diagnóstico/prescrição). |
| **Paciente** | O próprio paciente | Preenche a anamnese (relata sintomas) e visualiza seus agendamentos. |

No modelo de dados, isso é representado pelo enum `TipoUsuario` (`ADMIN`, `PROFISSIONAL`, `PACIENTE`) — ver [Modelo de Dados](03-modelo-de-dados.md) e [Autenticação e Autorização](05-autenticacao-autorizacao.md).

> **Status atual:** as duas visões já existem no frontend — login, cadastro público de paciente, um portal mobile-first para o paciente (início, solicitar atendimento, agendamentos, consultas) e a área do profissional/admin, cada uma protegida por papel. O que ainda falta: a fila de triagem virar acionável (agendar direto a partir dela), a dashboard com gráficos, a área de gestão do admin, e — a lacuna mais importante do lado do backend — o `PACIENTE` não ter seu acesso restrito aos próprios dados no servidor (hoje é só uma convenção do frontend). Ver [Frontend](06-frontend.md#lacunas-conhecidas), [Autenticação e Autorização](05-autenticacao-autorizacao.md#lacunas-conhecidas) e o plano em [docs/plannings/base-frontend-auth-e-areas.md](plannings/base-frontend-auth-e-areas.md).

## Tecnologias

### Backend
- Java 21
- Spring Boot (Spring Web MVC, Spring Data JPA, Spring Security)
- PostgreSQL
- Maven
- Lombok
- Jakarta Validation
- JJWT (emissão/validação de tokens JWT)

### Frontend
- TypeScript
- Next.js (App Router)
- React

Detalhes de versões em [Arquitetura](02-arquitetura.md#stack-tecnológica).

## Status

🚧 Projeto em desenvolvimento.

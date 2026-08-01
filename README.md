# Sistema de Triagem para Postos de Saúde

Sistema web desenvolvido como Trabalho de Conclusão de Curso (TCC), com o objetivo de otimizar o processo de triagem em postos de saúde por meio da classificação de pacientes conforme o nível de urgência.

## Objetivo

Desenvolver uma aplicação que auxilie profissionais da saúde na organização da fila de atendimento, reduzindo o tempo de espera e priorizando pacientes de acordo com a gravidade dos sintomas apresentados.

## Funcionalidades

- Cadastro de pacientes
- Cadastro de usuários
- Processo de triagem
- Classificação de risco
- Organização automática da fila de atendimento
- Gerenciamento de atendimentos
- Autenticação de usuários

## Tecnologias

### Backend

- Java 21
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Maven
- Lombok
- Jakarta Validation

### Frontend

- TypeScript

## Arquitetura

O projeto utiliza a arquitetura tradicional em camadas:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

## Estrutura do Projeto

```
src
├── controller
├── service
├── repository
├── model
├── dto
├── config
├── exception
└── util
```

## Objetivos do Projeto

- Organizar o atendimento em postos de saúde.
- Automatizar a classificação de pacientes.
- Auxiliar profissionais na tomada de decisão.
- Melhorar o fluxo de atendimento.
- Reduzir o tempo de espera.

## Status

🚧 Projeto em desenvolvimento.

## Autor

**Marden Andrade**

Trabalho de Conclusão de Curso — Bacharelado em Ciências da Computação.

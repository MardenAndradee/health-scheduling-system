---
name: frontend
description: Use for any frontend development work in this repo — implementing features, fixing bugs, or touching pages, components, hooks, services, types, or styling under frontend/ (Next.js, React, TypeScript). Covers pre-implementation exploration, coding standards, Server/Client Component boundaries, API integration, UX states (loading/error/empty), bug-fixing discipline, and validation before calling the work done.
---

# Next.js Frontend Development

Você é responsável pelo desenvolvimento frontend deste projeto utilizando Next.js, React e TypeScript.

Seu objetivo não é apenas escrever código que compile. Você deve implementar funcionalidades completas, integradas ao projeto existente e validadas antes de considerar o trabalho concluído.

## 1. Antes de implementar

Antes de alterar qualquer código:

- Analise cuidadosamente a solicitação.
- Explore a estrutura existente do projeto.
- Identifique:
  - páginas e rotas relacionadas;
  - componentes reutilizáveis;
  - hooks existentes;
  - serviços e chamadas de API;
  - tipos e interfaces;
  - padrões de estilização;
  - gerenciamento de estado utilizado.
- Procure implementar seguindo os padrões já existentes no projeto.
- Não crie novas abstrações, bibliotecas ou arquiteturas sem necessidade.

Antes de começar, compreenda como a funcionalidade atual funciona e quais partes podem ser afetadas pela alteração.

## 2. Desenvolvimento

Ao implementar uma funcionalidade:

- Utilize TypeScript corretamente.
- Evite utilizar `any`.
- Reutilize componentes existentes sempre que possível.
- Evite duplicação de código.
- Mantenha componentes pequenos e com responsabilidades claras.
- Separe lógica de negócio da camada de apresentação quando fizer sentido.
- Não altere arquivos não relacionados sem necessidade.
- Preserve o comportamento existente que não faz parte da solicitação.

Utilize:

- componentes reutilizáveis;
- hooks para lógica reutilizável;
- tipos e interfaces adequados;
- tratamento adequado para estados de carregamento;
- tratamento adequado para estados de erro;
- feedback visual para ações do usuário.

## 3. Next.js

Respeite a arquitetura e as convenções do Next.js utilizadas pelo projeto.

Antes de criar um componente client-side, avalie se ele realmente precisa de:

```tsx
"use client";
```

Utilize componentes client-side apenas quando necessário, como em casos de:

- `useState`;
- `useEffect`;
- eventos do usuário;
- APIs exclusivas do navegador;
- hooks client-side.

Evite transformar páginas ou componentes inteiros em Client Components quando apenas uma pequena parte necessita disso.

Sempre que possível:

- mantenha componentes como Server Components;
- isole partes interativas em Client Components;
- evite chamadas desnecessárias ao backend;
- evite buscar os mesmos dados múltiplas vezes.

## 4. Integração com APIs

Antes de criar uma nova chamada para uma API:

- Verifique se já existe um serviço semelhante.
- Verifique os tipos existentes.
- Confirme o formato esperado da requisição.
- Confirme o formato da resposta.

Ao consumir APIs:

- trate erros;
- trate carregamento;
- evite assumir que todos os campos sempre estarão presentes;
- mantenha os tipos sincronizados com o contrato da API;
- não esconda erros silenciosamente.

Não altere contratos do backend sem necessidade.

## 5. Interface e experiência do usuário

Ao implementar telas ou componentes:

- mantenha consistência com o design existente;
- reutilize componentes visuais já existentes;
- preserve espaçamentos e padrões do sistema;
- considere responsividade;
- trate estados vazios;
- trate estados de carregamento;
- trate erros de forma compreensível para o usuário.

Não implemente apenas o "caso feliz".

Sempre considere situações como:

- lista vazia;
- carregamento lento;
- erro da API;
- dados incompletos;
- usuário clicando repetidamente;
- requisição falhando;
- usuário navegando durante uma operação.

## 6. Correção de bugs

Quando receber um bug:

- Não faça uma alteração baseada apenas em suposição.
- Investigue o fluxo relacionado.
- Identifique a causa raiz.
- Faça a menor correção necessária.
- Verifique possíveis efeitos colaterais.
- Teste novamente o cenário original.

Não corrija apenas o sintoma se for possível identificar a causa real.

## 7. Validação

Após implementar qualquer alteração:

- Execute os testes existentes relacionados.
- Execute lint e verificações de TypeScript quando disponíveis.
- Verifique erros de compilação.
- Teste manualmente o fluxo principal.
- Teste os cenários de erro relevantes.
- Verifique se não houve regressões evidentes.

Não considere a tarefa concluída apenas porque:

- o código foi escrito;
- não existem erros visíveis;
- a aplicação compilou.

A funcionalidade deve ser validada funcionando no fluxo real.

## 8. Autocorreção

Se durante os testes você encontrar um problema causado pela sua implementação:

- investigue;
- corrija;
- execute novamente as validações.

Você tem autonomia para corrigir problemas diretamente relacionados à sua implementação.

Continue o ciclo:

```
implementar → testar → investigar → corrigir → testar novamente
```

até que a implementação esteja funcionando corretamente.

## 9. Critério de conclusão

Uma tarefa frontend só pode ser considerada concluída quando:

- a funcionalidade solicitada estiver implementada;
- o código seguir os padrões existentes;
- os tipos estiverem corretos;
- não houver erros de compilação ou TypeScript relacionados;
- os estados de loading, erro e vazio tiverem sido considerados quando aplicável;
- a integração com a API estiver funcionando;
- o fluxo principal tiver sido testado;
- problemas encontrados durante a validação tiverem sido corrigidos.

## 10. Relatório final

Ao concluir uma tarefa, informe de forma objetiva:

- O que foi alterado.
- Quais arquivos principais foram modificados.
- Como a funcionalidade foi validada.
- Quais problemas foram encontrados e corrigidos durante o processo.
- Qualquer limitação ou ponto que não foi possível validar.

Não declare uma tarefa como concluída sem realizar as validações possíveis no ambiente.

# Guia de Instalação e Execução

## Pré-requisitos

| Ferramenta | Versão | Observação |
|---|---|---|
| Java (JDK) | 21 | usado apenas para compilar; a execução pode usar o Maven Wrapper |
| PostgreSQL | qualquer versão recente | banco `PostoSaude` |
| Node.js | 18+ (recomendado 20+) | para o frontend Next.js 16 |
| Maven | não é necessário instalar — o projeto inclui o Maven Wrapper (`mvnw`/`mvnw.cmd`) |

## 1. Banco de dados

Crie um banco PostgreSQL chamado `PostoSaude` (nome usado em `application.properties`):

```sql
CREATE DATABASE "PostoSaude";
```

O schema é gerado automaticamente pelo Hibernate (`spring.jpa.hibernate.ddl-auto=update`) na primeira execução — não há scripts de migração (Flyway/Liquibase) no projeto.

## 2. Backend

Configuração atual em `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/PostoSaude
spring.datasource.username=postgres
spring.datasource.password=root
server.port=8080
server.servlet.context-path=/api
jwt.expiration=86400000
```

Ajuste `username`/`password` conforme seu ambiente local antes de rodar. Depois:

```bash
cd backend
./mvnw spring-boot:run       # Linux/macOS
mvnw.cmd spring-boot:run     # Windows
```

A API sobe em `http://localhost:8080/api`. Para gerar o `.jar`:

```bash
./mvnw clean package
java -jar target/triagem-0.0.1-SNAPSHOT.jar
```

Para rodar os testes:

```bash
./mvnw test
```

### Testando a API rapidamente

```bash
curl -X POST http://localhost:8080/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@exemplo.com","senha":"123456","tipoUsuario":"ADMIN"}'
```

A resposta traz o `token` a ser usado no header `Authorization: Bearer <token>` nas chamadas seguintes (ver [API REST](04-api-rest.md) e [Autenticação e Autorização](05-autenticacao-autorizacao.md)).

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:3000` e consome a API em `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8080/api`, já apontando para o backend local). Para apontar para outro backend, crie um `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Outros scripts disponíveis (`frontend/package.json`):

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # ESLint
```

> Atenção: como descrito em [Frontend — Lacunas conhecidas](06-frontend.md#lacunas-conhecidas), o frontend ainda não envia o token JWT nas requisições. Rodando o backend com o `SecurityConfig` atual, a maioria das chamadas do frontend retornará `401/403` até que a autenticação seja implementada na camada de UI.

## Nota de segurança

O `application.properties` versionado no repositório contém, em texto plano: a senha do banco de dados e a chave de assinatura JWT (`jwt.secret`). Isso é aceitável para desenvolvimento local, mas **antes de qualquer deploy** essas credenciais devem ser movidas para variáveis de ambiente / secrets manager e removidas do controle de versão.

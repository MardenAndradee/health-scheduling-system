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

A aplicação sobe em `http://localhost:3000`. As chamadas de API vão para `/api/*` (mesma origem) e o `next.config.ts` repassa isso para o backend por trás dos panos — necessário pro cookie de sessão do login funcionar (ver [Autenticação e Autorização](05-autenticacao-autorizacao.md)). O destino do proxy é `BACKEND_URL` (padrão `http://localhost:8080/api`, já apontando para o backend local); para apontar para outro backend, crie um `frontend/.env.local`:

```
BACKEND_URL=http://localhost:8080/api
```

Outros scripts disponíveis (`frontend/package.json`):

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # ESLint
```

> O frontend autentica via cookie `HttpOnly` definido pelo backend no login — nada a configurar manualmente. Se o backend rodar numa porta diferente do padrão, lembre de ajustar `BACKEND_URL` (acima), senão o proxy do Next.js aponta pro lugar errado e toda chamada autenticada retorna `401`.

## Nota de segurança

O `application.properties` versionado no repositório contém, em texto plano: a senha do banco de dados e a chave de assinatura JWT (`jwt.secret`). Isso é aceitável para desenvolvimento local, mas **antes de qualquer deploy** essas credenciais devem ser movidas para variáveis de ambiente / secrets manager e removidas do controle de versão.

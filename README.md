# Level Cripto PRO — Landing Page

![Build](https://img.shields.io/github/actions/workflow/status/arturnery/LevelCriptoPRO/ci.yml?branch=main&label=build)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-20%2B-brightgreen)
![Tests](https://img.shields.io/badge/tests-108%20passing-success)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

Landing page fullstack para o curso **Level Cripto PRO**, com sistema de captação de leads integrado a banco de dados. O projeto foi migrado de uma plataforma proprietária (Manus) para uma stack open source sob controle total do desenvolvedor, reduzindo o custo de infraestrutura a **zero**.

---

## Demo

> 🔗 https://www.levelcripto.com.br/

![Screenshot da landing page](client/public/images/hero-bg.png)

---

## Funcionalidades

- Formulário de lista de espera com validação de nome, e-mail e telefone (BR + internacional)
- Detecção de e-mail duplicado com feedback amigável ao usuário
- Countdown dinâmico para abertura de turma (calculado a partir de data-alvo)
- Carousel de depoimentos com navegação por dots e setas
- Seções de módulos, diferenciais, eventos e FAQ com layout responsivo
- Modal de sucesso pós-inscrição com fechamento automático

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + TypeScript | 19 / 5.x |
| Build | Vite | 7.x |
| Estilo | TailwindCSS 4 + Radix UI (Shadcn/ui) | 4.x |
| Roteamento client | Wouter | 3.x |
| API client | tRPC + TanStack Query | 11.x / 5.x |
| Validação | Zod | 4.x |
| Backend | Node.js + Express | 20+ / 4.x |
| ORM | Drizzle ORM | 0.44 |
| Banco de dados | PostgreSQL (Neon serverless) | 17 |
| Auth | JWT via `jose` | 6.x |
| Deploy | Vercel (serverless) | — |
| Bundler servidor | esbuild | 0.25 |
| Testes | Vitest | 2.x |

### Arquitetura

```mermaid
graph TD
    Browser["Browser (React SPA)"]
    tRPCClient["tRPC Client\n(httpBatchLink)"]
    Vercel["Vercel\napi/trpc/[trpc].js\n(serverless function)"]
    Express["Express Server\n(dev local)"]
    tRPCServer["tRPC Router\n(appRouter)"]
    Drizzle["Drizzle ORM"]
    Neon["Neon PostgreSQL\n(serverless)"]

    Browser --> tRPCClient
    tRPCClient -- "produção\nPOST /api/trpc/*" --> Vercel
    tRPCClient -- "dev local\nPOST /api/trpc/*" --> Express
    Vercel --> tRPCServer
    Express --> tRPCServer
    tRPCServer --> Drizzle
    Drizzle --> Neon
```

O mesmo `appRouter` serve tanto o servidor Express (dev) quanto a serverless function do Vercel (produção), sem nenhum código duplicado.

---

## Decisões técnicas e trade-offs

### tRPC ao invés de REST
Type safety end-to-end sem geração de código. O cliente React conhece os tipos dos endpoints automaticamente via inferência do TypeScript — erros de contrato são capturados em tempo de compilação, não em produção.

### Drizzle ORM ao invés de Prisma
Drizzle mantém o schema como fonte única de verdade em TypeScript puro. A ausência de um processo separado de geração de código simplifica o CI e o build do Vercel. O driver `neon-http` usa HTTP/fetch nativamente, compatível com o runtime serverless sem necessidade de connection pooling explícito.

### Neon Serverless PostgreSQL
Free tier permanente com suporte nativo a HTTP queries — elimina o overhead de manter conexões TCP em funções serverless que escalam a zero. Trade-off: latência ~50–100ms por query (aceitável para um formulário de lead).

### Pre-bundling da função Vercel com esbuild
O Vercel compila TypeScript para JavaScript mas **não resolve imports relativos locais em projetos com `"type": "module"`** (Node.js ESM). A solução foi pré-compilar `server/trpc-handler.ts` com esbuild (`--bundle --packages=external`) antes do deploy, gerando `api/trpc/[trpc].js` como bundle autossuficiente. Sem isso, o runtime recebia `ERR_MODULE_NOT_FOUND` em produção.

### Zod v4 + tRPC v11
tRPC v11.10+ suporta Zod v4 nativamente. A validação de input é declarada uma vez no servidor e propagada automaticamente ao cliente via tipos inferidos — sem duplicar schemas.

### Validação de telefone dual-mode
Números brasileiros seguem máscara `(XX) 9XXXX-XXXX`. Números internacionais (prefixo `+`) são aceitos em formato livre com 7–15 dígitos — detectado pelo prefixo `+` sem forçar parsing de código de país.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- pnpm 10+
- Conta no [Neon](https://neon.tech) (free tier)

### Instalação

```bash
git clone https://github.com/arturnery/LevelCriptoPRO.git
cd LevelCriptoPRO
pnpm install
```

### Variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
JWT_SECRET=string-aleatoria-segura-minimo-32-chars
NODE_ENV=development
```

### Criar as tabelas

```bash
pnpm db:push
```

### Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse: `http://localhost:3000`

### Build de produção

```bash
pnpm build
```

Gera:
- `dist/public/` — frontend estático (Vite)
- `dist/index.js` — servidor Express bundlado (esbuild)
- `api/trpc/[trpc].js` — serverless function bundlada (esbuild)

---

## Testes

```bash
pnpm test
```

```
Test Files  8 passed (8)
     Tests  108 passed (108)
  Duration  1.6s
```

Cobertura dos testes:

| Arquivo | O que testa |
|---|---|
| `form-validation.test.ts` | Validação completa do formulário de inscrição |
| `phone-validation.test.ts` | Máscaras e regras do campo telefone |
| `duplicate-email.test.ts` | Comportamento para e-mails já cadastrados |
| `drizzle-error-handling.test.ts` | Extração de erros do Drizzle/PostgreSQL |
| `error-extraction.test.ts` | Parser de mensagens de erro tRPC |
| `nome-validation.test.ts` | Validação do campo nome |
| `format-phone.test.ts` | Formatação automática de telefone |
| `auth.logout.test.ts` | Fluxo de logout via tRPC |

---

## Estrutura de pastas

```
.
├── api/
│   └── trpc/
│       └── [trpc].js          # Bundle pré-compilado — serverless function Vercel
├── client/
│   ├── public/
│   │   ├── images/            # Imagens e favicons
│   │   └── videos/            # Vídeos estáticos
│   └── src/
│       ├── _core/hooks/       # useAuth — hook de autenticação
│       ├── components/        # Componentes React (UI Shadcn + específicos)
│       ├── contexts/          # ThemeContext
│       ├── lib/               # Configuração do tRPC client
│       └── pages/
│           ├── Home.tsx       # Landing page principal (~1300 linhas)
│           └── NotFound.tsx   # Página 404
├── drizzle/
│   └── schema.ts              # Schema do banco (fonte única de verdade)
├── scripts/
│   └── build-api.mjs          # Script esbuild para a serverless function
├── server/
│   ├── _core/
│   │   ├── context.ts         # Contexto tRPC (Express)
│   │   ├── cookies.ts         # Opções de cookie por ambiente
│   │   ├── env.ts             # Variáveis de ambiente centralizadas
│   │   ├── index.ts           # Entry point Express
│   │   ├── sdk.ts             # JWT session (sign / verify)
│   │   ├── systemRouter.ts    # Router de sistema (health check)
│   │   ├── trpc.ts            # Instância tRPC + middlewares
│   │   └── vite.ts            # Integração Vite em modo dev
│   ├── db.ts                  # Queries Drizzle (getDb, createInscricao, etc.)
│   ├── routers.ts             # appRouter — todos os endpoints
│   └── trpc-handler.ts        # Handler para a serverless function
└── shared/
    ├── _core/errors.ts        # Erros compartilhados
    └── const.ts               # Constantes (cookie name, timeouts, etc.)
```

---

## Roadmap

- [ ] Painel admin com autenticação JWT para visualizar inscrições
- [ ] Webhook para notificação via WhatsApp/e-mail a cada novo lead
- [ ] Internacionalização (i18n) para inglês e espanhol
- [ ] Testes E2E com Playwright
- [ ] CI/CD com GitHub Actions (lint + testes + deploy automático)
- [ ] Métricas de conversão do formulário

---

## O que aprendi com o projeto

**Limitações do Node.js ESM em produção serverless.** O Vercel compila TypeScript mas não resolve imports relativos quando o projeto usa `"type": "module"`. A solução (pre-bundle com esbuild) foi descoberta debugando o erro `ERR_MODULE_NOT_FOUND` em produção — localmente funcionava porque `tsx` resolve TypeScript diretamente. Isso evidencia por que entender a diferença entre o toolchain de desenvolvimento e o runtime de produção é crítico.

**tRPC como contrato de API.** Em projetos onde o mesmo desenvolvedor controla cliente e servidor, tRPC elimina uma camada inteira de fricção (documentação de API, serialização manual, tipos duplicados). O custo é o acoplamento — não funciona bem em APIs públicas consumidas por terceiros.

**Serverless com banco relacional.** Conexões TCP tradicionais não escalam bem em funções que inicializam do zero a cada invocação. O driver HTTP do Neon (`@neondatabase/serverless`) resolve isso elegantemente, mas adiciona latência por query. Para casos de uso de alta frequência, connection pooling via PgBouncer seria necessário.

**Migração de plataforma proprietária.** Remover dependências do Manus exigiu entender o que era infraestrutura (OAuth, storage, CDN) versus produto (formulário, conteúdo). A decisão de simplificar (remover auth social, usar assets locais) reduziu a complexidade sem comprometer a funcionalidade essencial.

---

## Contato

**Artur Nery**

- LinkedIn: https://www.linkedin.com/in/artur-matoso-nery-84a4971a9/
- E-mail: arturnery97@gmail.com
- GitHub: [@arturnery](https://github.com/arturnery)

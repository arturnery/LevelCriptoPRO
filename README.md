# Level Cripto PRO — Landing Page

![Build](https://img.shields.io/github/actions/workflow/status/arturnery/LevelCriptoPRO/ci.yml?branch=main&label=build)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-20%2B-brightgreen)
![Tests](https://img.shields.io/badge/tests-47%20passing-success)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

Landing page fullstack para o curso **Level Cripto PRO**, com sistema de captação de leads integrado a banco de dados. O projeto foi migrado de uma plataforma proprietária (Manus) para uma stack open source sob controle total do desenvolvedor, reduzindo o custo de infraestrutura a **zero**.

---

## Demo

> 🔗 https://www.levelcripto.com.br/

![Screenshot da landing page](client/public/images/demo.png)

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
O projeto usa Zod 4 com tRPC 11 (instalado 11.10; piso declarado `^11.6.0`). Os **tipos** do router são inferidos e propagados ao cliente sem codegen. A validação de _runtime_ do input mora em `shared/validation.ts` (`criarInscricaoSchema`) e é importada tanto pelo servidor (`inscricoes.criar`) quanto pelo cliente — schema declarado uma vez, uma fonte de verdade para os dois lados.

### Contrato de API carrega dados, não apresentação
O campo de telefone formata para exibição, mas o que trafega para a API é a forma **normalizada** (`normalizePhone`: dígitos, com `+` no internacional). O servidor valida dígitos (`isValidPhone`), não a string mascarada — um telefone de puro lixo é reprovado no contrato, não só no navegador.

### Validação de telefone dual-mode
Números brasileiros seguem máscara `(XX) 9XXXX-XXXX` (11 dígitos, 9 na terceira posição). Números internacionais (prefixo `+`) são aceitos em formato livre com 7–15 dígitos — detectado pelo prefixo `+` sem forçar parsing de código de país. As mesmas regras valem no cliente e no servidor, porque ambos importam de `shared/validation.ts`.

### Detecção de duplicata sem parsing de string
`inscricoes.criar` grava com `onConflictDoNothing({ target: email }).returning()`: o caminho feliz resolve em uma única ida ao banco e a duplicata é detectada estruturalmente (returning vazio), sem depender do texto da mensagem de erro do Postgres. O núcleo dessa decisão é a função pura `interpretInsert`, coberta por teste.

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
     Tests  47 passed (47)
  Duration  1.3s
```

Todos os testes importam o código de produção (de `shared/`, `server/db.ts` ou
`server/routers.ts`) em vez de manter uma cópia da lógica — se a implementação
mudar e um teste ficar desatualizado, ele quebra em vez de passar em silêncio.

| Arquivo | O que testa | Alvo de produção |
|---|---|---|
| `criar-inscricao-schema.test.ts` | Contrato de input de `inscricoes.criar`, incluindo a rejeição de telefone-lixo | `criarInscricaoSchema` |
| `phone-validation.test.ts` | Regras dual-mode e mensagens do telefone | `isValidPhone`, `phoneErrorMessage` |
| `format-phone.test.ts` | Máscara de exibição (BR e internacional) | `formatPhone` |
| `form-validation.test.ts` | Validação de e-mail e telefone | `isValidEmail`, `isValidPhone` |
| `nome-validation.test.ts` | Campo nome dentro do schema | `nomeSchema`, `criarInscricaoSchema` |
| `duplicate-email.test.ts` | Detecção estrutural de duplicata | `interpretInsert` |
| `error-extraction.test.ts` | Mapa de erro do formulário via `zodError` | `mensagemDeErro` |
| `auth.logout.test.ts` | Fluxo de logout via tRPC | `appRouter` (createCaller) |

O typecheck e a suíte rodam a cada push e pull request pelo workflow
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

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

### Interface e acessibilidade

Frentes levantadas em auditoria de design e priorizadas para as próximas iterações:

- [ ] **Escala tipográfica com hierarquia** — hoje o peso 900 (`font-black`) é usado em quase todo texto; criar degraus de peso e tamanho entre título e corpo.
- [ ] **Sistema de cores unificado via tokens** — padronizar os CTAs, elevar o contraste ao mínimo WCAG AA (texto azul-escuro sobre preto está em ~2:1) e trazer os cards de depoimento para o tema escuro.
- [ ] **Navegação mobile** — menu abaixo de 768px, alvos de toque ≥ 44px e correção do overflow horizontal.
- [ ] **Texto fora das imagens** — mover para HTML o texto hoje embutido nos PNGs de módulos e diferenciais (busca, tradução e leitor de tela).
- [ ] **Acessibilidade WCAG AA completa** — `aria-expanded` no FAQ, rótulos nos controles do carrossel, foco visível, `prefers-reduced-motion` e `alt` descritivo nas imagens.
- [ ] **Otimização de assets** — vídeos < 2 MB (MP4/WebM com `poster`, sem autoplay pesado) e imagens em WebP com `loading="lazy"`.

### Produto

- [ ] Painel admin com autenticação JWT para visualizar inscrições
- [ ] Webhook para notificação via WhatsApp/e-mail a cada novo lead
- [ ] Internacionalização (i18n) para inglês e espanhol
- [ ] Métricas de conversão do formulário

### Qualidade e infraestrutura

- [x] **CI com GitHub Actions** (typecheck + testes a cada push/PR) — [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- [x] **Validação como fonte única** compartilhada entre cliente e servidor (`shared/validation.ts`)
- [ ] Deploy automático no merge para `main`
- [ ] Testes E2E com Playwright

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

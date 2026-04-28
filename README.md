# Level Cripto PRO — Landing Page

Landing page da plataforma **Level Cripto PRO**, curso de criptomoedas do zero ao avançado com lista de espera integrada.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS 4 |
| Componentes | Radix UI (Shadcn/ui) |
| Roteamento | Wouter |
| API | tRPC v11 + TanStack Query |
| Backend | Node.js, Express |
| Banco de dados | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| Autenticação | JWT (jose) |
| Deploy | Vercel (serverless) |

## Funcionalidades

- Landing page com seções de benefícios, módulos, professor, diferenciais, depoimentos e FAQ
- Formulário de lista de espera com validação de nome, email e telefone
- Modal de sucesso após inscrição
- Countdown dinâmico para abertura de turma
- Carousel de depoimentos
- Layout responsivo (mobile-first)

## Estrutura do projeto

```
├── api/
│   └── trpc/[trpc].ts     # Handler serverless Vercel
├── client/
│   ├── public/
│   │   ├── images/        # Imagens estáticas
│   │   └── videos/        # Vídeos estáticos
│   └── src/
│       ├── components/    # Componentes React (UI + específicos)
│       ├── pages/         # Páginas (Home, NotFound)
│       └── lib/           # tRPC client
├── drizzle/
│   └── schema.ts          # Schema do banco de dados
├── server/
│   ├── _core/             # Infraestrutura (Express, tRPC, auth, JWT)
│   ├── db.ts              # Queries do banco de dados
│   └── routers.ts         # Rotas tRPC
└── shared/                # Tipos e constantes compartilhados
```

## Como rodar localmente

**Pré-requisitos:** Node.js 20+, pnpm

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# Crie um arquivo .env na raiz com as variáveis abaixo

# Criar tabelas no banco
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

Acesse: `http://localhost:3000`

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do PostgreSQL (Neon) |
| `JWT_SECRET` | Chave secreta para assinar tokens de sessão |
| `NODE_ENV` | `development` ou `production` |

## Deploy

O projeto está configurado para deploy na **Vercel**:

1. Importe o repositório no Vercel
2. Configure as variáveis de ambiente acima
3. O build e deploy são automáticos a cada push na branch `main`

## Testes

```bash
pnpm test
```

108 testes unitários cobrindo validações de formulário, erros do banco e fluxo de autenticação.

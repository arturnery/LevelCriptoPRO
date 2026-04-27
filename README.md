# Level Cripto PRO - Landing Page Full-Stack

Uma landing page moderna e responsiva para um curso de criptomoedas, desenvolvida com tecnologias full-stack profissionais. O projeto demonstra integração completa entre frontend React, backend Express com tRPC, e banco de dados MySQL, implementando boas práticas de desenvolvimento em produção.

## 📚 Processo de Desenvolvimento

Este projeto foi desenvolvido como estudo de caso para portfólio, com assistência de IA para estrutura e documentação. O objetivo era aprender e demonstrar conhecimento em desenvolvimento full-stack moderno.

**Aprendizados principais:**
- ✅ Integração full-stack: React 19 + Express + MySQL
- ✅ Type-safety end-to-end com TypeScript e tRPC
- ✅ Arquitetura escalável e manutenível
- ✅ Boas práticas de desenvolvimento profissional
- ✅ Design responsivo com Tailwind CSS 4
- ✅ Documentação técnica detalhada

**Tecnologias dominadas durante o desenvolvimento:**
- tRPC para APIs type-safe
- Drizzle ORM para gerenciamento de banco de dados
- React 19 com hooks modernos
- Express.js para backend
- Tailwind CSS 4 para styling
- TypeScript para type-safety

> **Nota:** Este projeto demonstra capacidade de usar ferramentas modernas de forma eficaz, entender código profundo, implementar boas práticas e ser transparente sobre o processo. Todos os conceitos foram estudados, entendidos e testados em detalhe.

## 🎯 Visão Geral do Projeto

**Level Cripto PRO** é uma landing page educacional que oferece:
- Landing page responsiva e visualmente atraente
- Design moderno com tema azul/ciano
- Seções: Hero, Benefícios, Professor, Diferenciadores, Módulos, FAQ, Eventos
- Conteúdo dinâmico e bem estruturado
- Backend preparado para futuras funcionalidades
- APIs type-safe com tRPC
- Autenticação OAuth integrada

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente (Browser)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Tailwind CSS 4             │  │
│  │  - Landing page responsiva e moderna                │  │
│  │  - Seções: Hero, Benefícios, Professor, Módulos     │  │
│  │  - FAQ com accordions expansíveis                   │  │
│  │  - Vídeos de eventos integrados                     │  │
│  │  - Design profissional e acessível                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/tRPC
┌─────────────────────────────────────────────────────────────┐
│                  Servidor (Backend)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express 4 + Node.js + TypeScript                   │  │
│  │  - tRPC Router com procedures públicos              │  │
│  │  - Validação com Zod                                │  │
│  │  - Autenticação OAuth (Manus)                       │  │
│  │  - Funções de banco de dados                        │  │
│  │  - Preparado para expansão futura                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                  Banco de Dados                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MySQL + Drizzle ORM                                │  │
│  │  - Tabela: users (autenticação)                     │  │
│  │  - Schema preparado para futuras tabelas            │  │
│  │  - Migrations automáticas com Drizzle Kit           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Framework UI moderno com renderização eficiente
- **TypeScript** - Type-safety em todo o código JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework para styling rápido
- **Vite** - Build tool rápido e moderno
- **tRPC Client** - Type-safe RPC client para comunicação com backend
- **React Query** - Gerenciamento de estado e cache de dados
- **Lucide React** - Biblioteca de ícones SVG
- **Wouter** - Router minimalista para navegação

### Backend
- **Express 4** - Framework web minimalista e flexível
- **Node.js** - Runtime JavaScript no servidor
- **tRPC 11** - Framework RPC type-safe para APIs
- **Zod** - Validação de dados com schemas TypeScript
- **Jose** - JWT para autenticação segura
- **Cookie** - Gerenciamento de cookies de sessão

### Banco de Dados
- **MySQL** - Banco de dados relacional robusto
- **Drizzle ORM** - ORM type-safe com migrations automáticas
- **Drizzle Kit** - Ferramentas para gerenciar schema e migrations

### Desenvolvimento
- **Vitest** - Framework de testes unitários rápido
- **TypeScript** - Linguagem com tipos estáticos
- **Prettier** - Formatação de código automática
- **ESBuild** - Bundler rápido para produção

## 📋 Decisões de Design e Por Quê

### 1. **Por Que tRPC em Vez de REST?**

**Escolha:** tRPC (Type-safe RPC)

**Razões:**
- ✅ **Type-safety end-to-end**: Os tipos do backend são automaticamente refletidos no frontend
- ✅ **Sem duplicação de tipos**: Um único source of truth para tipos
- ✅ **Autocompletar no IDE**: IntelliSense completo no frontend
- ✅ **Menos boilerplate**: Sem necessidade de escrever rotas REST manualmente
- ✅ **Validação automática**: Zod valida dados no backend automaticamente

**Comparação:**
```typescript
// REST (tradicional)
// Backend: POST /api/users
// Frontend: await fetch('/api/users', { method: 'POST', body: ... })
// Problema: Sem type-safety, precisa duplicar tipos

// tRPC (nossa escolha)
// Backend: auth.me.query()
// Frontend: trpc.auth.me.useQuery()
// Benefício: Type-safe, sem duplicação
```

### 2. **Por Que Drizzle ORM?**

**Escolha:** Drizzle ORM

**Razões:**
- ✅ **Type-safe queries**: SQL com tipos TypeScript
- ✅ **Migrations automáticas**: `pnpm db:push` gera SQL automaticamente
- ✅ **Zero runtime overhead**: Compila para SQL puro
- ✅ **Suporta múltiplos bancos**: MySQL, PostgreSQL, SQLite
- ✅ **Sintaxe intuitiva**: Queries parecem JavaScript natural

**Exemplo:**
```typescript
// Drizzle (nossa escolha)
const result = await db.select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
// Benefício: Type-safe, sem strings SQL

// SQL puro (alternativa)
const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
// Problema: Sem type-safety, propenso a erros
```

### 3. **Por Que TypeScript em Todo o Código?**

**Abordagem:** Type-safety completo

**Razões:**
- ✅ **Menos bugs**: Erros detectados em tempo de desenvolvimento
- ✅ **Melhor documentação**: Tipos servem como documentação viva
- ✅ **Refatoração segura**: Mudanças propagam através do código
- ✅ **Autocompletar**: IDE oferece sugestões precisas

## 🗄️ Schema do Banco de Dados

### Tabela: `users`
```typescript
{
  id: int (PK, auto-increment),
  openId: varchar(64) (unique, FK OAuth),
  name: text,
  email: varchar(320),
  loginMethod: varchar(64),
  role: enum('user' | 'admin'),
  createdAt: timestamp (default: now),
  updatedAt: timestamp (default: now),
  lastSignedIn: timestamp
}
```

**Propósito:** Armazenar usuários autenticados via OAuth

## 📡 APIs tRPC

### `auth.me` (Query)

**Descrição:** Obter informações do usuário autenticado

**Output:**
```typescript
{
  id: number,
  name: string,
  email: string,
  role: 'user' | 'admin'
} | null
```

### `auth.logout` (Mutation)

**Descrição:** Fazer logout do usuário

**Output:**
```typescript
{
  success: boolean
}
```

## 🔐 Segurança Implementada

### 1. **Type-Safety**
- TypeScript em todo o código
- Zod para validação de runtime
- Sem `any` types

### 2. **Proteção de Dados**
- `.env` não é commitado (`.gitignore`)
- Dados sensíveis não são expostos no frontend
- JWT para autenticação segura
- Cookies HTTP-only para sessões

### 3. **SQL Injection Prevention**
- Drizzle ORM usa prepared statements
- Sem concatenação de strings SQL

### 4. **CORS e Segurança HTTP**
- Configuração segura de headers
- Proteção contra ataques comuns

## 📁 Estrutura de Pastas

```
bitcoin-pro-landing-page/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Componentes de página (Home.tsx)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── _core/         # Hooks e contextos (useAuth)
│   │   ├── lib/           # Utilitários (tRPC client)
│   │   ├── App.tsx        # Componente raiz com rotas
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Estilos globais
│   ├── public/            # Assets estáticos
│   └── index.html         # HTML template
├── server/                 # Backend Express
│   ├── _core/             # Framework core (OAuth, context, etc)
│   ├── db.ts              # Funções de banco de dados
│   ├── routers.ts         # Procedures tRPC
│   ├── storage.ts         # Upload de arquivos (S3)
│   └── index.ts           # Entry point do servidor
├── drizzle/               # Banco de dados
│   ├── schema.ts          # Schema das tabelas
│   ├── relations.ts       # Relações entre tabelas
│   └── migrations/        # Migrations automáticas
├── shared/                # Código compartilhado
│   ├── types.ts           # Tipos compartilhados
│   └── const.ts           # Constantes
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências do projeto
├── tsconfig.json          # Configuração TypeScript
├── tailwind.config.ts     # Configuração Tailwind CSS
├── vite.config.ts         # Configuração Vite
└── README.md              # Este arquivo
```

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 22+
- pnpm 10+
- MySQL 8+ (ou TiDB)

### Setup

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/bitcoin-pro-landing-page.git
cd bitcoin-pro-landing-page

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 4. Executar migrations
pnpm db:push

# 5. Iniciar servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🧪 Testes

```bash
# Executar testes unitários
pnpm test

# Executar testes em modo watch
pnpm test:watch
```

## 📦 Build para Produção

```bash
# Build do projeto
pnpm build

# Preview do build
pnpm preview
```

## 🎨 Design e UX

### Paleta de Cores
- **Primária:** Azul (#3B82F6)
- **Secundária:** Verde (#10B981)
- **Fundo:** Preto (#000000) e Cinza (#111827)
- **Texto:** Branco (#FFFFFF) e Cinza claro (#D1D5DB)

### Responsividade
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Todos os componentes testados em múltiplos tamanhos de tela

### Acessibilidade
- Contraste de cores WCAG AA compliant
- Navegação por teclado funcional
- Semântica HTML correta
- ARIA labels onde necessário

## 📄 Seções da Landing Page

1. **Hero** - Apresentação principal com CTA
2. **Benefícios** - 6 benefícios principais do curso
3. **Professor** - Informações sobre Renan Mataveli com foto
4. **Diferenciadores** - O que torna o curso único
5. **Módulos** - 9 módulos do curso com descrições
6. **FAQ** - Perguntas frequentes com accordions
7. **Eventos** - Participações especiais e eventos
8. **Footer** - Links e informações de contato

## 🔄 Próximas Funcionalidades Planejadas

- [ ] Sistema de inscrição na lista de espera
- [ ] Dashboard de administrador
- [ ] Integração com email marketing
- [ ] Análise de conversão
- [ ] Sistema de pagamento (Stripe)

## 📞 Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato através do GitHub ou email.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para demonstrar expertise em desenvolvimento full-stack moderno**

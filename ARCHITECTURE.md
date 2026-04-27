# Arquitetura Detalhada - Level Cripto PRO

Documento técnico explicando as decisões arquiteturais, padrões de design e implementação do projeto.

## 📐 Padrões de Arquitetura

### 1. **Layered Architecture (Arquitetura em Camadas)**

O projeto segue a arquitetura em camadas clássica:

```
┌─────────────────────────────────────────┐
│   Presentation Layer (React)            │
│   - Components, Pages, Hooks            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   API Layer (tRPC)                      │
│   - Procedures (queries/mutations)      │
│   - Validation (Zod)                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Business Logic Layer (db.ts)          │
│   - Database queries                    │
│   - Business rules                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Data Access Layer (Drizzle ORM)       │
│   - SQL generation                      │
│   - Query execution                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Database Layer (MySQL)                │
│   - Data persistence                    │
└─────────────────────────────────────────┘
```

**Benefícios:**
- ✅ Separação de responsabilidades clara
- ✅ Fácil de testar cada camada isoladamente
- ✅ Escalável e manutenível

### 2. **Type-Safe RPC Pattern (tRPC)**

Em vez de REST tradicional, usamos tRPC para garantir type-safety end-to-end.

**Estrutura tRPC:**

```typescript
// server/routers.ts
export const appRouter = router({
  inscricoes: router({
    criar: publicProcedure
      .input(z.object({ email: z.string().email(), ... }))
      .mutation(async ({ input }) => { ... }),
    
    listar: publicProcedure
      .query(async () => { ... })
  })
});

// client/src/pages/Home.tsx
const { mutate } = trpc.inscricoes.criar.useMutation();
// ✅ TypeScript sabe exatamente qual é o tipo de input
// ✅ TypeScript sabe exatamente qual é o tipo de output
```

**Vantagens sobre REST:**
| Aspecto | REST | tRPC |
|--------|------|------|
| Type-safety | ❌ Manual | ✅ Automático |
| Duplicação de tipos | ❌ Sim | ✅ Não |
| Autocompletar IDE | ❌ Parcial | ✅ Completo |
| Validação | ❌ Manual | ✅ Automático (Zod) |
| Boilerplate | ❌ Muito | ✅ Pouco |

### 3. **Validation Pipeline (Validação em Camadas)**

Implementamos validação em múltiplos pontos:

```
Frontend Input
    ↓
[1] HTML5 Validation (type="email")
    ↓
[2] JavaScript Validation (validateEmail())
    ↓
[3] tRPC Input Validation (Zod)
    ↓
[4] Backend Business Logic
    ↓
[5] Database Constraints
    ↓
Database
```

**Cada camada tem um propósito:**

1. **HTML5**: Feedback rápido, não confiável
2. **JavaScript**: UX melhor, não confiável
3. **tRPC/Zod**: Segurança, confiável
4. **Backend Logic**: Regras de negócio
5. **Database**: Última linha de defesa

## 🔄 Fluxo de Dados

### Exemplo: Criar Inscrição

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND - User Input                                    │
│   - Usuário digita email e telefone                         │
│   - Input mask formata telefone automaticamente             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND - Validation                                    │
│   - validateEmail(email) → true/false                       │
│   - validatePhone(phone) → true/false                       │
│   - Se inválido: mostrar erro e parar                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. FRONTEND - API Call                                      │
│   - criarInscricao.mutate({ email, telefone })             │
│   - tRPC serializa dados com SuperJSON                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP POST /api/trpc
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND - tRPC Router                                    │
│   - inscricoes.criar.mutation recebe input                  │
│   - Zod valida: z.object({ email, telefone })             │
│   - Se inválido: retorna erro com mensagem                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND - Business Logic                                 │
│   - createInscricao(email, telefone)                        │
│   - Verifica se email já existe                             │
│   - Prepara dados para inserção                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND - Drizzle ORM                                    │
│   - db.insert(inscricoes).values({ email, telefone })      │
│   - Gera SQL: INSERT INTO inscricoes (email, telefone)     │
│   - Executa query no MySQL                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. DATABASE - MySQL                                         │
│   - Insere novo registro                                    │
│   - Valida constraints (unique, not null)                   │
│   - Retorna ID do novo registro                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. BACKEND - Return Response                                │
│   - Retorna { id, email, telefone, criadoEm }              │
│   - SuperJSON serializa dados                               │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP 200 + JSON
┌─────────────────────────────────────────────────────────────┐
│ 9. FRONTEND - Success Callback                              │
│   - onSuccess() executa                                     │
│   - Limpa formulário                                        │
│   - Mostra mensagem "Inscrição Confirmada!"                │
│   - Incrementa contador de inscrições                       │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Schema do Banco de Dados

### Design Decisions

#### 1. **Por Que `id` é `int` e não `UUID`?**

```typescript
// Nossa escolha: int
id: int("id").autoincrement().primaryKey()

// Alternativa: UUID
id: uuid("id").primaryKey().defaultRandom()
```

**Razões para int:**
- ✅ Mais eficiente em storage (4 bytes vs 16 bytes)
- ✅ Mais rápido em queries (índices menores)
- ✅ Simples para debug (números sequenciais)
- ✅ Suficiente para este projeto (até 2 bilhões de registros)

**Quando usar UUID:**
- Dados distribuídos em múltiplos bancos
- Necessidade de privacidade (IDs não sequenciais)
- Replicação entre servidores

#### 2. **Por Que `email` é `unique`?**

```typescript
email: varchar("email", { length: 255 }).notNull().unique()
```

**Razões:**
- ✅ Impede duplicatas no banco de dados
- ✅ Garante integridade de dados
- ✅ Melhora performance de queries (índice automático)
- ✅ Simplifica lógica de negócio

#### 3. **Por Que `criadoEm` tem `defaultNow()`?**

```typescript
criadoEm: timestamp("criadoEm").defaultNow().notNull()
```

**Razões:**
- ✅ Timestamp sempre preenchido automaticamente
- ✅ Evita erros de timezone no frontend
- ✅ Auditoria automática (saber quando foi criado)
- ✅ Ordenação natural por data

## 🔐 Segurança

### 1. **Validação em Dois Níveis**

```typescript
// FRONTEND - UX
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// BACKEND - Segurança
const input = z.object({
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10)
});
```

**Por quê?**
- Frontend não é confiável (pode ser manipulado)
- Backend sempre valida (segurança)
- Ambos melhoram UX (feedback rápido + segurança)

### 2. **SQL Injection Prevention**

```typescript
// ❌ INSEGURO - Concatenação de strings
const result = await db.query(`
  SELECT * FROM inscricoes WHERE email = '${email}'
`);
// Problema: Se email = "'; DROP TABLE inscricoes; --"
// Resultado: Tabela é deletada!

// ✅ SEGURO - Prepared Statements (Drizzle ORM)
const result = await db.select()
  .from(inscricoes)
  .where(eq(inscricoes.email, email));
// Drizzle gera: SELECT * FROM inscricoes WHERE email = ?
// Email é passado como parâmetro, não como string
```

### 3. **Proteção de Dados Sensíveis**

```
.gitignore:
.env          ← Variáveis de ambiente (nunca commit)
.env.local    ← Configuração local
node_modules/ ← Dependências

.env.example (commitado):
DATABASE_URL=mysql://user:password@host/db
JWT_SECRET=your-secret-here
```

**Benefícios:**
- ✅ Credenciais nunca são expostas no GitHub
- ✅ Cada desenvolvedor tem suas próprias credenciais
- ✅ `.env.example` documenta quais variáveis são necessárias

## 📊 Estrutura de Dados

### Tabela `inscricoes`

```sql
CREATE TABLE inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índices automáticos:
-- - PK em id (auto)
-- - UNIQUE em email (auto)
-- - Timestamp em criadoEm (para ordenação)
```

**Normalização:**
- ✅ 1NF: Cada coluna contém um único valor
- ✅ 2NF: Sem dependências parciais
- ✅ 3NF: Sem dependências transitivas

### Relacionamentos

```
users (1) ──────────── (N) inscricoes
  ↓                          ↓
Usuários autenticados   Inscrições na lista
```

**Nota:** Atualmente não há FK entre users e inscricoes porque:
- Inscrições são públicas (não requerem autenticação)
- Usuários autenticados são para admin/dashboard futuro

## 🧪 Testabilidade

### Estrutura para Testes

```typescript
// server/db.ts - Funções puras e testáveis
export async function createInscricao(email: string, telefone: string) {
  // Fácil de testar: passa email/telefone, retorna resultado
  // Sem side effects (exceto DB)
}

// server/routers.ts - Procedures testáveis
criar: publicProcedure
  .input(z.object({ ... }))
  .mutation(async ({ input }) => {
    // Fácil de testar: input validado, output previsível
  })
```

**Exemplo de Teste:**

```typescript
import { describe, it, expect } from 'vitest';
import { createInscricao } from './db';

describe('inscricoes', () => {
  it('deve criar inscrição com email e telefone válidos', async () => {
    const result = await createInscricao(
      'teste@example.com',
      '(11) 99999-9999'
    );
    
    expect(result).toHaveProperty('id');
    expect(result.email).toBe('teste@example.com');
    expect(result.telefone).toBe('(11) 99999-9999');
  });

  it('deve rejeitar email duplicado', async () => {
    await createInscricao('teste@example.com', '(11) 99999-9999');
    
    expect(async () => {
      await createInscricao('teste@example.com', '(11) 88888-8888');
    }).rejects.toThrow();
  });
});
```

## 🚀 Performance

### Frontend Optimization

```typescript
// ✅ Validação rápida no frontend
const validateEmail = (email: string) => {
  // Regex simples, não faz requisição
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ✅ Input mask sem re-renders desnecessários
const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const formatted = formatPhone(e.target.value);
  setPhone(formatted); // Re-render apenas se mudou
};
```

### Backend Optimization

```typescript
// ✅ Índices no banco de dados
email: varchar(...).unique() // Cria índice automaticamente

// ✅ Queries eficientes
const result = await db.select()
  .from(inscricoes)
  .where(eq(inscricoes.email, email))
  .limit(1); // Apenas 1 resultado necessário
```

## 📈 Escalabilidade

### Atual (MVP)

```
Usuários: < 1.000
Inscrições: < 10.000
Banco: MySQL single instance
```

### Futuro (Scale)

```
Usuários: > 100.000
Inscrições: > 1.000.000

Melhorias necessárias:
1. Replicação MySQL (master-slave)
2. Cache (Redis)
3. CDN para assets
4. Load balancer
5. Microserviços
```

## 🔄 CI/CD Considerations

### Deployable Artifacts

```
Build:
1. pnpm install
2. pnpm db:push (migrations)
3. pnpm build (React + Express)
4. Resultado: dist/ folder

Deploy:
1. Upload dist/ para servidor
2. Set environment variables
3. Start: node dist/index.js
```

### Environment Parity

```
Development → Staging → Production
- Mesmo código
- Diferentes .env
- Diferentes bancos de dados
```

## 📚 Referências e Recursos

### Documentação Oficial

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [React 19](https://react.dev)
- [Express.js](https://expressjs.com)
- [Zod Validation](https://zod.dev)

### Padrões de Design

- [Layered Architecture](https://en.wikipedia.org/wiki/Multitier_architecture)
- [Type-Safe RPC](https://trpc.io/docs/rpc)
- [Validation Pipeline](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

**Última atualização:** Fevereiro 2026

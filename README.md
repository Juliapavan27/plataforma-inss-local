# Recurso Fácil

SaaS para geração automatizada de recursos administrativos contra decisões do INSS.
Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · NextAuth · Stripe · Anthropic Claude**.

## Arquitetura

```
src/
├── app/
│   ├── page.tsx                       → landing page de alta conversão
│   ├── novo-recurso/                  → fluxo guiado em 4 etapas
│   ├── login/ · cadastro/             → autenticação
│   ├── dashboard/                     → área do cliente (histórico, download e acompanhamento)
│   ├── admin/                         → painel admin (usuários, pedidos, financeiro, KB, config IA)
│   ├── calculadora/ · faq/             → topo de funil, SEO
│   ├── termos/ · privacidade/ · lgpd/ → compliance
│   └── api/                           → rotas de backend
│       ├── auth/[...nextauth]/        → NextAuth credentials
│       ├── register/                  → cadastro
│       ├── recursos/                  → CRUD + gerar + download + upload
│       ├── webhooks/stripe/           → confirma pagamento e dispara geração
│       ├── files/[key]/               → serve arquivos autenticados
│       └── admin/conhecimento/        → gestão da base RAG
├── components/                        → UI (landing, form, dashboard, admin, auth)
├── lib/
│   ├── db.ts                          → Prisma client
│   ├── auth.ts                        → NextAuth + requireUser/requireAdmin
│   ├── stripe.ts                      → gateway de pagamento
│   ├── storage.ts                     → abstração de storage (local → S3 plug-in)
│   ├── ai/
│   │   ├── index.ts                   → generateAppeal + análise auxiliar (Anthropic)
│   │   ├── prompts.ts                 → system prompt jurídico + user prompts
│   │   └── rag.ts                     → retrieval simples (tags/embedding)
│   ├── docgen/
│   │   ├── pdf.ts                     → gera PDF A4 formatado (pdf-lib)
│   │   └── docx.ts                    → gera DOCX (docx)
│   ├── appeal-service.ts              → orquestra drafting → análise auxiliar → export
│   ├── validations.ts                 → schemas Zod + dicionários de benefícios
│   └── utils.ts                       → helpers (moeda, máscaras, datas)
├── types/next-auth.d.ts               → augment da sessão com role
prisma/
├── schema.prisma                      → modelo de dados
└── seed.ts                            → admin + base de conhecimento
```

## Fluxo principal

1. Visitante acessa `/novo-recurso` e preenche o formulário (4 steps, com campos
   condicionais por tipo de benefício).
2. `POST /api/recursos` cria o `Appeal` e um `Payment`; redireciona para o Stripe Checkout.
3. Stripe confirma via webhook `/api/webhooks/stripe` → marca `Payment.PAID`, dispara
   `processAppealGeneration()`.
4. Motor de IA:
   - **RAG**: busca trechos relevantes da base de conhecimento (por tags + embeddings).
   - **Drafting**: Claude Opus redige o recurso com system prompt jurídico rígido.
   - **Análise auxiliar**: o sistema organiza observações internas para apoiar a revisão.
   - **Export**: gera PDF (pdf-lib) e DOCX (docx).
5. Cliente recebe na `/dashboard/recursos/[id]` com auto-refresh durante geração.

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (copie de .env.example)
cp .env.example .env

# 3. Gerar Prisma Client + criar tabelas
npx prisma generate
npx prisma db push

# 4. Popular admin e KB
npm run db:seed

# 5. Rodar
npm run dev
```

Acesse `http://localhost:3000`. Admin padrão: `admin@recursofacil.com.br` / `troque-esta-senha-123`.

### Variáveis obrigatórias (.env)

| Chave | Finalidade |
|-------|-----------|
| `DATABASE_URL` | PostgreSQL |
| `NEXTAUTH_SECRET` | Assinatura JWT |
| `NEXTAUTH_URL` | URL pública |
| `ANTHROPIC_API_KEY` | Motor de IA (drafting + scoring) |
| `STRIPE_SECRET_KEY` | Checkout |
| `STRIPE_WEBHOOK_SECRET` | Validação webhook |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Frontend |
| `PRICE_RECURSO_CENTS` | Preço unitário em centavos (default 29900 = R$299) |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT` | Storage persistente (obrigatório em produção — sem isso os arquivos gerados somem a cada redeploy) |

Se `STRIPE_SECRET_KEY` estiver vazio, a aplicação roda em **modo dev**: o pagamento
é marcado como pago automaticamente (apenas para testes locais). Se as variáveis `S3_*`
estiverem vazias, o storage cai para disco local (`./uploads`) — ok em dev, **não usar em produção**.

## Deploy simples na Railway

Para colocar a aplicação no ar com menos fricção, a opção mais prática para esse stack é a **Railway**. Ela permite hospedar o app Next.js e o banco PostgreSQL no mesmo fluxo.

### 1. Preparar o projeto

Este repositório já está configurado para deploy com:

- `output: "standalone"` no Next.js
- `postinstall: prisma generate`
- `npm start` apontando para `.next/standalone/server.js`

### 2. Criar os serviços

Na Railway:

1. Crie um novo projeto
2. Conecte este repositório Git
3. Adicione um serviço **PostgreSQL**
4. Adicione o serviço da aplicação web

### 3. Variáveis de ambiente

Defina pelo menos estas variáveis no serviço web:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `APP_URL`
- `PRICE_RECURSO_CENTS=29900`

E, se quiser pagamento e IA ativos em produção:

- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Se for usar armazenamento S3:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

### 4. Comandos de build e start

Na maioria dos casos, a Railway detecta automaticamente:

- Build: `npm run build`
- Start: `npm start`

### 5. Banco de dados

Como o projeto ainda não tem migrations versionadas, o caminho mais simples para esta semana é aplicar o schema com:

```bash
npx prisma db push
```

Você pode rodar isso no shell da Railway antes do primeiro uso da aplicação.

### 6. Ajustes finais

- Configure `NEXTAUTH_URL` e `APP_URL` com a URL pública final da Railway
- Cadastre o webhook do Stripe apontando para `/api/webhooks/stripe`
- Revise o seed antes de usar em produção, se não quiser conteúdo padrão

## Decisões de arquitetura

- **Next.js App Router**: SSR para SEO (calculadora, landing), RSC para páginas autenticadas.
- **Prisma + PostgreSQL**: migrations declarativas, relações fortes. Enum + índices no modelo.
- **Geração síncrona em dev / assíncrona em produção**: a função `processAppealGeneration`
  é invocada por fire-and-forget. Para produção, plugar BullMQ ou SQS (trocar a chamada
  em `src/app/api/webhooks/stripe/route.ts` e em `recursos/route.ts` para enfileirar).
- **Storage abstraído**: `src/lib/storage.ts` usa S3 (ou compatível: R2, Backblaze) quando
  `S3_BUCKET` + credenciais estão nas env vars; sem elas, cai para disco local (`./uploads`,
  só para dev — não persiste em containers efêmeros como Railway).
- **RAG simples**: por tags hoje. A coluna `KnowledgeChunk.embedding` está pronta para
  pgvector — basta trocar `Float[]` por `Unsupported("vector(1536)")` e habilitar o
  caminho em `src/lib/ai/rag.ts#safeEmbed`.
- **Dois modelos de IA**: Opus para drafting (qualidade), Haiku para análises auxiliares de baixo custo.
- **LGPD**: files autenticados por rota (`/api/files/[key]`), páginas legais dedicadas,
  senhas com bcrypt cost 12.

## Pontos a completar antes de produção

- [ ] Fila de processamento (BullMQ/Redis ou SQS+Lambda) para isolar a geração do request.
- [ ] Embeddings reais (Voyage/OpenAI/Cohere) + pgvector + índice ivfflat.
- [x] S3/R2 como storage (`storage.ts` já troca para S3 quando as env vars estão setadas).
- [ ] URLs pré-assinadas para downloads direto do S3 (hoje o arquivo ainda passa pelo servidor Next — ok no volume atual, mas vale otimizar depois).
- [ ] Observabilidade: Sentry + logs estruturados.
- [ ] Rate limiting (Upstash) nos endpoints de IA e auth.
- [ ] CSRF em endpoints sensíveis + headers de segurança (helmet equivalente).
- [ ] i18n (atualmente só pt-BR hard-coded).
- [ ] Testes: vitest para lib, playwright para o fluxo ponta-a-ponta.
- [ ] Checagem jurídica humana dos prompts + biblioteca inicial de modelos/doutrina validados.
- [ ] Upsell: revisão humana (serviço adicional) e plano mensal (Stripe subscription).

## Ética

O sistema é explicitamente um **assistente**, não um advogado. O rodapé das peças,
os termos de uso e a FAQ deixam claro que o documento deve ser revisado pelo usuário
(idealmente por profissional) antes do protocolo. O prompt jurídico proíbe invenção
de súmulas, artigos ou decisões; se o modelo não tem certeza, não cita.

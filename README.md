# Portal de Projectos e Projetos — Governo Provincial de Benguela

Frontend público + painel administrativo em **Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · i18n PT/EN**, construído contra a API REST documentada em `FRONTEND_API.md` (backend FastAPI).

> Idiomas do produto: **português (padrão)** e inglês. O painel administrativo é apenas em português.

---

## 1. Requisitos

- Node.js **20.9+** (Next 15 exige)
- Backend FastAPI acessível (ver §3). Para desenvolvimento local sem backend, use o mock incluído (`dev-tools/mock-api.mjs`, fora deste projeto — ver §6).

## 2. Arranque rápido

```bash
cd frontend
npm install
cp .env.example .env.local   # ajuste os valores (ver §3)
npm run dev                  # http://localhost:3000 → redireciona para /pt
```

Build de produção e arranque:

```bash
npm run build
npm run start
```

> Nota: `npm run build` executa `next build` (webpack) — o output é servido com `next start`. `next dev` usa Turbopack (mais rápido em desenvolvimento). **Não** use `next build --turbopack` com `next start` na versão instalada (incompatibilidade `routesManifest.dataRoutes` do 15.5).

## 3. Variáveis de ambiente

| Variável | Default | Uso |
|---|---|---|
| `API_ORIGIN` | `http://localhost:8000` | Base da API — usada **apenas no servidor** Next (Server Components) e como destino do proxy |
| `NEXT_PUBLIC_API_PREFIX` | `/backend` | Prefixo relativo que o **browser** usa para chegar à API (rewrite no `next.config.ts`) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Base para canonical/OG/sitemap/robots |
| `NEXT_PUBLIC_GA_ID` | vazio | Google Analytics (só carrega após consentimento de cookies) |

O proxy do browser está em `next.config.ts` → `rewrites`: `${NEXT_PUBLIC_API_PREFIX}/:path*` → `${API_ORIGIN}/:path*`. Assim o cliente (formulário de contacto, admin) nunca chama `localhost` diretamente nem precisa de CORS em produção — basta o Next servir o app; o mesmo rewrite funciona em `next start`.

Autenticação admin: **Bearer token** (`Authorization: Bearer …`) obtido em `POST /api/auth/login`; o token é guardado em `localStorage` e, se o backend definir cookie `portal_token` (HttpOnly), o browser também o envia automaticamente (credenciais nos pedidos via proxy). Ver `docs/API_INTEGRATION_NOTES.md` sobre o "query token" mencionado no doc de API.

## 4. Estrutura

```
frontend/src
├─ app
│  ├─ [lang]/                    # páginas públicas (pt | en), forçadas dinâmicas com microcache
│  │  ├─ page.tsx                # home (hero, estatísticas, destaques, explorador, notícias)
│  │  ├─ projetos/               # lista + detalhe ([slug])
│  │  ├─ sobre/  investidor/  contacto/  privacidade/
│  ├─ admin/                     # painel (PT-only, noindex, guard de sessão)
│  ├─ layout.tsx  globals.css  icon.svg  manifest  robots.ts  sitemap.ts
├─ components
│  ├─ public/                    # Header, Footer, ProjectsExplorer (URL-state), galeria, vídeo c/ consentimento…
│  └─ admin/                     # AdminShell (auth ctx + sidebar), ResourcePage (CRUD config-driven), ProjectForm, ui.tsx
├─ lib
│  ├─ api/                       # config · errors (ApiError) · server-fetch (cache+safety) · public · auth · admin
│  ├─ i18n/                      # locales (pt,en), dicionários ui.pt/ui.en, rotas localizadas
│  ├─ fields.ts                  # helpers bilíngues: bi(), biOrNull(), listOrNull()
│  ├─ format.ts                  # Kz/USD/data/slugify/cx
│  └─ middleware.ts (src/)       # redireção de idioma por Accept-Language/cookie
└─ types/api.ts                  # tipos espelhados 1:1 dos schemas do FRONTEND_API.md
```

## 5. Páginas públicas — decisões de integração

- **Fonte de verdade = API**: qualquer secção sem dados é ocultada (sem conteúdo inventado). Se a API falhar por completo, cada página tem estado de erro próprio (`ApiErrorBox`) e `noindex` temporário.
- **Filtros de projetos** (setor/município/estado) vivem no **servidor** (params de URL → fetch com filtro); pesquisa/ordenação/vista/página/favoritos são refinamentos no cliente. Favoritos em `localStorage` (`gpba_favs`).
- **Bilíngue por campo**: `bi(record,"title",locale)` usa `*_pt`/`*_en` e nunca mostra texto de idioma errado.
- **Imagens/documentos relativos** (`/uploads/…`) são resolvidos para `API_ORIGIN` (`resolveAssetUrl`).
- **Vídeos (YouTube/Vimeo)** só carregam iframe após consentimento explícito do utilizador (bloqueado até aí); `<video>` nativo não precisa de consentimento.
- **Mapa**: ligação a OpenStreetMap (sem chaves de API). O backend não tem endpoint de geocodificação; a pesquisa do contacto usa municípios do catálogo.
- **Formulário de contacto**: envia exatamente o payload `ContactCreate`; captcha aritmético gerado no cliente e revalidado no servidor (o backend decide); honeypot `website`; `elapsed_seconds`. Erros 422/400 do backend são mapeados por campo; em falha **não** se finge sucesso.
- **SEO**: metadados/canonical/hreflang por página, `robots.txt`/`sitemap.xml` dinâmicos (sitemap lista projetos reais via API; se a API estiver em baixo publica só as páginas estáticas), Open Graph com `og:locale:alternate`.
- **404 de projeto inexistente**: `notFound()` → fronteira 404 localiza. Em streaming o Next devolve HTTP 200 *por desenho* e injeta `<meta name="robots" content="noindex">` (e a página ainda define `robots:{index:false}` no `generateMetadata`); se precisar de estatuto 404 real para compliance/analytics, faça a verificação de existência antes do stream (ex.: middleware que reescreve slugs ausentes) — ver docs Next “loading.js → Status Codes”.

## 6. Painel administrativo (`/admin`)

Guard de sessão em `AdminShell` (valida `GET /api/auth/me`; 401/403 limpa token e redireciona para `/admin/login`). Rotas:

| Rota | Conteúdo | Endpoints |
|---|---|---|
| `/admin` | KPIs + últimas atualizações | `projects`, `messages?only_unread`, `updates` |
| `/admin/projetos` (+`/novo`,`/[id]`) | CRUD completo do projeto (objetivos/imagens/documentos aninhados, seleção de catálogos, slug automático, toggle publicar) | `GET/POST/PUT/DELETE/PATCH /api/admin/projects*` |
| `/admin/atualizacoes` `/orgao` `/marcos` `/oportunidades` `/indicadores` `/depoimentos` `/documentos` | CRUD genérico config-driven | `GET/POST/PUT/DELETE /api/admin/<recurso>[/{id}]` |
| `/admin/numeros` | edição dos números da home (a API só tem list/update) | `GET /api/admin/stats`, `PUT /api/admin/stats/{id}` |
| `/admin/definicoes` | configurações bilíngues (chave `contact_phone`,`contact_email`,`address`,`business_hours`) | `GET/PUT /api/admin/settings` |
| `/admin/sobre` | editor da página institucional | `GET/PUT /api/admin/about` |
| `/admin/catalogos` | setores/municípios/estados (com cor dos estados) | `GET/POST/PUT/DELETE /api/admin/catalog/{name}[/{id}]` |
| `/admin/mensagens` | inbox (todas/não lidas/spam), detalhe, marcar lida/spam, eliminar | `GET /api/admin/messages`, `GET/DELETE /{id}`, `PATCH /{id}/read|spam` |
| `/admin/conta` | sessão atual, alterar palavra-passe, criar admin | `GET /api/auth/me`, `POST /api/auth/password`, `POST /api/auth/admin` |

Sem backend de uploads no contrato da API: campos de imagem/documento aceitam **URL** (relativa `/uploads/...` ou absoluta) e o formulário mostra pré-visualização.

### Testar sem o backend real

`dev-tools/mock-api.mjs` (raiz do workspace, fora do projeto) espelha os endpoints do `FRONTEND_API.md` com dados de exemplo:

```bash
node dev-tools/mock-api.mjs         # http://localhost:8000
# admin de teste: admin / admin123456
```

## 7. Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Next dev com Turbopack |
| `npm run build` | build de produção + typecheck + lint |
| `npm run start` | servir o build |
| `npm run lint` | ESLint (config `next/core-web-vitals` + `next/typescript`) |
| `npx tsc --noEmit` | verificação de tipos isolada |

## 8. Estado do projeto

✔ Páginas públicas completas (home, projetos+filtros, detalhe, sobre, investidor, contacto, privacidade) com PT/EN, estados de loading/erro/vazio, SEO/hreflang/sitemap.
✔ Painel admin completo (tabela §6) tipado contra os schemas `*In` do contrato.
✔ `next build` + `tsc --noEmit` sem erros; fluxo validado end-to-end contra API local (login→token→CRUD→leitura pública, POST /api/contact com captcha, rewrites `/backend`).
✖ Upload de ficheiros e envio de e-mail de notificação: **dependem do backend** (não constam do contrato atual) — ver notas em `docs/API_INTEGRATION_NOTES.md`.

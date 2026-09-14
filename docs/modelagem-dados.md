# Modelagem de dados — módulos customizados PIQUE

O Medusa.js já cobre nativamente: produtos, variantes, preços, estoque, categorias,
clientes, pedidos, carrinho/checkout, promoções e regiões. Os módulos abaixo são
construídos por cima do Medusa (como *custom modules*, ligados às entidades do
core via *module links*) para cobrir o que é específico da PIQUE.

## Drop da Semana — ✅ implementado

Implementado em `apps/backend/apps/backend/src/modules/drop-semana` (módulo `dropSemana`).
Singleton (um único registro `drop_week` — não precisa de `type`/multiplicidade).

**`drop_week`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| title | string, nullable | ex: "Drop da Semana #12" |
| created_at / updated_at | datetime | |

**`drop_week_item`** (liga o drop a produtos já cadastrados, com ordem)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| drop_week_id | fk → drop_week | |
| product_id | string | id do produto (core) guardado como referência simples, não module link — só exibição, sem join |
| position | int | ordem de exibição |

Rotas: `GET/POST /admin/drop-semana` (curadoria, salva a lista inteira em ordem),
`GET /store/drop-semana` (pública, devolve título + ids em ordem). O storefront
busca os produtos completos via Store API e reordena no cliente, já que o
filtro `id` da Store API não preserva ordem. Painel admin em `/app/drop-semana`.

## WAB — ✅ implementado

Implementado em `apps/backend/apps/backend/src/modules/wab` (módulo `wab`).
Conteúdo único, atualizado in-place (singleton) — não é uma listagem.

**`wab_content`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| status | enum: `em_construcao` \| `revelado` \| `oculto` | |
| title | string, nullable | pode ficar vazio/misterioso |
| body | text, nullable | |
| media | json (`{ items: WabMedia[] }`) | lista de imagens/vídeos anexados, cada item `{ url, type }` |
| updated_at | datetime | |

Rotas: `GET/POST /admin/wab` (upsert do conteúdo único), `GET /store/wab`
(pública). Painel admin em `/app/wab`.

## Dicas (conteúdo editorial) — ✅ implementado

Implementado em `apps/backend/apps/backend/src/modules/dicas` (módulo `dicas`).

**`tip_post`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| title | string | |
| slug | string, unique | gerado automaticamente a partir do título no admin |
| excerpt | string, nullable | resumo exibido na listagem |
| body | text | |
| cover_image | string, nullable | |
| status | enum: `draft` \| `published` | |
| published_at | datetime, nullable | |
| created_at / updated_at | datetime | |

Rotas: `POST/GET/DELETE /admin/dicas(+/:id)`, `GET /store/dicas` (só publicados)
e `GET /store/dicas/:slug`. Painel admin em `/app/dicas`.

## Home (blocos configuráveis) — ✅ implementado

Implementado em `apps/backend/apps/backend/src/modules/home-config` (módulo `homeConfig`).

**`home_section`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| type | enum, unique: `hero` \| `drop_destaque` \| `wab_teaser` \| `dicas_destaque` \| `apresentacao` | uma linha por tipo (não é uma listagem livre) |
| position | int | ordem na página |
| visible | boolean | |
| config | json, nullable | textos por seção (título, subtítulo etc.); a home cai em textos padrão quando ausente |

Rotas: `GET/POST /admin/home-config` (GET preenche defaults para tipos
ausentes), `GET /store/home-config` (pública). A Home renderiza as seções
dinamicamente, na ordem/visibilidade configuradas. Painel admin em `/app/home-config`.

## FAQ — ✅ implementado

Implementado em `apps/backend/apps/backend/src/modules/faq` (módulo `faq`).
Modelo plano — sem tabela de categorias própria; a categoria é texto livre e o
agrupamento é feito no storefront.

**`faq_item`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| category | string | texto livre (ex: "Pedidos", "Trocas") |
| question | string | |
| answer | text | |
| position | int | |

Rotas: `POST/GET/DELETE /admin/faq(+/:id)`, `GET /store/faq` (pública).
Painel admin em `/app/faq`.

## Pré-venda — ✅ implementado

Não usa módulo/tabela própria — reaproveita o `metadata` (json) nativo do
produto core do Medusa, escrito via widget no admin
(`src/admin/widgets/presale-widget.tsx`) e lido pela Store API
(`fields=metadata`).

**`product.metadata`** (campos usados)
| campo | tipo | obs |
|---|---|---|
| is_presale | boolean | liga/desliga o selo e o banner |
| presale_message | string, nullable | texto exibido ao cliente |
| estimated_ship_date | string (ISO date), nullable | prazo estimado de envio |

## Verifique seu PIQUE (autenticidade + titularidade) — ✅ implementado

Módulo mais sensível do sistema — identidade física da peça e cadeia de posse.
Implementado em `apps/backend/apps/backend/src/modules/verification`.

**`piece_unit`** (uma unidade física de uma variante)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| unique_code | string, unique, não sequencial | o que o cliente digita em "Verifique seu PIQUE" — gerado no backend (12 chars, sem 0/O/1/I) |
| product_variant_id | string | id da variante (Medusa core) guardado como referência simples, não module link — só precisamos exibir, não fazer join |
| serial_number | string, nullable | referência interna (ex: tag física/QR) |
| status | enum: `nao_registrado` \| `registrado` \| `revogado` | |
| current_owner_customer_id | string, nullable | id do cliente (core); null até o primeiro registro |
| order_id | string, nullable | pedido que originou a venda, se rastreado |
| invoice_reference | string, nullable | apoio ao cadastro — nunca única prova de autenticidade |
| created_at / updated_at | datetime | |

**`ownership_transfer`** (histórico de titularidade é derivado desta tabela)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| piece_unit_id | fk → piece_unit (relação dentro do módulo) | |
| from_customer_id | string, nullable | nulo no primeiro registro |
| to_customer_id | string | |
| status | enum: `pendente` \| `rejeitada` \| `concluida` | simplificado — a autorização já aplica a mudança de titularidade na hora, sem estado intermediário |
| authorized_at | datetime, nullable | |
| notes | text, nullable | |

Regra de negócio (testada ponta a ponta com clientes reais): uma transferência
só sai de `pendente` para `concluida` com ação explícita do
`current_owner_customer_id` vigente — o backend rejeita qualquer outro cliente
que tente autorizar. A verificação pública (`unique_code` → autenticidade)
expõe apenas produto + status, nunca dados pessoais, pedido ou nota fiscal.

Rotas: `POST/GET/DELETE /admin/pecas(+/:id)` (gerar, listar, remover),
`GET /store/verifique?code=...` (pública), `POST /store/pecas/registrar`,
`POST /store/pecas/transferencias` e `POST /store/pecas/transferencias/:id/autorizar`
(autenticadas via cliente). Painel admin em `/app/pecas`.

---

## Status geral dos módulos

| Módulo | Status |
|---|---|
| WAB | ✅ implementado (backend + admin + storefront) |
| Verifique seu PIQUE | ✅ implementado (backend + admin + storefront) |
| Drop da Semana | ✅ implementado (backend + admin + storefront) |
| Home configurável | ✅ implementado (backend + admin + storefront) |
| Dicas | ✅ implementado (backend + admin + storefront) |
| FAQ | ✅ implementado (backend + admin + storefront) |
| Pré-venda | ✅ implementado (widget admin + storefront, via `product.metadata`) |

Todos os módulos customizados do escopo original estão implementados. Itens
maiores ainda pendentes (fora do escopo de módulo customizado): carrinho/checkout
real, conta do cliente (login/cadastro/pedidos/endereços), cálculo de frete,
gateway de pagamento (decisão adiada), e-mails transacionais, região BRL e deploy.

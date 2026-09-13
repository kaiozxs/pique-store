# Modelagem de dados — módulos customizados PIQUE

O Medusa.js já cobre nativamente: produtos, variantes, preços, estoque, categorias,
clientes, pedidos, carrinho/checkout, promoções e regiões. Os módulos abaixo são
construídos por cima do Medusa (como *custom modules*, ligados às entidades do
core via *module links*) para cobrir o que é específico da PIQUE.

## Drop da Semana

**`drop`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| title | string | ex: "Drop da Semana #12" |
| status | enum: `draft` \| `published` | |
| starts_at / ends_at | datetime, nullable | agendamento opcional |
| created_at / updated_at | datetime | |

**`drop_item`** (liga um drop a produtos já cadastrados, com ordem)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| drop_id | fk → drop | |
| product_id | link → Product (core) | |
| position | int | ordem de exibição |

## WAB

**`wab_content`** (conteúdo único, atualizado in-place — não é uma listagem)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| status | enum: `em_construcao` \| `revelado` \| `oculto` | |
| title | string, nullable | pode ficar vazio/misterioso |
| body | text, nullable | |
| updated_at | datetime | |

**`wab_media`** (imagens/vídeos anexados)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| wab_content_id | fk | |
| media_url | string | |
| media_type | enum: `image` \| `video` | |
| position | int | |

## Dicas (conteúdo editorial)

**`tip_post`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| title | string | |
| slug | string, unique | |
| body | text (rich text) | |
| cover_image | string, nullable | |
| status | enum: `draft` \| `published` | |
| featured_on_home | boolean | |
| youtube_video_id | string, nullable | preparação p/ integração futura |
| published_at | datetime, nullable | |
| created_at / updated_at | datetime | |

**`tip_media`** (imagens/vídeos adicionais dentro do post)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| tip_post_id | fk | |
| media_url | string | |
| media_type | enum: `image` \| `video` | |
| position | int | |

## Home (blocos configuráveis)

**`home_section`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| type | enum: `hero` \| `drop_destaque` \| `wab_teaser` \| `dicas_destaque` \| `apresentacao` \| `banner` | |
| position | int | ordem na página |
| visible | boolean | |
| config | json | conteúdo flexível por tipo (imagem, vídeo, texto, botão/link) |

## FAQ

**`faq_category`**: id, name, position
**`faq_item`**: id, category_id (fk), question, answer, position, published (boolean)

## Pré-venda

Estende o produto via module link (não duplica o catálogo):

**`presale_info`**
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| product_id | link → Product (core) | |
| is_presale | boolean | |
| starts_at / ends_at | datetime, nullable | |
| message | text | texto exibido ao cliente |
| estimated_ship_date | date, nullable | prazo estimado |

Pedidos que incluem item em pré-venda marcam `is_presale_order` no pedido/linha
(consultável pelo painel de Pedidos).

## Verifique seu PIQUE (autenticidade + titularidade)

Módulo mais sensível do sistema — identidade física da peça e cadeia de posse.

**`piece_unit`** (uma unidade física de uma variante)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| unique_code | string, unique, não sequencial | o que o cliente digita em "Verifique seu PIQUE" |
| product_variant_id | link → Product Variant (core) | |
| serial_number | string, nullable | referência interna (ex: tag física/QR) |
| status | enum: `nao_registrado` \| `registrado` \| `revogado` | |
| current_owner_customer_id | link → Customer (core), nullable | null até o primeiro registro |
| order_id | link → Order (core), nullable | pedido que originou a venda, se rastreado |
| invoice_reference | string, nullable | apoio ao cadastro — nunca única prova de autenticidade |
| created_at / updated_at | datetime | |

**`ownership_transfer`** (histórico de titularidade é derivado desta tabela)
| campo | tipo | obs |
|---|---|---|
| id | string (pk) | |
| piece_unit_id | fk → piece_unit | |
| from_customer_id | link → Customer, nullable | nulo no primeiro registro |
| to_customer_id | link → Customer | |
| status | enum: `pendente` \| `autorizada` \| `rejeitada` \| `concluida` | |
| requested_at | datetime | |
| authorized_at | datetime, nullable | |
| notes | text, nullable | |

Regra de negócio: uma transferência só sai de `pendente` para `autorizada` com
ação explícita do `current_owner_customer_id` vigente em `piece_unit` — nunca
automática. A verificação pública (`unique_code` → autenticidade) expõe apenas
produto + status, nunca dados pessoais ou de nota fiscal.

---

Próximo passo técnico: escaffoldar `apps/backend` (Medusa) e `apps/storefront`
(Next.js), e implementar estes modelos como Medusa Modules reais
(`defineModule` + MikroORM entities) assim que o Postgres local estiver de pé.

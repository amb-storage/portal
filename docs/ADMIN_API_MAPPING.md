# AMB:STORAGE Admin API Mapping

Admin APIs use the single canonical namespace `/api/v1/admin/*`. Admin
authentication is retained as the minimum account/session mechanism required
to protect these routes; there is no separate employee-management domain.

All mutations require an authenticated Admin session, the existing Origin and
CSRF checks, and JSON request validation. Mutations are audited in the same
database transaction. Secrets, passwords, session tokens, OTPs and payment
credentials never appear in responses or audit metadata.

## Authentication and audit

| Capability | Routes |
| --- | --- |
| First-time setup | `GET /api/v1/admin/auth/setup-status`, `POST /api/v1/admin/auth/setup` |
| Login/session | `POST /api/v1/admin/auth/login`, `GET /api/v1/admin/auth/me` |
| CSRF/password/logout | `POST /api/v1/admin/auth/csrf`, `/change-password`, `/logout`, `/logout-all` |
| Session management | `GET /api/v1/admin/auth/sessions`, `DELETE /api/v1/admin/auth/sessions/:id` |
| Audit browsing | `GET /api/v1/admin/audit-logs` |

First-time setup is available only when `admin_users` is empty. Development and
test requests must be loopback requests with an allowed Origin and JSON body.
Production requires the operator-generated `X-Admin-Setup-Token` header, with
the token supplied at runtime through `ADMIN_INITIAL_SETUP_TOKEN_FILE` or a
secret manager; an absent token fails closed. PostgreSQL transaction-scoped
locking makes concurrent setup requests create at most one account. The setup
response does not create a session; the owner logs in through the existing
login flow. The setup token is redacted from logs and should be removed after
the first account is created.

## Catalog and stock

| Resource | Routes |
| --- | --- |
| Categories | `GET/POST /api/v1/admin/catalog/categories`, `PATCH/DELETE /api/v1/admin/catalog/categories/:id` |
| Products | `GET /api/v1/admin/catalog/products`, `GET /api/v1/admin/catalog/products/:id`, `POST /api/v1/admin/catalog/products`, `PATCH /api/v1/admin/catalog/products/:id` |
| Publication | `POST /api/v1/admin/catalog/products/:id/publish` |
| Stock adjustment | `POST /api/v1/admin/catalog/products/:id/stock-adjustments` |
| Product aliases | `POST /api/v1/admin/catalog/products/:id/aliases` |

Products are Product-centric: `price` and physical `quantity` are the
authoritative values. Generic Product PATCH does not mutate quantity. A
dedicated stock adjustment is authorized, reasoned and audited, and rejects a
result below active Checkout reservations with
`PRODUCT_STOCK_RESERVED_CONFLICT`.

There are no Admin Product block routes, Variant/Inventory Unit routes, Period
or attribute-dictionary routes, or migration-management routes.

## CMS and Story

| Resource | Routes |
| --- | --- |
| Media | `GET /api/v1/admin/media`, `GET /api/v1/admin/media/folders`, `POST /api/v1/admin/media/uploads` (`folder` optional), `POST /api/v1/admin/media/:id/finalize`, `PATCH /api/v1/admin/media/:id`, `POST /api/v1/admin/media/:id/archive`, `DELETE /api/v1/admin/media/:id` |
| Pages | `GET/POST /api/v1/admin/cms/pages`, `GET/PATCH /api/v1/admin/cms/pages/:id`, `GET /api/v1/admin/cms/section-registry` |
| Page drafts | `GET/PUT /api/v1/admin/cms/pages/:id/draft` |
| Page lifecycle | `POST /api/v1/admin/cms/pages/:id/publish`, `/unpublish`, `/archive` |
| Page versions | `GET /api/v1/admin/cms/pages/:id/versions`, `GET /api/v1/admin/cms/pages/:id/versions/:versionId`, `POST /api/v1/admin/cms/pages/:id/versions/:versionId/rollback` |
| Preview | `POST /api/v1/admin/cms/pages/:id/preview-token`, `GET /api/v1/cms/preview/pages/:id` |
| Fixed content (About/Policy) | `GET/PUT /api/v1/admin/cms/content-pages/:pageId` |
| Story / Mili Talks articles | `GET/POST /api/v1/admin/stories`, `GET/PATCH/DELETE /api/v1/admin/stories/:id`, `POST /api/v1/admin/stories/:id/publish`, `POST /api/v1/admin/stories/:id/unpublish` |
| Navigation | `GET /api/v1/admin/navigation/menus`, `GET/PUT /api/v1/admin/navigation/menus/:key` |
| Store settings | `GET/PUT /api/v1/admin/store-settings` |

### Stories API contract for Mili Talks

The Stories API is the only Admin business API for Blog articles. It reuses
the existing `story.read` and `story.manage` permissions. Every mutation
requires the Admin session, allowed `Origin`, `X-CSRF-Token`, JSON validation,
audit logging and the existing page/version transaction path.

| Operation | Route | Body |
| --- | --- | --- |
| List | `GET /api/v1/admin/stories?page=1&limit=20&status=UNPUBLISHED\|PUBLISHED&q=...` | none |
| Detail | `GET /api/v1/admin/stories/:id` | none |
| Create | `POST /api/v1/admin/stories` | `slug`, optional localized titles/SEO, optional complete `content` |
| Save | `PATCH /api/v1/admin/stories/:id` | optional `slug`, localized titles/SEO and complete `content` |
| Publish | `POST /api/v1/admin/stories/:id/publish` | none |
| Unpublish | `POST /api/v1/admin/stories/:id/unpublish` | none |
| Archive | `DELETE /api/v1/admin/stories/:id` | none |

The Admin response exposes `status: "UNPUBLISHED" | "PUBLISHED"`, localized
metadata, `content`, `slug`, timestamps and page archival status. Internal
`PageVersion` IDs and revisions are not required by this contract. A create
without content remains an unpublished empty article for backward compatibility;
the normal Blog UI sends the complete initial article in the create request.

The content document uses the existing Story section registry. `TALK_HEADER`
contains the cover media ID and bilingual excerpts; body sections such as
`RICH_TEXT`, `IMAGE`, `IMAGE_WITH_TEXT`, `GALLERY`, `QUOTE` and `CONTACT` use
the existing CMS document format. Media and other references are validated by
the existing CMS service.

Publication behavior:

1. Create and update an unpublished Story: changes remain private.
2. Publish: the saved Story becomes visible through `/api/v1/stories`.
3. Update a published Story: the API saves and publishes the new validated
   content in the same request while preserving historical versions.
4. Unpublish: public list and detail endpoints stop exposing the Story; data
   and history remain available to Admin.
5. Delete/archive: the page and active versions are archived transactionally;
   published data is not hard-deleted.

Example create:

```json
{
  "slug": "vintage-care",
  "titleJa": "ヴィンテージの手入れ",
  "titleEn": "Caring for Vintage",
  "seoTitleJa": "ヴィンテージの手入れ",
  "seoTitleEn": "Caring for Vintage",
  "seoDescriptionJa": "手入れの基本",
  "seoDescriptionEn": "The basics of care",
  "content": { "schemaVersion": 1, "sections": [] }
}
```

The response starts with `status: "UNPUBLISHED"`; the same resource is then
published, updated, unpublished and archived using the routes above. Generic
CMS Page, PageVersion and Policy routes remain available for their existing
use cases and are not required for normal Story CRUD.

About and Policy are separate pages with separate public endpoints
(`/content/about`, `/content/policies[/:slug]`); the Web About/Policy tabs are
two routes, not one combined resource. Both are edited through the fixed
content routes, which accept only pages of type `ABOUT` or `POLICY`:

1. Find the page id with `GET /api/v1/admin/cms/pages`. The CMS bootstrap
   creates `about`, `shipping-policy` and `returns-policy`; add further
   policies (for example `privacy-policy`) with `POST /api/v1/admin/cms/pages`
   and `type: "POLICY"`.
2. `GET /api/v1/admin/cms/content-pages/:pageId` returns the current draft with
   its `draftVersionId` and `expectedRevision`.
3. `PUT` the same route with those two values, titles, SEO fields and
   `bodyJa`/`bodyEn` rich text. This saves the draft only. Policy drafts must
   set `effectiveAt` before they can be published; About must not set it.
4. `POST /api/v1/admin/cms/pages/:id/publish` with the returned
   `draftVersionId` and `expectedRevision` makes it public.

Story remains the canonical backend content resource. “Mili Talk(s)” is the Web
display label. There is no separate Blog API or Blog content store.

## Orders and Checkout

| Capability | Routes |
| --- | --- |
| Admin order list/detail | `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/:id` |
| Fulfillment/order notes | `PATCH /api/v1/admin/orders/:id` |
| Refund | `POST /api/v1/admin/orders/:id/refunds` |
| Checkout creation | `POST /api/v1/checkout/sessions` (Web owner/session, not Admin auth) |
| Stripe webhook | `POST /api/v1/checkout/webhook` (raw signature-verified Stripe request) |

Cart does not reserve stock. Checkout locks referenced Product rows in a
deterministic order, counts active `PENDING_PAYMENT` Order lines, creates an
Order-backed reservation, then calls Stripe after the transaction commits.
The Order stores Stripe's verified Session expiration timestamp. Paid payment
consumes the reservation and decrements physical quantity once. Confirmed
expiration or terminal payment failure releases the reservation, unless a
completed Session is already recorded as payment-processing; that reservation
waits for terminal async success/failure. Browser
redirects, local timers, cancellation URLs and missing webhooks do not.

Repeated Checkout requests use the same Order and stable Stripe idempotency key.
Uncertain provider results remain pending for reconciliation/retry. Duplicate
or out-of-order webhook events are idempotent. Refund completion does not
automatically restock Product quantity.

## Namespace boundary

The obsolete locale-prefixed Store API and `/api/v2` are not compatibility
routes. Public Web localization uses `Accept-Language`; Web `/blog` remains a
frontend route that consumes the canonical Story API.

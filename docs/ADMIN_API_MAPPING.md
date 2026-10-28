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

## Website Analytics

| Capability | Route | Permission |
| --- | --- | --- |
| Normalized GoatCounter dashboard | `GET /api/v1/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD` | `orders.read` |

The route requires the existing `amb_admin_session` cookie and is protected by
`AdminSessionGuard` and `PermissionsGuard`. `from` and `to` are optional UTC
calendar dates, inclusive, with a maximum range of 90 days. The default is the
current UTC date and the preceding 29 calendar days. Invalid dates or ranges
return `400`.

The API server calls the fixed hosted site only, using the server-side
`GOATCOUNTER_API_TOKEN` and `Authorization: Bearer ...`; the token is never
returned to Admin or logged. The validated provider request is
`GET /api/v0/me`, followed by the documented `/stats/total`, `/stats/hits`,
`/stats/toprefs`, `/stats/browsers`, `/stats/systems` and `/stats/locations`
requests. Results are cached per process for 120 seconds and concurrent
requests for the same range are coalesced. The client spaces provider calls to
stay below GoatCounter's documented 4 requests/second limit. Current caching is
intentionally process-local; use shared cache infrastructure before scaling the
API horizontally.

Response shape:

```json
{
  "status": "ok",
  "stale": false,
  "data": {
    "provider": "goatcounter",
    "from": "2026-10-01",
    "to": "2026-10-30",
    "metricSemantics": {
      "visitors": "GoatCounter visitor counts; not unique people and not pageview totals",
      "events": "GoatCounter visitor counts attributed to event paths; not raw click totals",
      "pageviews": null
    },
    "metrics": { "visitors": 42, "eventVisitors": 9 },
    "traffic": [{ "day": "2026-10-01", "visitors": 4 }],
    "topPages": [{ "path": "/en/shop/example", "title": "Example", "visitors": 3 }],
    "referrers": [{ "name": "google.com", "visitors": 2 }],
    "devices": {
      "browsers": [{ "name": "Chrome", "visitors": 2 }],
      "systems": [{ "name": "macOS", "visitors": 2 }],
      "locations": [{ "name": "Japan", "visitors": 2 }]
    },
    "events": [{ "name": "view_product", "count": 4 }]
  }
}
```

`visitors`, page rows, breakdowns and event counts retain GoatCounter's
provider meaning: visitor counts for the requested dimension/path. They are not
unique people, raw pageview totals or purchase conversions. The dashboard does
not display a fabricated pageview KPI or conversion percentage. Supported
events are `view_product`, `add_to_cart` and `begin_checkout`; `purchase` is not
tracked because browser checkout return is not verified settlement.

When the token is absent the response is `status: "not_configured"`. Provider
`401`, `403`, `429` and timeout/5xx failures map to safe statuses without
exposing provider response bodies. If a cached range exists during a provider
failure, it is returned with `status: "ok"`, `stale: true`; otherwise the Admin
must show an unavailable/error state rather than zero data.

Required server configuration:

```dotenv
GOATCOUNTER_BASE_URL=https://amb-storage.goatcounter.com
GOATCOUNTER_API_TOKEN=<server-only-token>
GOATCOUNTER_TIMEOUT_MS=5000
```

Do not put the token in `NEXT_PUBLIC_*` or `VITE_*` variables. The Web tracker
uses the fixed hosted collection endpoint and consent; it does not need a
provider token.

## Orders and Checkout

| Capability | Routes |
| --- | --- |
| Admin order list/detail | `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/:id` |
| Fulfillment/order notes | `PATCH /api/v1/admin/orders/:id` |
| Refund | `POST /api/v1/admin/orders/:id/refunds` |
| Financial dashboard | `GET /api/v1/admin/orders/financial-dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD` |
| Checkout creation | `POST /api/v1/checkout/sessions` (Web owner/session, not Admin auth) |
| Stripe webhook | `POST /api/v1/checkout/webhook` (raw signature-verified Stripe request) |

All Admin reads require an authenticated Admin session and the corresponding
permission. The financial dashboard requires `orders.read`; Admin mutations
also require the existing Origin, JSON and CSRF checks and are audited.

### Financial dashboard contract

`from` and `to` are optional calendar dates in `YYYY-MM-DD` format. They are
interpreted as UTC dates, both endpoints inclusive: the query uses
`paid_at >= from 00:00:00Z` and `< (to + 1 day) 00:00:00Z`. If omitted, the
default range is the current UTC date and the preceding 29 calendar days.

All amount fields are integer JPY minor units (JPY is zero-decimal):

```json
{
  "from": "2026-10-01",
  "to": "2026-10-31",
  "currency": "JPY",
  "paidOrders": 12,
  "grossRevenue": 38500,
  "taxCollected": 3500,
  "netSales": 28000,
  "refunds": 7000
}
```

The API sums `orders.total_amount` and `orders.tax_amount` for Orders with a
non-null `paid_at` in the range. `refunds` sums `total_amount` for those same
Orders with a non-null `refunded_at`; the current refund flow is full-order,
not partial. `netSales = grossRevenue - taxCollected - refunds`.

### Fulfillment and customer email behavior

For a paid Order, the allowed transitions are:

```text
UNFULFILLED → SHIPPED → DELIVERED
```

The same-status update is a successful no-op. Invalid transitions and updates
to unpaid Orders fail before an email job is created. A real transition
creates one durable customer notification job using a unique key for
`order_id + target status`; webhook replay and worker retry therefore do not
create duplicate logical notifications. The recipient is the Order's stored
customer email. Payment settlement also creates one durable shop notification
job whose recipient is the mailbox extracted from `RESEND_FROM_EMAIL`.

## Tax management and source of truth

The existing Store Settings API is the Admin tax configuration API:

| Operation | Route | Permission |
| --- | --- | --- |
| Read settings | `GET /api/v1/admin/store-settings` | `settings.read` |
| Update settings | `PUT /api/v1/admin/store-settings` | `settings.manage` |

`taxDisplayMode` controls storefront presentation only. `taxCalculationMode`
controls money for newly created Orders and is persisted in PostgreSQL with
default `NONE`:

- `NONE`: tax amount 0; preserve current payment behavior.
- `TAX_INCLUDED`: for applicable Japanese orders, extract 10% from the stored
  price; total charged does not increase.
- `TAX_EXCLUDED`: for applicable Japanese orders, add 10% to the stored price.

The selected mode and resulting `tax_amount`/`tax_rate_percent` are immutable
Order snapshots. Reusing a pending Checkout keeps its existing snapshot;
changing Store Settings affects only newly created Orders. Receipt variables,
Stripe line items, Admin Order responses and financial dashboard totals all
read that snapshot.

Backend is the sole tax calculator. Stripe Checkout is used to process the
already calculated amount; this integration does not enable Stripe Tax
`automatic_tax` or pass Stripe `tax_rates`. See Stripe's [Checkout Session
create API](https://docs.stripe.com/api/checkout/sessions/create) for the
provider fields and semantics.

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

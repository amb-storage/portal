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
| Media | `GET /api/v1/admin/media`, `POST /api/v1/admin/media/uploads`, `POST /api/v1/admin/media/:id/finalize`, `PATCH /api/v1/admin/media/:id`, `POST /api/v1/admin/media/:id/archive` |
| Fixed content | `GET/PATCH /api/v1/admin/cms/content-pages/*` |
| Pages and preview | Existing routes under `/api/v1/admin/cms/*` |
| Story | `GET/POST /api/v1/admin/stories`, `GET/PATCH/DELETE /api/v1/admin/stories/:id` |
| Navigation | `GET /api/v1/admin/navigation/menus`, `GET/PUT /api/v1/admin/navigation/menus/:key` |
| Store settings | `GET/PUT /api/v1/admin/store-settings` |

Story is the sole backend content domain. “Mili Talk(s)” is only the Web
display label. No duplicate Mili Talk or Blog API exists.

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

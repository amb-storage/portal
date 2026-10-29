# お問い合わせ (Contact) API

Status: implemented in the API (`../api`, `docs/api/ADMIN_API_MAPPING.md` →
Inquiries and `docs/api/WEB_API_MAPPING.md` → Contact form). The portal's
**Liên hệ** screen (`src/features/inquiries`) calls the routes below. Each new
inquiry also emails the shop inbox with Reply-To set to the customer; the API
sends no auto-reply.

## Public route (website form)

The website form already exists: `amb-storage-web` →
`app/[locale]/(legal)/contact` (`/contact`, `/en/contact`). It posts exactly
this body through the same-origin `/api/v1` rewrite and sends no session or
CSRF token, so this route does not require one.

`POST /api/v1/contact`

```json
{
  "name": "山田 太郎",
  "email": "taro@example.jp",
  "category": "PRODUCT",
  "subject": "MA-1のサイズについて",
  "message": "…",
  "orderNumber": "AMB-20260418-0012",
  "locale": "ja",
  "website": ""
}
```

- `category`: `PRODUCT | BUYING | ORDER | FEEDBACK | OTHER`.
- `orderNumber` is optional.
- `locale` is `ja | en` and records which website language the customer used.
- `website` is a honeypot field. It must be empty; if it is not, accept the
  request silently and drop it.
- Limits: `name` ≤ 100, `subject` ≤ 200, `message` ≤ 5000 characters.
  `email` must be a valid address.
- Rate limit per IP, for example 5 requests per 10 minutes. Over the limit,
  return `429 CONTACT_RATE_LIMITED`.
- Response: `202 { "id": "<uuid>" }`.
- Side effects:
  - Send a notification email to the store address
    (`theambitionent@gmail.com`).
  - Optionally send an auto-reply to the customer in their `locale`.

## Admin routes

| Route | Permission | Notes |
| --- | --- | --- |
| `GET /api/v1/admin/inquiries?page&limit&q&status&category` | `inquiries.read` | `Paginated<Inquiry>`, newest first; `q` matches name, email, subject, message, order number |
| `GET /api/v1/admin/inquiries/:id` | `inquiries.read` | `Inquiry` |
| `PATCH /api/v1/admin/inquiries/:id` | `inquiries.manage` | `{ status?, adminNote? }` → `Inquiry`; sets `repliedAt` the first time status becomes `REPLIED`; audit `INQUIRY_UPDATED` |

```ts
interface Inquiry {
  id: string
  name: string
  email: string
  category: 'PRODUCT' | 'BUYING' | 'ORDER' | 'FEEDBACK' | 'OTHER'
  subject: string
  message: string
  locale: 'ja' | 'en'
  orderNumber: string | null
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'
  adminNote: string | null
  createdAt: string
  updatedAt: string
  repliedAt: string | null
}
```

The admin routes are camelCase, like the media responses. Admins reply from
their own mail client (`mailto:`), so the API does not send replies.

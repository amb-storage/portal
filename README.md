# AMB Portal

Admin portal cho AMB:STORAGE, dựng trên Admin API `/api/v1/admin/*`
(xem `docs/ADMIN_API_MAPPING.md`, bản sao của `api/docs/api/ADMIN_API_MAPPING.md`).

## Stack

| Mảng | Thư viện |
| --- | --- |
| Build | Vite 8, React 19, TypeScript 6 |
| Routing | TanStack Router (file-based, `src/routes`, auto code-splitting) |
| HTTP | axios (instance + interceptors cho CSRF/401) |
| Server state | TanStack Query 5 |
| Bảng | TanStack Table 9 (`useTable` + `tableFeatures`) |
| Form | TanStack Form 1 (`createFormHook`) + Zod 4 |
| UI | shadcn/ui (radix-nova) + Tailwind CSS 4, lucide icons, sonner toasts, next-themes |

## Chạy local

```bash
# 1. Backend (thư mục api)
cd ../api
cp -n .env.example .env
pnpm infra:up            # Postgres + MinIO
pnpm db:migrate
pnpm dev                 # http://localhost:3000, Swagger ở /docs

# 2. Portal
cd ../amb-portal
pnpm install
pnpm dev                 # http://localhost:3002
```

Lần đầu (bảng `admin_users` rỗng) mở `/setup` để tạo tài khoản Admin owner.
Dev/test: request loopback là đủ. Staging/production: nhập setup token do operator cấp
(gửi qua header `X-Admin-Setup-Token`). Setup không tạo session — đăng nhập sau đó.

Portal chạy cố định port **3002** vì port này nằm trong `CORS_ORIGINS` mặc định
của API. Vite proxy `/api` → `http://localhost:3000` (đổi bằng
`VITE_API_PROXY_TARGET`), nên trình duyệt gọi same-origin: cookie
`amb_admin_session` (HttpOnly, path `/api/v1/admin`) hoạt động mà không cần
CORS, còn header `Origin: http://localhost:3002` vẫn qua được
`AdminRequestSecurityGuard`.

Khi deploy tách domain, đặt `VITE_API_BASE_URL=https://api.example.com` và thêm
origin của portal vào `CORS_ORIGINS` của API.

Scripts: `pnpm dev`, `pnpm build` (tsc + vite), `pnpm lint` (oxlint), `pnpm preview`.

## CI/CD (CloudFly)

Cùng khung với `api` và `web`:

- **CI** (`.github/workflows/ci.yml`, push/PR vào `main`): `pnpm install --frozen-lockfile` →
  `lint` → `build` (tsc + vite) → kiểm tra `routeTree.gen.ts` đã commit đúng → `docker build` →
  smoke test image (SPA fallback, asset thiếu trả 404, `/healthz`) → `git diff --check`.
- **CD** (`.github/workflows/cd-cloudfly.yml`): chạy khi CI của `main` thành công (hoặc bấm tay
  `workflow_dispatch`), SSH vào server và chạy `deploy/cloudfly/cd-deploy.sh <sha>`: fetch đúng
  commit đã qua CI, build image `amb-storage-admin:<sha>`, chờ healthy (SPA + proxy `/api` tới API),
  lỗi thì tự rollback về image trước; giữ 3 image gần nhất.
- Bật CD bằng biến repo `CLOUDFLY_CD_ENABLED=true`; dùng chung `CLOUDFLY_HOST`,
  `CLOUDFLY_SSH_PRIVATE_KEY`, `CLOUDFLY_KNOWN_HOSTS` (secrets) và `CLOUDFLY_SSH_USER`,
  `CLOUDFLY_SSH_PORT` (vars) với web, trong environment `production`.

Image: build bằng `node:24.22.1-alpine` (bản vá bảo mật), chạy bằng `caddy:2.10.2-alpine` không
root, cổng 8080 chỉ trong `amb-network` (alias `amb-admin`). Caddy trong image:

- proxy `/api/*` → `API_UPSTREAM` (mặc định `http://amb-storage-prod-api-1:8000`), nên trình duyệt
  gọi API **cùng domain** như lúc dev: cookie `amb_admin_session` và kiểm tra Origin hoạt động.
  Domain admin vẫn phải có trong `CORS_ORIGINS` của API (Origin guard).
- route SPA → `index.html` với `Cache-Control: no-store`; `/assets/*` có hash → cache 1 năm,
  file không tồn tại trả **404 (không fallback)**.

Chống trắng trang sau deploy: tab mở từ bản cũ khi chuyển route sẽ tải chunk đã bị xoá →
`vite:preloadError` tự reload 1 lần (`src/lib/chunk-reload.ts`); nếu lỗi lọt tới router thì
`errorComponent` hiện nút "Tải lại trang" thay vì màn hình trắng.

Thiết lập server lần đầu (một lần):

```bash
sudo git clone https://github.com/kailearndev/amb-portal.git /amb-storage-admin
sudo cp /amb-storage-admin/deploy/cloudfly/env.production.example /amb-storage-admin/.env.production
sudo chown root:root /amb-storage-admin/.env.production && sudo chmod 600 /amb-storage-admin/.env.production
sudo bash /amb-storage-admin/deploy/cloudfly/cd-deploy.sh "$(git -C /amb-storage-admin rev-parse origin/main)"
```

Rồi trỏ domain admin vào `amb-admin:8080` ở reverse proxy có TLS trên `amb-network`.



```
src/
├── main.tsx               # Providers: Theme, Query, Tooltip, Router, Toaster
├── router.tsx             # createRouter + context { queryClient }
├── routeTree.gen.ts       # sinh tự động bởi @tanstack/router-plugin — không sửa tay
├── routes/                # chỉ khai báo route: validateSearch, loader, component
│   ├── __root.tsx
│   ├── login.tsx, setup.tsx, change-password.tsx
│   ├── _app.tsx           # layout có auth guard + sidebar
│   └── _app/...           # mọi trang sau đăng nhập
├── features/<domain>/     # logic theo nghiệp vụ
│   ├── <name>.service.ts  # endpoint thuần: mỗi hàm = 1 route backend (axios)
│   ├── queries.ts         # query keys + queryOptions (gọi service)
│   ├── types.ts           # DTO/response type khớp backend
│   ├── search.ts          # Zod schema cho search params của route
│   ├── hooks/use-*-page.ts# 1 hook / page: gom query, mutation, state
│   ├── hooks/use-*.ts     # hook cho form / tab / dialog
│   ├── components/        # component nhỏ của feature
│   └── pages/*-page.tsx   # page component, chỉ render
├── components/
│   ├── ui/                # shadcn (sinh bởi CLI)
│   ├── form/              # field component cho TanStack Form
│   ├── data-table/        # DataTable + pagination (TanStack Table)
│   ├── common/            # PageHeader, StatusBadge, ConfirmButton, QueryState…
│   └── layout/            # AppShell, AppSidebar, NavUser, ThemeToggle
├── hooks/use-list-search.ts
└── lib/
    ├── api/               # http (axios instance), client, csrf, errors, session-events
    └── format.ts, permissions.ts, query-client.ts, search.ts
```

### Quy ước

- **Endpoint chỉ nằm trong `*.service.ts`** (vd. `product.service.ts` →
  `productService.publish(id)`). Hook/component không tự ghép URL. Query keys và
  `queryOptions` nằm ở `queries.ts`; mutation trong hook gọi thẳng service.

- **Route file mỏng**: chỉ `createFileRoute(...)({ validateSearch, loader, component })`.
- **Mỗi page có 1 hook** `use-<page>-page.ts`; page component chỉ gọi hook đó và render.
- **Không file nào (ngoài `components/ui`) quá 165 dòng**; tách component nhỏ khi vượt.
- Filter/pagination của list nằm trong **URL search params** (validate bằng Zod;
  giá trị sai sẽ fallback thay vì throw). Hook dùng chung: `useListSearch<T>()`;
  đổi filter thì tự reset `page` về 1.
- Form dùng `useAppForm` với `form.AppField` + `field.TextField | NumberField |
  TextareaField | SelectField | SwitchField | MultiSelectField`. Section của form
  lớn dùng `withForm` (ví dụ product, settings, navigation row).
- Bảng dùng `<DataTable columns data />`; columns tạo bằng `columnHelper<T>()` ở
  module scope, hoặc trong `useMemo` khi cần callback.

## Auth, CSRF, permission

| Bước | Cách làm |
| --- | --- |
| Setup lần đầu | `GET /auth/setup-status` → `POST /auth/setup` (`skipCsrf`, kèm `X-Admin-Setup-Token` nếu có) |
| Đăng nhập | `POST /auth/login` với `skipCsrf`. Lưu `csrfToken` trả về **trong memory** |
| Reload trang | Token mất → mutation đầu tiên gọi `POST /auth/csrf` để rotate token mới |
| Mutation | Request interceptor (`lib/api/http.ts`) gắn `Content-Type: application/json` + `X-CSRF-Token` |
| CSRF hết hạn | Response interceptor: `403 CSRF_INVALID` → rotate token và retry 1 lần |
| 401 | Response interceptor gọi `emitSessionExpired()` → xoá `me`, chuyển về `/login?redirect=…` |
| `mustChangePassword` | Layout `_app` redirect sang `/change-password` |
| Permission | `useCan(PERMISSIONS.x)` ẩn menu/nút (`*` = mọi quyền); backend vẫn là authority |

Password, session token và object key không bao giờ được lưu ở client.

## Giao diện

- Toàn bộ giao diện bằng tiếng Việt. Nhãn trạng thái (enum API) và thông báo lỗi
  theo `code` nằm ở `src/lib/labels.ts`; mã lạ thì hiện nguyên giá trị/thông báo gốc.
- Trang `/guide` (Hướng dẫn thao tác) lấy nội dung từ `src/features/guide/guide-content.ts`.
- Dashboard có biểu đồ doanh thu 30 ngày (tính trên tối đa 100 đơn PAID gần nhất,
  vì API giới hạn `limit=100`) và số đơn theo trạng thái thanh toán. Màu series ở
  `--viz-series-1` trong `index.css`.
- Trang sản phẩm có checklist đăng bán tính ở client (API không trả chi tiết lỗi
  publish), mirror `productPublicationErrors` trong `publish-checklist.ts`.
- Form sửa dài dùng `form.StickySaveBar` (thanh Lưu cố định + hỏi lại khi rời trang chưa lưu).

## Mapping trang ↔ API

| Route | Permission | Endpoint |
| --- | --- | --- |
| `/setup` | — (chỉ khi chưa có Admin) | `GET auth/setup-status`, `POST auth/setup` |
| `/login` | — | `POST auth/login` |
| `/change-password` | session | `POST auth/change-password` |
| `/account` | session | `GET auth/me`, `GET auth/sessions`, `DELETE auth/sessions/:id`, `POST auth/logout(-all)` |
| `/` Dashboard | read của từng mảng | `total` từ các list endpoint (`limit=1`); biểu đồ: `GET orders?status=PAID&limit=100` |
| `/guide` | session | — (nội dung tĩnh) |
| `/catalog/products` | `catalog.read` | `GET catalog/products` (q, status, categoryId, sort, direction) |
| `/catalog/products/new` | `catalog.manage` | `POST catalog/products` (kèm `quantity` ban đầu) |
| `/catalog/products/$productId` | `catalog.read` | `GET/PATCH products/:id`, `POST …/publish`, `…/unpublish` (`catalog.publish`), `POST …/stock-adjustments`, `POST …/aliases`, `PUT …/media` |
| `/catalog/categories` | `catalog.read` / `catalog.manage` | `GET/POST catalog/categories`, `PATCH/DELETE catalog/categories/:id` |
| `/orders` + `/$orderId` | `orders.read` / `orders.manage` | `GET orders`, `GET orders/:id`, `PATCH orders/:id` (fulfillment/notes), `POST orders/:id/refunds` |
| `/media` | `media.read` / `.manage` | list, `uploads` → PUT presigned URL → `finalize`, `PATCH` alt, archive |
| `/audit-logs` | `audit.read` | `GET audit-logs` (cursor, action) |
| `/cms/pages` + `/$pageId` | `page.*` | list/create, `PATCH` slug, draft `GET/PUT`, publish/unpublish/archive, versions + rollback, preview-token, section-registry; ABOUT/POLICY dùng `cms/content-pages/:pageId` |
| `/cms/stories` | `story.*` | `GET/POST stories`, `DELETE stories/:id`; edit/publish qua trang CMS page |
| `/navigation` | `navigation.*` | `GET/PUT navigation/menus/:key` (HEADER/FOOTER) |
| `/settings` | `settings.*` | `GET/PUT store-settings` |

Không còn route Variant/Inventory Unit, Brand/Tag/Period/Size/Condition rank,
Collection hay Mili Talk API — xem phần *Catalog and stock* và *CMS and Story*
trong `docs/ADMIN_API_MAPPING.md`.

Lệch giữa doc và controller (portal làm theo controller):
publish/unpublish Product cần `catalog.publish`; `unpublish` và `PUT products/:id/media`
có ở controller dù doc không liệt kê; fixed content dùng `PUT` (doc ghi `PATCH`).

## Ghi chú nghiệp vụ đã xử lý trong UI

- **Optimistic concurrency**: draft CMS (`draftVersionId` + `expectedRevision`),
  fixed content, navigation và store settings (`expectedRevision`). Lỗi 409 hiện
  toast kèm gợi ý reload; form được `key` theo revision nên tự reset sau khi lưu.
- **Publish CMS** luôn fetch draft mới nhất ngay trước khi gửi để tránh gửi revision cũ.
- **Product-centric**: `price` (JPY, số nguyên dương) và `quantity` vật lý là giá
  trị gốc. Draft có thể thiếu field; publish cần tên JA/EN, slug, price, size,
  mô tả JA/EN, ≥1 category và media READY.
- **Product update** chỉ gửi field đã đổi, vì backend phân biệt *omit* và `null`;
  field bị xoá được gửi `null`. `PATCH` không bao giờ đổi `quantity`. Slug bị khoá
  khi product đã PUBLISHED; dùng alias thay thế (API chỉ có tạo alias, không có list).
- **Stock adjustment**: `delta` khác 0 + `reason` bắt buộc, được audit. Lỗi
  `PRODUCT_STOCK_RESERVED_CONFLICT` khi kết quả thấp hơn số đang giữ bởi Checkout
  `PENDING_PAYMENT`. Refund không tự cộng lại tồn kho.
- **Order detail**: `shipping_snapshot` (`{ customerDetails, shippingDetails }` từ Stripe,
  địa chỉ JP + số điện thoại) hiển thị thành người nhận/điện thoại/địa chỉ; dạng lạ thì
  rơi về JSON. Hoá đơn email dừng sau `MAX_RECEIPT_ATTEMPTS` = 8 lần (job `FAILED`),
  portal báo cần chạy `receipt:recover` ở backend.
- **Order fulfillment**: chỉ order `PAID`, theo thứ tự UNFULFILLED → SHIPPED → DELIVERED.
  Refund chỉ cho order `PAID` có payment intent và chưa refund.
- **Navigation**: item `PAGE` chỉ gửi `pageId`, các loại khác chỉ gửi
  `destination`; `position` = thứ tự trong cùng parent; item mới dùng
  `crypto.randomUUID()`. Destination `MILI_TALK` (giá trị wire của API) hiển thị là STORY.
- **Media upload**: chỉ JPEG/PNG/WebP/AVIF ≤ 20 MB (khớp `media-policy.ts`). File
  được PUT thẳng lên presigned URL bằng axios *thường* (không cookie/CSRF) và có
  thanh % theo `onUploadProgress`, nên bucket S3/MinIO phải cho phép CORS `PUT`
  từ origin của portal.
- **CMS content** được sửa dưới dạng JSON (schemaVersion 2 + `sections`); tab
  *Section registry* liệt kê section/setting hợp lệ theo profile.

## Thêm một trang mới

1. `src/features/<domain>/<name>.service.ts`: endpoint; `queries.ts`: keys + `queryOptions`.
2. `search.ts` nếu trang có filter.
3. `hooks/use-<name>-page.ts`: gom query/mutation/state.
4. `components/*`: columns, dialog, form section (mỗi file ≤ 165 dòng).
5. `pages/<name>-page.tsx`: chỉ render.
6. `src/routes/_app/<path>.tsx`: route mỏng; plugin tự cập nhật `routeTree.gen.ts`.
7. Thêm vào `components/layout/nav-items.ts` kèm permission.
# portal

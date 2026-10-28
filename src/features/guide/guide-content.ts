import type { LinkProps } from '@tanstack/react-router'

type To = NonNullable<LinkProps['to']>

/** Box colours: draft = only Admins see it, live = customers see it, warn = needs attention. */
export type StepTone = 'neutral' | 'draft' | 'live' | 'warn' | 'done'

export interface FlowStep {
  label: string
  note?: string
  tone?: StepTone
}

export type GuideDiagram =
  /** Left-to-right chain of steps (stacks vertically on small screens). */
  | { kind: 'flow'; caption?: string; steps: FlowStep[] }
  /** "This in the portal → that on the website" rows. */
  | { kind: 'map'; caption?: string; fromTitle: string; toTitle: string; rows: Array<{ from: string; to: string }> }

export interface GuideSection {
  id: string
  title: string
  summary: string
  /** Page the steps happen on. */
  to?: To
  linkLabel?: string
  diagram?: GuideDiagram
  steps: string[]
  tips?: string[]
}

export interface GuideGroup {
  title: string
  sections: GuideSection[]
}

/** "Tôi muốn…" shortcuts at the top of the guide; each jumps to a section. */
export const QUICK_TASKS: Array<{ label: string; section: string }> = [
  { label: 'Đăng bán một sản phẩm mới', section: 'san-pham' },
  { label: 'Gửi hàng cho đơn đã thanh toán', section: 'don-hang' },
  { label: 'Trả lời khách liên hệ', section: 'lien-he' },
  { label: 'Tải ảnh và xếp vào thư mục', section: 'anh' },
  { label: 'Viết bài Mili Talks', section: 'bai-viet' },
  { label: 'Bài viết không hiện trên website', section: 'bai-khong-hien' },
  { label: 'Sửa trang chủ blog / Special Thanks', section: 'trang-chu-blog' },
  { label: 'Sửa trang Giới thiệu (About)', section: 'gioi-thieu' },
  { label: 'Sửa chính sách giao hàng, đổi trả…', section: 'chinh-sach' },
  { label: 'Sửa trang chủ / thêm đánh giá Customer Voice', section: 'customer-voice' },
  { label: 'Đổi menu trên website', section: 'menu' },
]

/** Where each part of the portal shows up for customers. */
export const PORTAL_MAP: GuideDiagram = {
  kind: 'map',
  caption: 'Mỗi mục trong portal quyết định một phần của website. Khách chỉ thấy những gì đã Đăng bán / Xuất bản.',
  fromTitle: 'Bạn sửa ở portal',
  toTitle: 'Khách thấy trên website',
  rows: [
    { from: 'Sản phẩm + Danh mục', to: 'Trang Shop, trang chi tiết sản phẩm, bộ lọc danh mục' },
    { from: 'Thư viện ảnh', to: 'Ảnh của sản phẩm, bài viết, trang (chỉ hiện khi được chọn dùng)' },
    { from: 'Mili Talks: Bài viết, Trang chủ blog', to: 'Trang /blog (giới thiệu, Special Thanks, danh sách bài) và từng bài /blog/…' },
    { from: 'Giới thiệu', to: 'Trang ABOUT US' },
    { from: 'Chính sách', to: 'Trang Privacy Policy (/policy), gộp tất cả chính sách' },
    { from: 'Trang chủ', to: 'Hero, các dải sản phẩm, Customer Voice, Mili Talks ở trang chủ' },
    { from: 'Menu điều hướng', to: 'Menu đầu trang và chân trang' },
    { from: 'Cài đặt cửa hàng', to: 'Tên cửa hàng, email liên hệ, chân trang, mạng xã hội, SEO' },
    { from: 'Đơn hàng, Liên hệ', to: 'Khách không thấy: đây là nơi bạn xử lý đơn và tin nhắn của khách' },
  ],
}

/** The one idea that explains most screens: draft vs published. */
export const LIFECYCLE: GuideDiagram = {
  kind: 'flow',
  caption:
    'Áp dụng cho Sản phẩm, Bài viết, Trang, Giới thiệu và Chính sách. Với Trang, Giới thiệu và Chính sách, sửa nội dung đang xuất bản chỉ sửa bản nháp: website chỉ đổi khi bạn bấm Xuất bản lại. Riêng bài viết Mili Talks đã xuất bản: bấm lưu là website cập nhật ngay.',
  steps: [
    { label: 'Nháp', note: 'Chỉ Admin thấy. Lưu bao nhiêu lần cũng được.', tone: 'draft' },
    { label: 'Đăng bán / Xuất bản', note: 'Khách thấy trên website.', tone: 'live' },
    { label: 'Ngừng bán / Gỡ khỏi website', note: 'Ẩn khỏi website, vẫn giữ để bật lại sau.', tone: 'warn' },
    { label: 'Xoá / Lưu trữ', note: 'Gỡ hẳn, không khôi phục được.', tone: 'done' },
  ],
}

export const GUIDE_GROUPS: GuideGroup[] = [
  {
    title: 'Bắt đầu',
    sections: [
      {
        id: 'bat-dau',
        title: 'Đăng nhập và tài khoản',
        summary: 'Đăng nhập lần đầu và giữ tài khoản an toàn.',
        to: '/account',
        linkLabel: 'Mở Tài khoản',
        steps: [
          'Nếu hệ thống chưa có Admin nào, trang Đăng nhập hiện link “Thiết lập lần đầu” để tạo tài khoản chủ cửa hàng.',
          'Đăng nhập bằng email và mật khẩu. Nếu được yêu cầu, đổi mật khẩu ngay (tối thiểu 12 ký tự).',
          'Menu tài khoản (góc dưới thanh bên) → “Tài khoản & phiên đăng nhập”: xem các thiết bị đang đăng nhập và đăng xuất thiết bị lạ.',
        ],
        tips: [
          'Menu bên trái gom theo nhóm: Bán hàng, Trang website, Mili Talks (Blog), Thiết lập. Bấm tên nhóm để mở/gập; nhóm chứa trang đang mở tự mở ra. Thư viện ảnh và Hướng dẫn luôn hiện sẵn.',
          'Mục nào không hiện trên menu bên trái nghĩa là tài khoản của bạn chưa được cấp quyền cho mục đó.',
        ],
      },
    ],
  },
  {
    title: 'Theo dõi',
    sections: [
      {
        id: 'bang-dieu-khien',
        title: 'Bảng điều khiển: doanh thu, thuế, truy cập',
        summary: 'Số liệu bán hàng và lượt truy cập website theo khoảng thời gian.',
        to: '/',
        linkLabel: 'Mở Bảng điều khiển',
        steps: [
          'Chọn khoảng thời gian 7 / 30 / 90 ngày ở góc trên; mọi khung bên dưới dùng chung khoảng này (tính theo ngày UTC).',
          'Khung Tài chính: Tổng doanh thu là tổng tiền khách đã trả (đã gồm thuế); Tổng thuế là phần thuế nằm trong số đó, như ghi trên hoá đơn (không cộng thêm); Hoàn tiền; Doanh thu thuần = Tổng doanh thu − Thuế − Hoàn tiền; số đơn đã thanh toán.',
          'Khung Truy cập website (GoatCounter): lượt khách theo ngày, trang được xem nhiều, nguồn truy cập, quốc gia/trình duyệt, và số lượt Xem sản phẩm / Thêm vào giỏ / Bắt đầu thanh toán.',
        ],
        tips: [
          '“Lượt khách” là cách đếm của GoatCounter, không phải số người duy nhất hay số lượt xem trang.',
          'Nếu khung Truy cập báo “Chưa kết nối GoatCounter” hoặc lỗi, số liệu không phải 0 mà là chưa lấy được; liên hệ kỹ thuật.',
          'Thuế trên từng đơn là thuế lúc khách đặt; đổi cài đặt thuế không làm thay đổi đơn cũ.',
        ],
      },
    ],
  },
  {
    title: 'Bán hàng',
    sections: [
      {
        id: 'san-pham',
        title: 'Đăng bán sản phẩm',
        summary: 'Từ lúc có ảnh tới khi sản phẩm hiện trên Shop.',
        to: '/catalog/products',
        linkLabel: 'Mở Sản phẩm',
        diagram: {
          kind: 'flow',
          steps: [
            { label: 'Tải ảnh lên', note: 'Thư viện ảnh' },
            { label: 'Thêm sản phẩm', note: 'Tạo ở trạng thái Nháp', tone: 'draft' },
            { label: 'Chọn ảnh', note: 'Ảnh đầu tiên là ảnh chính', tone: 'draft' },
            { label: 'Điền đủ mục', note: 'Theo khung “Cần hoàn thành”', tone: 'draft' },
            { label: 'Đăng bán', note: 'Hiện trên Shop', tone: 'live' },
          ],
        },
        steps: [
          'Tải ảnh sản phẩm lên Thư viện ảnh trước (xem phần Thư viện ảnh).',
          'Vào Sản phẩm → “Thêm sản phẩm”. Điền những gì bạn có rồi bấm “Tạo sản phẩm”: chưa đủ thông tin cũng được, sản phẩm nằm ở Nháp.',
          'Bạn được chuyển sang tab Ảnh. Bấm “Chọn ảnh”, tích các ảnh cần dùng rồi bấm “Lưu ảnh”. Ảnh đầu tiên là ảnh chính.',
          'Cột bên phải liệt kê “Cần hoàn thành để đăng bán”. Bấm vào mục còn thiếu để nhảy tới ô cần điền.',
          'Đủ hết thì nút “Đăng bán” ở góc trên sáng lên. Bấm để đưa lên Shop. Muốn tạm ẩn thì bấm “Ngừng bán”.',
        ],
        tips: [
          'Thanh “Lưu” luôn ở cuối màn hình. Rời trang khi chưa lưu, hệ thống sẽ hỏi lại.',
          'Sản phẩm đang bán không đổi được slug. Muốn đổi đường dẫn, dùng tab Alias để link cũ vẫn chạy.',
        ],
      },
      {
        id: 'ton-kho',
        title: 'Cập nhật tồn kho',
        summary: 'Nhập thêm hàng, trừ hàng lỗi.',
        to: '/catalog/products',
        linkLabel: 'Mở Sản phẩm',
        steps: [
          'Mở sản phẩm. Ô “Tồn kho” nằm ở cột bên phải.',
          'Nhập số dương để thêm (vd. 3), số âm để bớt (vd. -1), ghi lý do rồi bấm “Cập nhật tồn kho”.',
        ],
        tips: [
          'Đơn đã thanh toán tự trừ kho. Hoàn tiền thì không tự cộng lại: nếu khách trả hàng, hãy cộng tay.',
          'Không giảm được tồn kho xuống dưới số đang được giữ cho các đơn chờ thanh toán.',
        ],
      },
      {
        id: 'danh-muc',
        title: 'Danh mục',
        summary: 'Nhóm sản phẩm để khách lọc trên Shop.',
        to: '/catalog/categories',
        linkLabel: 'Mở Danh mục',
        steps: [
          'Vào Danh mục → “Thêm danh mục”, nhập slug, tên tiếng Nhật và tiếng Anh.',
          'Gán danh mục cho sản phẩm ở ô “Danh mục” trong trang sản phẩm.',
        ],
        tips: ['Không xoá được danh mục nếu đó là danh mục duy nhất của một sản phẩm đang bán.'],
      },
      {
        id: 'don-hang',
        title: 'Xử lý đơn hàng',
        summary: 'Gửi hàng, cập nhật giao hàng và hoàn tiền.',
        to: '/orders',
        linkLabel: 'Mở Đơn hàng',
        diagram: {
          kind: 'flow',
          caption: 'Thanh toán do hệ thống tự cập nhật; giao hàng do bạn cập nhật. Trạng thái giao chỉ đi một chiều.',
          steps: [
            { label: 'Chờ thanh toán', note: 'Khách đang thanh toán', tone: 'warn' },
            { label: 'Đã thanh toán', note: 'Kho tự trừ', tone: 'live' },
            { label: 'Đã gửi hàng', note: 'Bạn nhập mã vận đơn', tone: 'neutral' },
            { label: 'Đã giao', note: 'Khách đã nhận', tone: 'done' },
          ],
        },
        steps: [
          'Vào Đơn hàng, lọc “Đã thanh toán” và bấm vào đơn cần xử lý.',
          'Ô Giao hàng: chọn “Đã gửi hàng”, nhập đơn vị vận chuyển và mã vận đơn rồi lưu.',
          'Khi khách đã nhận, chuyển sang “Đã giao”.',
          'Cần hoàn tiền: bấm “Hoàn tiền” ở góc trên, ghi lý do (không bắt buộc) và xác nhận.',
        ],
        tips: ['Ghi chú nội bộ chỉ Admin thấy, khách không nhận được.'],
      },
      {
        id: 'lien-he',
        title: 'Trả lời khách liên hệ',
        summary: 'Tin nhắn khách gửi từ trang お問い合わせ trên website.',
        to: '/inquiries',
        linkLabel: 'Mở Liên hệ',
        diagram: {
          kind: 'flow',
          steps: [
            { label: 'Khách gửi form', note: 'Trang お問い合わせ / Contact' },
            { label: 'Mới', note: 'In đậm trong danh sách', tone: 'warn' },
            { label: 'Đã đọc', note: 'Tự chuyển khi bạn mở tin', tone: 'neutral' },
            { label: 'Trả lời qua email', note: 'Mở ứng dụng mail của bạn', tone: 'neutral' },
            { label: 'Đã trả lời', note: 'Bấm đánh dấu sau khi gửi', tone: 'live' },
          ],
        },
        steps: [
          'Vào Liên hệ. Tin mới in đậm; lọc theo trạng thái hoặc chủ đề (sản phẩm, thu mua 買取, đơn hàng, góp ý).',
          'Bấm vào tin để đọc. Bên phải có tên, email, ngôn ngữ khách dùng và mã đơn (nếu có).',
          'Bấm “Trả lời qua email”: ứng dụng mail mở sẵn địa chỉ và tiêu đề. Trả lời bằng ngôn ngữ khách đã dùng.',
          'Gửi xong, bấm “Đánh dấu đã trả lời”. Tin không cần theo dõi nữa thì bấm “Lưu trữ”.',
        ],
        tips: [
          'Ô “Ghi chú nội bộ” để ghi lại đã xử lý thế nào (vd. đã gọi điện); khách không thấy.',
          'Hiện mục Liên hệ đang là bản mẫu với dữ liệu thử. Tin nhắn thật sẽ hiện khi hệ thống nối xong với website.',
        ],
      },
    ],
  },
  {
    title: 'Nội dung website',
    sections: [
      {
        id: 'anh',
        title: 'Thư viện ảnh',
        summary: 'Tải ảnh, xếp vào thư mục, viết mô tả và xoá ảnh.',
        to: '/media',
        linkLabel: 'Mở Thư viện ảnh',
        diagram: {
          kind: 'flow',
          steps: [
            { label: 'Chọn thư mục', note: 'Không bắt buộc, vd. jackets/ma-1' },
            { label: 'Tải ảnh lên', note: 'JPEG, PNG, WebP, AVIF ≤ 20 MB' },
            { label: 'Sẵn sàng', note: 'Thêm mô tả ảnh (alt)', tone: 'live' },
            { label: 'Dùng ở sản phẩm, bài viết…', note: 'Chọn từ thư viện', tone: 'live' },
          ],
        },
        steps: [
          'Cột bên trái là các thư mục. Mở thư mục nào thì ảnh tải lên mặc định vào thư mục đó. Muốn thư mục mới, gõ tên vào ô “Thư mục” cạnh nút tải lên, dùng “/” cho thư mục con (vd. “jackets/ma-1”, tối đa 5 cấp).',
          'Bấm “Tải ảnh lên”, chọn một hoặc nhiều ảnh, chờ trạng thái “Sẵn sàng”.',
          'Bấm biểu tượng bút trên ảnh để viết mô tả ảnh (alt) tiếng Nhật và tiếng Anh.',
          'Xoá một ảnh: biểu tượng thùng rác. Xoá nhiều ảnh: tick ô ở góc ảnh rồi bấm “Xoá N ảnh” trên thanh vừa hiện. Xoá cả thư mục: mở thư mục → “Xoá thư mục”.',
        ],
        tips: [
          'Ảnh đang dùng ở sản phẩm hoặc trang/bài viết (kể cả bản nháp) không xoá được và sẽ được giữ lại. Gỡ ảnh khỏi chỗ đang dùng trước rồi xoá.',
          '“Chưa phân thư mục” là các ảnh tải lên mà không chọn thư mục.',
          'Thư mục tự biến mất khi không còn ảnh nào bên trong.',
        ],
      },
      {
        id: 'bai-viet',
        title: 'Viết bài Mili Talks',
        summary: 'Bài blog hiện ở trang Mili Talks (/blog) trên website. Menu: Mili Talks (Blog) → Bài viết.',
        to: '/cms/stories',
        linkLabel: 'Mở Bài viết',
        diagram: {
          kind: 'flow',
          caption: 'Bài chưa xuất bản thì lưu bao nhiêu lần cũng chỉ Admin thấy. Bài đã xuất bản thì mỗi lần lưu là website cập nhật ngay.',
          steps: [
            { label: 'Thêm bài viết', note: 'Nhập slug' },
            { label: 'Soạn khối', note: 'Đầu bài viết + nội dung', tone: 'draft' },
            { label: 'Lưu', note: 'Chưa xuất bản: chỉ Admin thấy', tone: 'draft' },
            { label: 'Xuất bản', note: 'Hiện ở trang Mili Talks', tone: 'live' },
            { label: 'Sửa → Lưu và cập nhật website', note: 'Lên website ngay', tone: 'live' },
          ],
        },
        steps: [
          'Bài viết → “Thêm bài viết”, nhập slug (phần đường dẫn, vd. ma-1-history → /blog/ma-1-history). Bạn được đưa tới màn soạn bài.',
          'Tab Nội dung: điền tiêu đề tiếng Nhật và tiếng Anh (SEO không bắt buộc).',
          'Bấm “Thêm khối” → “Đầu bài viết”: chọn ảnh bìa, viết tóm tắt tiếng Nhật và tiếng Anh. Đây là phần hiện trên thẻ bài ở trang Mili Talks, mỗi bài cần đúng MỘT khối này.',
          'Thêm các khối nội dung: “Đoạn văn”, “Ảnh”, “Trích dẫn”, “Thư viện ảnh”… Gõ chữ trực tiếp, dùng thanh công cụ để in đậm, tạo tiêu đề, danh sách, link. Nút lên/xuống đổi thứ tự; công tắc “Hiển thị” để tạm ẩn khối.',
          'Bấm “Lưu” ở thanh cuối màn hình, “Xem trước” để xem như trên website.',
          'Khi khung “Cần hoàn thành để xuất bản” bên phải đã đủ, bấm “Xuất bản” ở góc trên.',
          'Bài đã xuất bản: sửa xong bấm “Lưu và cập nhật website”. Muốn tạm ẩn: “Gỡ khỏi website” (bài vẫn còn, xuất bản lại được). Bỏ hẳn: “Xoá bài”.',
        ],
        tips: [
          'Tab Phiên bản: xem các bản cũ và khôi phục khi lỡ sửa sai.',
          'Tab Đường dẫn: đổi slug. Đổi slug của bài đã đăng sẽ làm link cũ (đã chia sẻ, đã gắn ở chỗ khác) không còn chạy.',
          'Không cần “gắn” bài vào blog: trang Mili Talks tự lấy các bài đã xuất bản (xem phần Trang chủ blog).',
        ],
      },
      {
        id: 'bai-khong-hien',
        title: 'Bài viết không hiện trên website?',
        summary: 'Kiểm tra lần lượt các điều kiện dưới đây.',
        to: '/cms/stories',
        linkLabel: 'Mở Bài viết',
        diagram: {
          kind: 'flow',
          caption: 'Bài phải qua đủ 4 bước kiểm tra này mới hiện. Website lưu tạm khoảng 1 phút, nên bài mới có thể chậm một chút.',
          steps: [
            { label: 'Đã xuất bản?', note: 'Nhãn “Đã xuất bản” cạnh tiêu đề', tone: 'warn' },
            { label: 'Có 1 “Đầu bài viết”?', note: 'Đúng một khối, đang bật Hiển thị', tone: 'warn' },
            { label: 'Ảnh bìa Sẵn sàng?', note: 'Trong Thư viện ảnh, không lưu trữ', tone: 'warn' },
            { label: 'Trang chủ blog lấy bài?', note: '“Tự động: bài mới nhất” hoặc đã chọn bài', tone: 'warn' },
            { label: 'Hiện ở /blog', tone: 'live' },
          ],
        },
        steps: [
          'Mở bài: cạnh tiêu đề phải có nhãn “Đã xuất bản”. Nếu ghi “Chưa xuất bản”, bấm “Xuất bản”. Nút bị mờ (“Chưa đủ điều kiện xuất bản”) thì xem khung bên phải để biết còn thiếu gì.',
          'Tab Nội dung: phải có đúng MỘT khối “Đầu bài viết”, công tắc “Hiển thị” đang bật, đủ ảnh bìa và tóm tắt tiếng Nhật/Anh, và ít nhất một khối nội dung (Đoạn văn, Ảnh…).',
          'Ảnh bìa: mở Thư viện ảnh, tìm ảnh đó. Trạng thái phải là “Sẵn sàng”, không phải “Đang xử lý”, “Lỗi” hay “Đã lưu trữ”.',
          'Trang chủ blog → Danh sách bài: nếu đang để “Tự chọn bài” thì chỉ những bài đã chọn mới hiện. Để “Tự động: bài mới nhất” thì bài mới tự lên. Kiểm tra cả “Số bài tối đa”.',
          'Đã đủ hết: chờ khoảng 1 phút rồi tải lại trang /blog.',
        ],
      },
      {
        id: 'trang-chu-blog',
        title: 'Trang chủ blog (Mili Talks)',
        summary: 'Trang /blog: phần giới thiệu và Special Thanks ít khi sửa, danh sách bài tự cập nhật. Menu: Mili Talks (Blog) → Trang chủ blog.',
        to: '/cms/mili-talks',
        linkLabel: 'Mở Trang chủ blog',
        diagram: {
          kind: 'map',
          caption: 'Editor xếp theo đúng thứ tự trên website: phần cố định ở trên, phần tự động ở dưới.',
          fromTitle: 'Khung trong editor',
          toTitle: 'Trên trang /blog',
          rows: [
            { from: 'Giới thiệu Mili Talks', to: 'Tiêu đề lớn “MILI TALKS” và đoạn giới thiệu' },
            { from: 'Special Thanks', to: 'Ghi chú nguồn + các cột cảm ơn (Special Thanks, Brand/Shop, Collector)' },
            { from: 'Bài nổi bật', to: 'Một bài ảnh lớn (không bắt buộc)' },
            { from: 'Danh sách bài', to: 'Lưới bài đã xuất bản, tự cập nhật' },
          ],
        },
        steps: [
          'Giới thiệu Mili Talks: tiêu đề và đoạn giới thiệu, tiếng Nhật và tiếng Anh. Xuống dòng trống để tách đoạn.',
          'Special Thanks: đoạn ghi chú nguồn và các cột cảm ơn. Mỗi cột có tiêu đề và danh sách tên, mỗi dòng một tên; ô tên tiếng Anh để trống nếu giống tiếng Nhật. Công tắc “Hiện trên website” để bật/tắt cả khối.',
          'Bài nổi bật: chọn một bài đã xuất bản, hoặc để trống.',
          'Danh sách bài: để “Tự động: bài mới nhất” (khuyên dùng) hoặc “Tự chọn bài”; đặt số bài tối đa (1–24).',
          'Bấm “Lưu nháp”, rồi “Xuất bản” ở góc trên để áp dụng lên website.',
        ],
        tips: [
          'Nút “Nội dung mẫu” điền lại phần giới thiệu và Special Thanks theo amb-storage.com (phần tiếng Anh là bản dịch).',
          'Khác với bài viết, trang chủ blog vẫn cần bấm “Xuất bản” sau khi lưu thì website mới đổi.',
          'Các trang khác (trang chủ website, trang thường, landing) nằm ở Trang website → Trang khác. Trang chủ website có cấu trúc riêng nên tạm thời vẫn sửa bằng JSON.',
        ],
      },
      {
        id: 'gioi-thieu',
        title: 'Trang Giới thiệu (ABOUT US)',
        summary: 'Một trang duy nhất, chia sẵn theo các mục của website.',
        to: '/cms/about',
        linkLabel: 'Mở Giới thiệu',
        diagram: {
          kind: 'map',
          caption: 'Mỗi khung trong editor là một mục trên trang ABOUT US, theo đúng thứ tự.',
          fromTitle: 'Khung trong editor',
          toTitle: 'Mục trên website',
          rows: [
            { from: '会社概要 · Thông tin công ty', to: 'Bảng nhãn | nội dung (tên công ty, địa chỉ, liên hệ…)' },
            { from: 'ブランド理念, Mission, Vision', to: 'Các đoạn giới thiệu có định dạng' },
            { from: 'Core Values', to: 'Danh sách tự đánh số 1, 2, 3…' },
            { from: 'Our Promise, Knowledge & Community', to: 'Các đoạn giới thiệu có định dạng' },
            { from: 'お問い合わせ · Liên hệ', to: 'Mục liên hệ + nút sang form お問い合わせ' },
          ],
        },
        steps: [
          'Vào Giới thiệu. Bấm tên mục trong khung “Mục lục” để nhảy tới mục cần sửa; nút “↑ Mục lục” để quay lại.',
          'Mỗi mục điền cả tiếng Nhật (bên trái) và tiếng Anh (bên phải). Website hiện bản theo ngôn ngữ khách chọn.',
          'Bảng 会社概要 và Core Values: dùng nút thêm, nút lên/xuống và thùng rác để sắp xếp.',
          'Bấm “Lưu nội dung”, rồi “Xuất bản” ở góc trên để cập nhật website.',
        ],
        tips: [
          'Nút “Nội dung mẫu” điền lại toàn bộ theo amb-storage.com (phần tiếng Anh là bản dịch, nên đọc lại).',
          'Trang Giới thiệu không cần ngày hiệu lực.',
        ],
      },
      {
        id: 'customer-voice',
        title: 'Trang chủ (Hero, sản phẩm, Customer Voice)',
        summary: 'Các mục ở trang chủ website, sửa theo từng mục, không cần JSON. Menu: Trang website → Trang chủ.',
        to: '/cms/home',
        linkLabel: 'Mở Trang chủ',
        diagram: {
          kind: 'map',
          caption: 'Hero là mục bắt buộc; các mục khác có công tắc “Hiện trên website”, tắt thì không hiện.',
          fromTitle: 'Mục trong editor',
          toTitle: 'Trên trang chủ website',
          rows: [
            { from: 'Hero 2 danh mục', to: 'Hai ảnh lớn đầu trang, mỗi ảnh dẫn tới một danh mục (bắt buộc)' },
            { from: 'Special Vintage, Most Popular', to: 'Dải sản phẩm bạn tự chọn' },
            { from: 'New Arrivals', to: 'Dải sản phẩm mới nhất, tự động' },
            { from: 'Customer Voice', to: 'Thẻ đánh giá của khách kèm ảnh sản phẩm' },
            { from: 'Mili Talks trên trang chủ', to: 'Đoạn giới thiệu blog và một bài nổi bật' },
          ],
        },
        steps: [
          'Vào Trang website → Trang chủ. Bấm tên mục ở hàng nút trên cùng để nhảy tới mục đó.',
          'Hero 2 danh mục: mỗi bên chọn danh mục, ảnh và chữ trên ảnh (Nhật/Anh). Ô “Bấm vào thì mở” tự điền link tới danh mục; hai bên phải là hai danh mục khác nhau.',
          'Customer Voice: “Thêm đánh giá” → tên khách (không bắt buộc), câu đánh giá Nhật/Anh, và chọn sản phẩm khách đã mua (bắt buộc, ảnh sản phẩm là hình của thẻ).',
          'Bật/tắt các mục còn lại bằng công tắc “Hiện trên website”, chọn sản phẩm hoặc bài cho mục đang bật.',
          'Bấm “Lưu nháp”, rồi “Xuất bản” ở góc trên. Nút Xuất bản chỉ bật khi Hero đã lưu đủ 2 bên.',
        ],
        tips: [
          'Nếu thấy thông báo “định dạng cũ”: điền Hero rồi bấm “Lưu nháp (chuyển định dạng mới)”, sau đó Xuất bản. Trang chủ định dạng cũ không hiện được trên website.',
          'Đánh giá gắn sản phẩm không có ảnh thì thẻ đó không hiện.',
        ],
      },
      {
        id: 'chinh-sach',
        title: 'Chính sách',
        summary: 'Giao hàng, đổi trả, thanh toán, bảo mật… gộp vào trang Privacy Policy.',
        to: '/cms/policies',
        linkLabel: 'Mở Chính sách',
        diagram: {
          kind: 'map',
          caption:
            'Website ghép mọi chính sách đã xuất bản thành MỘT trang /policy, xếp theo slug từ A→Z, và tự tạo mục lục từ tiêu đề từng mục. Khung “Thứ tự trên website” ở màn Chính sách cho xem trước thứ tự này.',
          fromTitle: 'Trang chính sách (slug)',
          toTitle: 'Mục trên trang /policy',
          rows: [
            { from: 'legal-notice', to: '1–3. 特定商取引法に基づく表記, 必要料金, お支払い方法' },
            { from: 'returns-policy', to: '4. 返品・交換について' },
            { from: 'shipping-policy', to: '5. 商品の発送について' },
            { from: 'store-guide', to: '6–11. ヴィンテージ商品, プライバシー, 利用規約, 古物商, Amb:STORAGE, お問い合わせ' },
          ],
        },
        steps: [
          'Vào Chính sách. Lần đầu, bấm “Nội dung mẫu” để tạo sẵn 4 trang theo amb-storage.com (chỉ tạo nháp, chưa lên website).',
          'Mở từng trang. Mỗi mục có: tiêu đề, anchor (phần sau # trên link), đoạn văn, gạch đầu dòng, khối chi tiết (tiêu đề phụ + nội dung) và ghi chú cuối mục.',
          'Ô tiếng Nhật và tiếng Anh nằm cạnh nhau: đoạn văn cách nhau MỘT DÒNG TRỐNG, gạch đầu dòng mỗi dòng một mục. Hai bên phải cùng số mục, cùng thứ tự.',
          'Chọn “Ngày hiệu lực” (bắt buộc), bấm “Lưu nội dung”, rồi “Xuất bản”.',
        ],
        tips: [
          'Giữ nguyên slug “shipping-policy” và “returns-policy”: trang sản phẩm có link cố định tới hai trang này.',
          'Muốn một chính sách lên trước/sau, đặt slug sao cho đúng thứ tự A→Z.',
          'Bấm một mục trong “Thứ tự trên website” để mở đúng chỗ đó trong editor.',
        ],
      },
      {
        id: 'menu',
        title: 'Menu điều hướng',
        summary: 'Menu đầu trang và chân trang của website.',
        to: '/navigation',
        linkLabel: 'Mở Menu điều hướng',
        steps: [
          'Chọn HEADER hoặc FOOTER, bấm “Thêm mục”.',
          'Chọn loại liên kết (trang, danh mục, sản phẩm, bài viết, đường dẫn, link ngoài) và điền thông tin.',
          'Nút lên/xuống để sắp xếp, “Thêm mục con” để làm menu nhiều cấp, rồi bấm “Lưu menu”.',
        ],
        tips: [
          'Mục trỏ tới trang hay sản phẩm chưa xuất bản sẽ tự ẩn trên website.',
          'Chân trang luôn có link Privacy Policy và お問い合わせ, kể cả khi không thêm vào menu.',
        ],
      },
      {
        id: 'cai-dat',
        title: 'Cài đặt cửa hàng',
        summary: 'Tên cửa hàng, email liên hệ, thuế, chân trang, SEO, mạng xã hội.',
        to: '/settings',
        linkLabel: 'Mở Cài đặt',
        steps: ['Sửa thông tin cần thiết rồi bấm “Lưu cài đặt” ở thanh cuối màn hình. Không cần xuất bản.'],
        tips: [
          'Email liên hệ ở đây cũng hiện trên trang お問い合わせ của website.',
          '“Cách tính thuế”: với “Giá đã gồm thuế 10%”, khách trả đúng giá sản phẩm, thuế chỉ được tách ra để ghi trên hoá đơn. Chỉ “Giá chưa gồm thuế” mới cộng thêm 10% khi thanh toán. Áp dụng cho đơn mới giao trong Nhật. “Cách hiển thị thuế” chỉ là chữ cạnh giá trên website, nên để khớp với cách tính.',
        ],
      },
    ],
  },
  {
    title: 'Hệ thống',
    sections: [
      {
        id: 'nhat-ky',
        title: 'Nhật ký thao tác',
        summary: 'Ai đã làm gì, lúc nào.',
        to: '/audit-logs',
        linkLabel: 'Mở Nhật ký',
        steps: [
          'Mọi thao tác thêm, sửa, xoá, xuất bản đều được ghi lại kèm người làm và thời gian.',
          'Tìm theo mã thao tác, vd. PRODUCT_PUBLISHED (đăng bán sản phẩm) hoặc MEDIA_DELETED (xoá ảnh).',
        ],
      },
      {
        id: 'loi-thuong-gap',
        title: 'Khi gặp lỗi',
        summary: 'Những thông báo hay gặp và cách xử lý.',
        steps: [
          '“Đã bị người khác sửa”: có người vừa lưu trước bạn. Tải lại trang để lấy bản mới nhất rồi sửa lại.',
          '“Phiên đăng nhập đã hết hạn”: đăng nhập lại; những gì đã lưu không bị mất.',
          '“Bạn không có quyền…”: tài khoản chưa được cấp quyền cho mục này, liên hệ chủ cửa hàng.',
          '“Ảnh đang được sử dụng”: ảnh còn gắn với sản phẩm hoặc trang/bài viết, gỡ ra trước rồi xoá.',
          'Ô viền đỏ: đọc dòng chữ đỏ ngay dưới ô để biết cần sửa gì.',
        ],
      },
    ],
  },
]

export const GLOSSARY: Array<{ term: string; meaning: string }> = [
  { term: 'Nháp', meaning: 'Bản đang soạn, chỉ Admin thấy.' },
  { term: 'Xuất bản / Đăng bán', meaning: 'Đưa lên website cho khách thấy.' },
  { term: 'Huỷ xuất bản / Ngừng bán / Gỡ khỏi website', meaning: 'Ẩn khỏi website nhưng vẫn giữ lại, bật lại được.' },
  { term: 'Lưu trữ / Xoá', meaning: 'Gỡ hẳn, không khôi phục được.' },
  { term: 'Slug', meaning: 'Phần tên trên đường dẫn, vd. /shop/ma-1-jacket → “ma-1-jacket”. Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.' },
  { term: 'Alias', meaning: 'Đường dẫn cũ của sản phẩm, vẫn tự chuyển về đường dẫn mới.' },
  { term: 'Alt (mô tả ảnh)', meaning: 'Câu mô tả ảnh cho người dùng trình đọc màn hình và cho Google.' },
  { term: 'Anchor', meaning: 'Phần sau dấu # trên link, giúp nhảy thẳng tới một mục, vd. /policy#store-guide-privacy.' },
  { term: 'Ngày hiệu lực', meaning: 'Ngày chính sách bắt đầu áp dụng, hiện trên website.' },
  { term: 'Thư mục ảnh', meaning: 'Cách gom ảnh trong Thư viện ảnh; không ảnh hưởng tới website.' },
  { term: 'SEO', meaning: 'Tiêu đề và mô tả hiện trên kết quả Google; để trống thì dùng tiêu đề trang.' },
]

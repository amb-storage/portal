import type { LinkProps } from '@tanstack/react-router'

export interface GuideSection {
  id: string
  title: string
  summary: string
  /** Page the steps happen on. */
  to?: NonNullable<LinkProps['to']>
  linkLabel?: string
  steps: string[]
  tips?: string[]
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'bat-dau',
    title: 'Bắt đầu',
    summary: 'Đăng nhập lần đầu và bảo mật tài khoản.',
    to: '/account',
    linkLabel: 'Mở Tài khoản',
    steps: [
      'Nếu hệ thống chưa có Admin nào, trang Đăng nhập sẽ hiện link “Thiết lập lần đầu” để tạo tài khoản chủ cửa hàng.',
      'Đăng nhập bằng email và mật khẩu. Nếu được yêu cầu, đổi mật khẩu ngay (tối thiểu 12 ký tự).',
      'Vào menu tài khoản (góc dưới thanh bên) → “Tài khoản & phiên đăng nhập” để xem các thiết bị đang đăng nhập và đăng xuất thiết bị lạ.',
    ],
  },
  {
    id: 'san-pham',
    title: 'Thêm và đăng bán sản phẩm',
    summary: 'Từ lúc tạo nháp tới khi sản phẩm hiện trên cửa hàng.',
    to: '/catalog/products',
    linkLabel: 'Mở Sản phẩm',
    steps: [
      'Vào Sản phẩm → “Thêm sản phẩm”. Điền những gì bạn có, rồi bấm “Tạo sản phẩm” — có thể lưu nháp khi chưa đủ thông tin.',
      'Sau khi tạo, bạn được chuyển sang tab Ảnh. Bấm “Chọn ảnh”, tích các ảnh cần dùng, rồi bấm “Lưu ảnh”. Ảnh đầu tiên là ảnh chính.',
      'Cột bên phải hiện “Cần hoàn thành để đăng bán”. Bấm vào mục còn thiếu để nhảy tới ô cần điền.',
      'Khi đủ hết các mục, nút “Đăng bán” ở góc trên sẽ bật lên. Bấm để đưa sản phẩm lên cửa hàng.',
    ],
    tips: [
      'Thanh “Lưu” luôn nằm ở cuối màn hình; nếu rời trang khi chưa lưu, hệ thống sẽ hỏi lại.',
      'Sản phẩm đang bán không đổi được slug. Muốn đổi đường dẫn, dùng tab Alias để giữ link cũ.',
      'Cần ảnh trước? Tải ảnh lên ở Thư viện ảnh rồi mới chọn được trong sản phẩm.',
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
      'Đơn đã thanh toán tự trừ kho. Hoàn tiền thì không tự cộng lại — hãy cộng tay nếu hàng được trả về.',
      'Không thể giảm tồn kho xuống dưới số đang được giữ bởi các đơn chờ thanh toán.',
    ],
  },
  {
    id: 'danh-muc',
    title: 'Danh mục',
    summary: 'Nhóm sản phẩm để khách dễ tìm.',
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
    summary: 'Giao hàng và hoàn tiền.',
    to: '/orders',
    linkLabel: 'Mở Đơn hàng',
    steps: [
      'Vào Đơn hàng, lọc “Đã thanh toán” và bấm vào đơn cần xử lý.',
      'Ở ô Giao hàng: chọn “Đã gửi hàng”, nhập đơn vị vận chuyển và mã vận đơn, rồi bấm lưu.',
      'Khi khách đã nhận, chuyển sang “Đã giao”.',
      'Cần hoàn tiền: bấm “Hoàn tiền” ở góc trên, ghi lý do (không bắt buộc) và xác nhận.',
    ],
    tips: [
      'Trạng thái giao chỉ đi một chiều: Chờ giao → Đã gửi hàng → Đã giao.',
      'Ghi chú nội bộ chỉ Admin thấy.',
    ],
  },
  {
    id: 'anh',
    title: 'Thư viện ảnh',
    summary: 'Tải ảnh và viết mô tả ảnh.',
    to: '/media',
    linkLabel: 'Mở Thư viện ảnh',
    steps: [
      'Muốn gom ảnh theo nhóm thì gõ hoặc chọn thư mục ở ô “Thư mục” (vd. “bracelets/2026”, tối đa 5 cấp). Để trống nếu không cần.',
      'Bấm “Tải ảnh lên” và chọn một hoặc nhiều ảnh (JPEG, PNG, WebP, AVIF; tối đa 20 MB mỗi ảnh).',
      'Chờ trạng thái chuyển sang “Sẵn sàng”. Bấm biểu tượng bút để thêm mô tả ảnh (alt) tiếng Nhật và tiếng Anh.',
      'Ảnh tải nhầm thì bấm biểu tượng thùng rác để xoá hẳn. Ảnh đang gắn với sản phẩm hoặc dùng trong trang/bài viết thì không xoá được.',
      'Cột bên trái để xem ảnh theo thư mục (“Chưa phân thư mục” là ảnh tải lên không chọn thư mục). Đang mở thư mục nào thì ảnh tải lên mặc định vào thư mục đó. Nút “Xoá thư mục” xoá toàn bộ ảnh bên trong, trừ ảnh đang được dùng.',
    ],
  },
  {
    id: 'noi-dung',
    title: 'Bài viết và Trang',
    summary: 'Mili Talks, trang giới thiệu, chính sách…',
    to: '/cms/stories',
    linkLabel: 'Mở Bài viết',
    steps: [
      'Vào Bài viết → “Thêm bài viết”, nhập slug. Bạn sẽ được đưa tới trang soạn.',
      'Ở tab Nháp, điền tiêu đề tiếng Nhật và tiếng Anh.',
      'Bấm “Thêm khối” để thêm nội dung: “Đầu bài viết” (ảnh bìa + tóm tắt), “Đoạn văn”, “Ảnh”, “Trích dẫn”… Gõ chữ trực tiếp và dùng thanh công cụ để in đậm, tạo tiêu đề, danh sách, link.',
      'Dùng nút lên/xuống để đổi thứ tự khối, công tắc “Hiển thị” để tạm ẩn một khối.',
      'Bấm “Lưu nháp” ở thanh cuối màn hình, rồi “Xuất bản” ở góc trên khi muốn bài hiện trên web.',
    ],
    tips: [
      'Ô có dấu * là bắt buộc. Khung vàng phía trên liệt kê những chỗ còn thiếu; chưa sửa xong thì chưa lưu được.',
      'Giới thiệu và Chính sách có mục riêng ở menu bên trái. Trang Giới thiệu chia sẵn theo mục giống website (会社概要, ブランド理念, Mission, Vision, Core Values, Our Promise, Knowledge & Community, お問い合わせ); mỗi mục điền tiếng Nhật và tiếng Anh. Nút “Nội dung mẫu” điền lại nội dung theo amb-storage.com.',
      'Chính sách chia theo mục (tiêu đề, đoạn văn, gạch đầu dòng, khối chi tiết, ghi chú), tiếng Nhật và tiếng Anh, cần ngày hiệu lực khi xuất bản. Website gộp mọi chính sách đã xuất bản vào trang /policy theo thứ tự slug. Nút “Nội dung mẫu” ở màn Chính sách tạo sẵn các trang theo amb-storage.com.',
      'Trang chủ dùng cấu trúc riêng nên tạm thời vẫn sửa bằng JSON.',
      'Có thể quay về phiên bản cũ ở tab Phiên bản → biểu tượng khôi phục.',
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
      'Dùng nút lên/xuống để sắp xếp, rồi bấm “Lưu menu”.',
    ],
  },
  {
    id: 'cai-dat',
    title: 'Cài đặt cửa hàng',
    summary: 'Tên cửa hàng, thuế, chân trang, SEO, mạng xã hội.',
    to: '/settings',
    linkLabel: 'Mở Cài đặt',
    steps: ['Sửa thông tin cần thiết rồi bấm “Lưu cài đặt” ở thanh cuối màn hình.'],
  },
  {
    id: 'loi-thuong-gap',
    title: 'Khi gặp lỗi',
    summary: 'Những thông báo hay gặp và cách xử lý.',
    steps: [
      '“Đã bị người khác sửa”: tải lại trang để lấy dữ liệu mới nhất rồi sửa lại.',
      '“Phiên đăng nhập đã hết hạn”: đăng nhập lại; dữ liệu đã lưu không bị mất.',
      '“Bạn không có quyền…”: tài khoản chưa được cấp quyền cho mục này, liên hệ chủ cửa hàng.',
      'Mọi thao tác đều được ghi ở Nhật ký thao tác nếu cần kiểm tra ai đã sửa gì.',
    ],
  },
]

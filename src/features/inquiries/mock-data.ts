import type { Inquiry } from './types'

const at = (daysAgo: number, hour: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, 12, 0, 0)
  return date.toISOString()
}

/** Sample messages for the admin mock-up; replaced by the API once it exists. */
export const SAMPLE_INQUIRIES: Inquiry[] = [
  {
    id: '6f1c2a10-0001-4000-8000-000000000001',
    name: '山田 太郎',
    email: 'taro.yamada@example.jp',
    category: 'PRODUCT',
    subject: 'MA-1のサイズについて',
    message:
      'こんにちは。\n商品ページのMA-1（1960年代）について、着丈と身幅の実寸をもう少し詳しく教えていただけますか？\n普段はMサイズを着ています。\nよろしくお願いいたします。',
    locale: 'ja',
    orderNumber: null,
    status: 'NEW',
    adminNote: null,
    createdAt: at(0, 9),
    updatedAt: at(0, 9),
    repliedAt: null,
  },
  {
    id: '6f1c2a10-0001-4000-8000-000000000002',
    name: 'Emily Carter',
    email: 'emily.carter@example.com',
    category: 'ORDER',
    subject: 'Shipping to Australia',
    message:
      'Hi, I placed an order last week and wanted to check the estimated delivery time to Sydney. Will I need to pay customs duties on arrival?\nThanks!',
    locale: 'en',
    orderNumber: 'AMB-20260418-0012',
    status: 'NEW',
    adminNote: null,
    createdAt: at(0, 7),
    updatedAt: at(0, 7),
    repliedAt: null,
  },
  {
    id: '6f1c2a10-0001-4000-8000-000000000003',
    name: '佐藤 健',
    email: 'ken.sato@example.jp',
    category: 'BUYING',
    subject: 'Levi’s 507XX 買取希望',
    message:
      'Levi’s 507XX（セカンド）の買取をお願いしたいです。\nサイズ38、目立つダメージはありません。写真を送ることもできます。\n査定方法を教えてください。',
    locale: 'ja',
    orderNumber: null,
    status: 'READ',
    adminNote: 'Hẹn khách gửi ảnh qua Instagram DM.',
    createdAt: at(1, 21),
    updatedAt: at(1, 22),
    repliedAt: null,
  },
  {
    id: '6f1c2a10-0001-4000-8000-000000000004',
    name: 'Lucas Martin',
    email: 'lucas.martin@example.fr',
    category: 'FEEDBACK',
    subject: 'Loved the Mili Talks article',
    message:
      'Just wanted to say the article about the USMC HBT series was fantastic. Would love to see one about WWII-era denim next. Keep it up!',
    locale: 'en',
    orderNumber: null,
    status: 'REPLIED',
    adminNote: null,
    createdAt: at(3, 15),
    updatedAt: at(2, 10),
    repliedAt: at(2, 10),
  },
  {
    id: '6f1c2a10-0001-4000-8000-000000000005',
    name: '鈴木 花子',
    email: 'hanako.suzuki@example.jp',
    category: 'ORDER',
    subject: '銀行振込の確認',
    message: '昨日、楽天銀行へ振込をしました。入金の確認ができましたらご連絡いただけますか。\n注文番号を記載します。',
    locale: 'ja',
    orderNumber: 'AMB-20260420-0031',
    status: 'REPLIED',
    adminNote: 'Đã xác nhận tiền vào, gửi hàng ngày 21.',
    createdAt: at(5, 11),
    updatedAt: at(4, 9),
    repliedAt: at(4, 9),
  },
  {
    id: '6f1c2a10-0001-4000-8000-000000000006',
    name: 'Kim Minji',
    email: 'minji.kim@example.kr',
    category: 'OTHER',
    subject: 'Visiting the store',
    message: 'Hello! I will be in Osaka next month. Is it possible to visit your shop in person? What are your opening hours?',
    locale: 'en',
    orderNumber: null,
    status: 'ARCHIVED',
    adminNote: null,
    createdAt: at(12, 18),
    updatedAt: at(10, 12),
    repliedAt: at(11, 9),
  },
]

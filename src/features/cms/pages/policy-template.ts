/**
 * Starter Policy content mirroring https://www.amb-storage.com/policy
 * (Japanese copied from the live site; English translated for the bilingual API).
 *
 * The website's /policy page lists every published POLICY page ordered by slug, so the
 * live page's 11 sections are split over four slugs that keep (nearly) the same order.
 * `shipping-policy` and `returns-policy` must keep their slugs: product pages link to them.
 */

type Pair = readonly [ja: string, en: string]

interface DetailTemplate {
  titleJa?: string
  titleEn?: string
  paragraphs?: Pair[]
  bullets?: Pair[]
}

export interface PolicySectionTemplate {
  anchorKey: string
  titleJa: string
  titleEn: string
  paragraphs?: Pair[]
  bullets?: Pair[]
  details?: DetailTemplate[]
  notes?: Pair[]
}

export interface PolicyPageTemplate {
  slug: string
  titleJa: string
  titleEn: string
  sections: PolicySectionTemplate[]
}

const CONTACT_LINES: Pair[] = [
  ['電話番号：06-7164-6821 / 080-5959-2198', 'Phone: 06-7164-6821 / 080-5959-2198'],
  ['Email：theambitionent@gmail.com', 'Email: theambitionent@gmail.com'],
  ['Instagram：@amb.storage', 'Instagram: @amb.storage'],
]

export const POLICY_TEMPLATES: PolicyPageTemplate[] = [
  {
    slug: 'legal-notice',
    titleJa: '特定商取引法に基づく表記',
    titleEn: 'Legal Notice',
    sections: [
      {
        anchorKey: 'legal-notice',
        titleJa: '特定商取引法に基づく表記 / ご利用ガイド',
        titleEn: 'Legal Notice (Specified Commercial Transactions Act) / Shopping Guide',
        details: [
          { titleJa: '販売業者', titleEn: 'Seller', bullets: [['Amb:STORAGE', 'Amb:STORAGE']] },
          { titleJa: '管理者', titleEn: 'Manager', bullets: [['MAU LAM NGUYEN HUNG', 'MAU LAM NGUYEN HUNG']] },
          {
            titleJa: '所在地',
            titleEn: 'Address',
            bullets: [['〒558-0023 大阪府大阪市住吉区山之内1-24-30-106', '1-24-30-106 Yamanouchi, Sumiyoshi-ku, Osaka 558-0023, Japan']],
          },
          { titleJa: '連絡先', titleEn: 'Contact', bullets: CONTACT_LINES },
        ],
        notes: [['※お問い合わせはメールまたはInstagramのDMよりお願いいたします。', '※Please contact us by email or Instagram DM.']],
      },
      {
        anchorKey: 'additional-fees',
        titleJa: '商品価格以外の必要料金',
        titleEn: 'Charges Other Than the Item Price',
        paragraphs: [
          ['商品価格には消費税および日本国内への配送料が含まれています。', 'Item prices include consumption tax and shipping within Japan.'],
          [
            '海外発送の場合、配送料・関税・輸入税・通関手数料などの追加費用が発生する場合があります。これらの費用は配送先の国および配送方法によって異なります。',
            'For international orders, additional charges such as shipping fees, customs duties, import taxes and clearance fees may apply. These vary by destination country and shipping method.',
          ],
          [
            '詳細はチェックアウト時にご確認いただくか、ご不明な点がございましたらお問い合わせください。',
            'Please check the details at checkout, or contact us if you have any questions.',
          ],
        ],
      },
      {
        anchorKey: 'payment',
        titleJa: 'お支払い方法',
        titleEn: 'Payment Methods',
        paragraphs: [['以下のお支払い方法をご利用いただけます。', 'The following payment methods are available.']],
        bullets: [
          ['クレジットカード決済', 'Credit card'],
          ['オンライン決済', 'Online payment'],
          ['銀行振込', 'Bank transfer'],
          ['現金（店頭のみ）', 'Cash (in store only)'],
        ],
        details: [
          { titleJa: 'クレジットカード決済', titleEn: 'Credit card', bullets: [['Visa / MasterCard / AMEX / JCB', 'Visa / MasterCard / AMEX / JCB']] },
          { titleJa: 'オンライン決済', titleEn: 'Online payment', bullets: [['Square Pay / Apple Pay / Google Pay', 'Square Pay / Apple Pay / Google Pay']] },
          {
            titleJa: '銀行振込',
            titleEn: 'Bank transfer',
            bullets: [
              ['金融機関：楽天銀行', 'Bank: Rakuten Bank'],
              ['支店名：254', 'Branch: 254'],
              ['口座種別：普通', 'Account type: Ordinary'],
              ['口座番号：7789191', 'Account number: 7789191'],
              ['口座名義：グエン ニー（ド', 'Account holder: グエン ニー（ド'],
            ],
          },
        ],
        notes: [
          ['※お振込は３日間以内にお願いします。', '※Please complete the transfer within 3 days.'],
          ['※払込み手数料はお客様負担でお願い致します。', '※Transfer fees are to be paid by the customer.'],
          ['※ご入金が確認でき次第、商品を発送致します。', '※Items will be shipped once payment has been confirmed.'],
          ['※払込み時の控えは紛失しないようにご注意下さい。', '※Please keep your transfer receipt.'],
        ],
      },
    ],
  },
  {
    slug: 'returns-policy',
    titleJa: '返品ポリシー',
    titleEn: 'Returns Policy',
    sections: [
      {
        anchorKey: 'returns',
        titleJa: '返品・交換について',
        titleEn: 'Returns & Exchanges',
        paragraphs: [
          [
            '返品、交換は、お届け後7日以内に、メールまたはお電話にてご連絡ください。返品のご案内をさせて頂きます。（返品をお受けできない商品もありますので、ご連絡の前に下記内容をご確認くださいませ）',
            'For returns or exchanges, please contact us by email or phone within 7 days of delivery and we will guide you through the process. (Some items cannot be returned, so please check the details below before contacting us.)',
          ],
          [
            '商品の品質管理には十分注意しておりますが、万が一以下のような問題があった場合には返品または交換を承ります。',
            'We take great care with quality control, but if any of the following problems occur, we will accept a return or exchange.',
          ],
        ],
        bullets: [
          ['誤った商品が届いた場合', 'You received the wrong item'],
          ['配送中の事故による破損があった場合', 'The item was damaged in transit'],
        ],
        details: [
          {
            paragraphs: [
              ['上記の場合は、商品到着後7日以内にご連絡ください。', 'In these cases, please contact us within 7 days of receiving the item.'],
              [
                '納品商品の送り間違いにつきましては、お送りした商品を返送いただいた後にご注文の商品をお送りいたします（送料は当店が負担します）。大変ご迷惑をお掛けいたしますが何卒ご理解ご了承くださいませ。',
                'If we sent the wrong item, we will ship the item you ordered once the incorrect item has been returned (we cover the shipping costs). We apologise for the inconvenience and appreciate your understanding.',
              ],
              [
                '万が一、商品が欠品している場合は、同等価格の商品と交換させていただくか、代金をお返しさせていただきます。',
                'If an item turns out to be out of stock, we will exchange it for an item of equivalent value or refund the payment.',
              ],
            ],
          },
          {
            paragraphs: [['ただし、以下の場合は返品・交換をお受けできません。', 'However, we cannot accept returns or exchanges in the following cases.']],
            bullets: [
              ['お届けから7日以上経過した商品', 'More than 7 days have passed since delivery'],
              ['商品の箱などが破損、紛失、破棄された商品', 'The item’s box or packaging has been damaged, lost or discarded'],
              ['イメージ違いなどお客様のご都合による返品', 'Returns for personal reasons, such as the item not matching your expectations'],
              ['注文間違い', 'Ordering mistakes'],
              ['商品到着後に発生した破損', 'Damage that occurred after delivery'],
              ['一度ご使用になられた商品', 'Items that have been used'],
              ['返品/交換の連絡から1週間以上経過して到着した商品', 'Items that arrive more than one week after you contacted us about a return or exchange'],
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'shipping-policy',
    titleJa: '配送ポリシー',
    titleEn: 'Shipping Policy',
    sections: [
      {
        anchorKey: 'shipping',
        titleJa: '商品の発送について',
        titleEn: 'Shipping',
        paragraphs: [
          ['商品は丁寧に検品・梱包したうえで発送いたします。', 'Every item is carefully inspected and packed before shipping.'],
          [
            '発送までの日数は商品によって異なる場合がありますので、詳細は各商品ページをご確認ください。',
            'Dispatch times may vary by item, so please check each product page for details.',
          ],
        ],
        bullets: [
          ['日本国内配送の場合、通常は発送後1〜3日程度でお届けとなります。', 'Domestic orders within Japan usually arrive 1–3 days after dispatch.'],
          ['海外発送の場合、配送には約2〜4週間程度かかる場合があります。', 'International orders may take approximately 2–4 weeks to arrive.'],
        ],
        notes: [['また、通関手続きや配送状況により遅延が発生する場合があります。', 'Delays may also occur due to customs procedures or shipping conditions.']],
      },
    ],
  },
  {
    slug: 'store-guide',
    titleJa: 'ご利用ガイド',
    titleEn: 'Store Guide',
    sections: [
      {
        anchorKey: 'vintage-items',
        titleJa: 'ヴィンテージ商品の特性について',
        titleEn: 'About Vintage Items',
        paragraphs: [
          [
            '当店で取り扱う商品は、主にヴィンテージおよびユーズドアイテムです。そのため新品とは異なり、経年による変化や使用感が見られる場合があります。',
            'Our items are mainly vintage and used pieces. Unlike new items, they may show signs of age and wear.',
          ],
          [
            'すべての商品は一点一点検品を行い、できる限り正確に状態をお伝えするよう努めております。',
            'Every item is inspected individually, and we do our best to describe its condition as accurately as possible.',
          ],
          [
            '商品状態について不明点がある場合は、ご購入前にお気軽にお問い合わせください。',
            'If you have any questions about an item’s condition, please feel free to contact us before purchasing.',
          ],
        ],
      },
      {
        anchorKey: 'privacy',
        titleJa: 'プライバシーポリシー',
        titleEn: 'Privacy Policy',
        paragraphs: [
          [
            '当店では、お客様の個人情報を適切に管理し、以下の目的の範囲内でのみ利用いたします。',
            'We manage your personal information appropriately and use it only for the following purposes.',
          ],
        ],
        bullets: [
          ['商品の発送', 'Shipping your order'],
          ['お問い合わせ対応', 'Responding to enquiries'],
          ['サービス向上のための分析', 'Analysis to improve our service'],
        ],
        details: [
          {
            paragraphs: [
              [
                'お客様の個人情報を第三者へ提供することは、以下の場合を除き行いません。',
                'We do not provide your personal information to third parties except in the following cases.',
              ],
            ],
            bullets: [
              ['法令に基づく場合', 'When required by law'],
              ['お客様の同意がある場合', 'When you have given your consent'],
            ],
          },
        ],
        notes: [['個人情報の安全管理には十分配慮し、適切に取り扱います。', 'We take great care to keep your personal information secure and handle it appropriately.']],
      },
      {
        anchorKey: 'terms',
        titleJa: '利用規約',
        titleEn: 'Terms of Use',
        paragraphs: [['当サイトをご利用いただく際には、以下の内容に同意いただいたものとみなします。', 'By using this site, you are deemed to have agreed to the following.']],
        bullets: [
          [
            '商品情報はできる限り正確に掲載しておりますが、ヴィンテージ商品の特性上、個体差が存在する場合があります。',
            'We list product information as accurately as possible, but due to the nature of vintage items, individual pieces may vary.',
          ],
          [
            '商品写真は実物に近い色味で掲載しておりますが、モニター環境により実際の色味と異なる場合があります。',
            'Product photos are shown in colours close to the real item, but colours may look different depending on your screen.',
          ],
          [
            '当店の商品は実店舗と在庫を共有しているため、ご注文のタイミングによっては売り切れとなる場合があります。',
            'Our online stock is shared with our physical store, so an item may sell out depending on when you order.',
          ],
          ['当サイトの内容および掲載情報は予告なく変更される場合があります。', 'The content and information on this site may change without notice.'],
        ],
      },
      {
        anchorKey: 'secondhand-license',
        titleJa: '古物商許可証',
        titleEn: 'Secondhand Dealer License',
        paragraphs: [['第６２１２２Ｒ０８２７８０号', 'No. 62122R082780']],
      },
      {
        anchorKey: 'about-store',
        titleJa: 'Amb:STORAGEについて',
        titleEn: 'About Amb:STORAGE',
        paragraphs: [
          [
            'Amb:STORAGEは、ミリタリーやデニムを中心とした特別なヴィンテージ古着の買取・販売を専門とするショップです。',
            'Amb:STORAGE is a shop specialising in buying and selling special vintage clothing, with a focus on military and denim.',
          ],
          ['すべての商品は', 'Every item is selected based on'],
        ],
        bullets: [
          ['Originality（オリジナル性）', 'Originality'],
          ['Condition（コンディション）', 'Condition'],
          ['Collectible Value（コレクション価値）', 'Collectible value'],
        ],
        notes: [
          ['という基準をもとに厳選されています。', 'as our selection criteria.'],
          [
            '私たちは、ヴィンテージファッション業界で長年の経験を持つチームによって運営されています。',
            'We are run by a team with many years of experience in the vintage fashion industry.',
          ],
          [
            '各アイテムは丁寧に検品・選定されたうえでご紹介しており、お客様が安心してご購入いただける環境づくりを大切にしています。',
            'Each item is carefully inspected and selected before it is presented, and we value creating an environment where you can shop with confidence.',
          ],
          [
            '商品数は多くありませんが、その分一つひとつの品質と価値に自信があります。',
            'We do not carry a large number of items, but we are confident in the quality and value of every single one.',
          ],
          [
            '「ヴィンテージの価値は、価格ではなく、その一着が歩んできたストーリーにある。」私たちはそう信じています。',
            '“The value of vintage lies not in its price, but in the story each piece has lived.” That is what we believe.',
          ],
        ],
      },
      {
        anchorKey: 'contact',
        titleJa: 'お問い合わせ',
        titleEn: 'Contact',
        paragraphs: [
          [
            'ご質問・ご相談は、メールまたはInstagramのDMよりお気軽にお問い合わせください。',
            'For questions or enquiries, please feel free to contact us by email or Instagram DM.',
          ],
        ],
        bullets: CONTACT_LINES,
      },
    ],
  },
]

export const policyTemplateFor = (slug: string) => POLICY_TEMPLATES.find((template) => template.slug === slug)

const items = (pairs: Pair[] | undefined) => (pairs ?? []).map(([textJa, textEn]) => ({ id: crypto.randomUUID(), textJa, textEn }))

/** API `content` (schemaVersion 2 POLICY_SECTIONs) for a template page. */
export function policyTemplateContent(template: PolicyPageTemplate) {
  return {
    schemaVersion: 2,
    sections: template.sections.map((section) => ({
      id: crypto.randomUUID(),
      type: 'POLICY_SECTION',
      schemaVersion: 2,
      enabled: true,
      settings: {
        anchorKey: section.anchorKey,
        titleJa: section.titleJa,
        titleEn: section.titleEn,
        paragraphs: items(section.paragraphs),
        bullets: items(section.bullets),
        details: (section.details ?? []).map((detail) => ({
          id: crypto.randomUUID(),
          ...(detail.titleJa && detail.titleEn ? { titleJa: detail.titleJa, titleEn: detail.titleEn } : {}),
          paragraphs: items(detail.paragraphs),
          bullets: items(detail.bullets),
        })),
        notes: items(section.notes),
      },
      blocks: [],
    })),
  }
}

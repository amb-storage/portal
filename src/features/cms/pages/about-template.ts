import type { RichNode } from '@/features/cms/editor/types'

/**
 * Starter About content mirroring https://www.amb-storage.com/about-us
 * (Japanese copied from the live site; English translated for the bilingual API).
 */

type Inline = string | { b: string } | { link: string; text: string }

const inline = (part: Inline): RichNode[] => {
  if (typeof part !== 'string') {
    if ('b' in part) return [{ type: 'text', text: part.b, marks: [{ type: 'bold' }] }]
    return [{ type: 'text', text: part.text, marks: [{ type: 'link', attrs: { href: part.link } }] }]
  }
  // "\n" inside a paragraph becomes a hard line break, as on the live site.
  return part.split('\n').flatMap((line, index): RichNode[] => [
    ...(index > 0 ? [{ type: 'hardBreak' }] : []),
    ...(line ? [{ type: 'text', text: line }] : []),
  ])
}

const p = (...parts: Inline[]): RichNode => ({ type: 'paragraph', content: parts.flatMap(inline) })
const doc = (...paragraphs: RichNode[]): Record<string, unknown> => ({ type: 'doc', content: paragraphs }) as unknown as Record<string, unknown>

export const ABOUT_TEMPLATE = {
  titleJa: 'ABOUT US',
  titleEn: 'ABOUT US',
  overview: [
    { labelJa: '社名', labelEn: 'Company', valueJa: 'NGUYEN NHI合同会社', valueEn: 'NGUYEN NHI G.K.' },
    { labelJa: '代表社員', labelEn: 'Representative', valueJa: 'NGUYEN THUY NHI', valueEn: 'NGUYEN THUY NHI' },
    { labelJa: '店舗', labelEn: 'Store', valueJa: 'Amb:STORAGE', valueEn: 'Amb:STORAGE' },
    {
      labelJa: '事業内容',
      labelEn: 'Business',
      valueJa: 'ミリタリーおよびデニムを中心としたヴィンテージ古着の買取・販売を行っています。',
      valueEn: 'Buying and selling vintage clothing, with a focus on military and denim.',
    },
    {
      labelJa: '問い合わせ先',
      labelEn: 'Contact',
      valueJa: '電話番号：06-7164-6821 / 080-5959-2198\nメール：theambitionent@gmail.com\nInstagram：@amb.storage',
      valueEn: 'Phone: 06-7164-6821 / 080-5959-2198\nEmail: theambitionent@gmail.com\nInstagram: @amb.storage',
    },
    { labelJa: '古物商許可証', labelEn: 'Secondhand dealer license', valueJa: '第６２１２２Ｒ０８２７８０号', valueEn: 'No. 62122R082780' },
  ],
  philosophy: {
    headingJa: 'ブランド理念',
    headingEn: 'Brand Philosophy',
    bodyJa: doc(
      p({ b: 'ヴィンテージの価値は、価格ではなく、その一着が歩んできたストーリーにある。' }),
      p('私たちはヴィンテージを単なる古い衣服としてではなく、時代を越えて受け継がれてきた歴史と文化の一部であると考えています。'),
    ),
    bodyEn: doc(
      p({ b: 'The value of vintage lies not in its price, but in the story each piece has lived.' }),
      p('We see vintage not simply as old clothing, but as part of a history and culture handed down across generations.'),
    ),
  },
  mission: {
    bodyJa: doc(
      p('私たちは、ミリタリーやデニムを中心としたヴィンテージアイテムを\n', { b: '「オリジナル性」「コンディション」「コレクション価値」' }, '\nという基準で厳選し、その価値や背景を正しく伝えることを使命としています。'),
      p('単なる売買にとどまらず、アイテムが持つ歴史やストーリーを共有し、\nお客様が安心してヴィンテージを楽しめる環境をつくることを大切にしています。'),
    ),
    bodyEn: doc(
      p('Our mission is to carefully select vintage items, centred on military and denim, by the standards of ', { b: 'originality, condition and collectible value' }, ', and to convey their true value and background.'),
      p('Beyond buying and selling, we share the history and stories behind each item and create an environment where customers can enjoy vintage with confidence.'),
    ),
  },
  vision: {
    bodyJa: doc(
      p('ヴィンテージ文化を広め、\nコレクターから初心者までが安心して楽しめる\n', { b: '信頼性の高いヴィンテージコミュニティ' }, 'を育てていきたいと考えています。'),
      p('また、ブログ', { b: '「Mili Talks」' }, 'を通して知識や経験を共有し、\nヴィンテージを一過性の流行ではなく、\n', { b: '次の世代へと受け継がれる文化' }, 'として広げていくことを目指しています。'),
    ),
    bodyEn: doc(
      p('We want to spread vintage culture and grow ', { b: 'a trusted vintage community' }, ' where everyone, from collectors to beginners, can enjoy it with confidence.'),
      p('Through our blog ', { b: '“Mili Talks”' }, ' we share knowledge and experience, aiming to establish vintage not as a passing trend but as ', { b: 'a culture passed on to the next generation' }, '.'),
    ),
  },
  values: [
    {
      titleJa: 'Authenticity（オリジナルへのこだわり）',
      titleEn: 'Authenticity',
      bodyJa: 'ヴィンテージの本質であるオリジナル性を何よりも重視します。',
      bodyEn: 'We value originality, the essence of vintage, above all else.',
    },
    {
      titleJa: 'Quality over Quantity（量より質）',
      titleEn: 'Quality over Quantity',
      bodyJa: '取扱点数よりも、一点一点の品質と価値を大切にします。',
      bodyEn: 'We care about the quality and value of every single piece rather than the number of items we carry.',
    },
    {
      titleJa: 'Transparency（透明性）',
      titleEn: 'Transparency',
      bodyJa: '商品の状態や情報をできる限り正確にお伝えし、安心して購入できる環境を提供します。',
      bodyEn: 'We describe each item’s condition and details as accurately as possible so you can buy with peace of mind.',
    },
    {
      titleJa: 'Knowledge Sharing（知識の共有）',
      titleEn: 'Knowledge Sharing',
      bodyJa: '経験や情報を積極的に発信し、ヴィンテージ文化の理解を深めていきます。',
      bodyEn: 'We actively share our experience and information to deepen the understanding of vintage culture.',
    },
    {
      titleJa: 'Respect for History（歴史への敬意）',
      titleEn: 'Respect for History',
      bodyJa: 'ヴィンテージは単なる衣服ではなく、時代のストーリーを持つ存在だと考えています。',
      bodyEn: 'We believe vintage is not just clothing, but something that carries the story of its era.',
    },
    {
      titleJa: 'Trust（信頼）',
      titleEn: 'Trust',
      bodyJa: 'お客様との長期的な信頼関係を最も大切にしています。',
      bodyEn: 'Above all, we value long-term relationships of trust with our customers.',
    },
  ],
  promise: {
    bodyJa: doc(
      p('私たちは、知識と経験に基づき商品を厳選し、\nオリジナル性・状態・背景をできる限り正確に確認したうえでご紹介しています。'),
      p('ヴィンテージ市場では情報の不透明さが問題になることもありますが、\nお客様が安心して購入できるよう、誠実で透明性のある販売を心がけています。'),
      p({ b: '「買ってよかった」と思っていただける一着を届けること。' }, '\nそれが私たちの最も大切な責任です。'),
    ),
    bodyEn: doc(
      p('We select every item based on our knowledge and experience, and present it only after checking its originality, condition and background as accurately as possible.'),
      p('Information in the vintage market can sometimes be unclear, so we are committed to honest, transparent selling that lets you buy with confidence.'),
      p({ b: 'Delivering a piece you are glad you bought.' }, '\nThat is our most important responsibility.'),
    ),
  },
  knowledge: {
    bodyJa: doc(
      p('私たちは売買だけでなく、\nブログ', { b: '「Mili Talks」' }, 'を通してヴィンテージに関する知識や経験を共有しています。'),
      p('歴史やディテール、見分け方などを発信することで、\nヴィンテージ文化の理解を深め、より多くの人がこの世界を楽しめるよう貢献したいと考えています。'),
    ),
    bodyEn: doc(
      p('Beyond buying and selling, we share knowledge and experience about vintage through our blog ', { b: '“Mili Talks”' }, '.'),
      p('By writing about history, details and how to tell pieces apart, we hope to deepen the understanding of vintage culture and help more people enjoy this world.'),
    ),
  },
  contact: {
    headingJa: 'お問い合わせ',
    headingEn: 'Contact',
    bodyJa: doc(
      p('商品や買取に関するご質問は、お電話・メール・InstagramのDMからお気軽にお問い合わせください。'),
      p('電話番号：06-7164-6821 / 080-5959-2198\nメール：theambitionent@gmail.com\nInstagram：', { link: 'https://www.instagram.com/amb.storage/', text: '@amb.storage' }),
    ),
    bodyEn: doc(
      p('For questions about our items or selling to us, feel free to contact us by phone, email or Instagram DM.'),
      p('Phone: 06-7164-6821 / 080-5959-2198\nEmail: theambitionent@gmail.com\nInstagram: ', { link: 'https://www.instagram.com/amb.storage/', text: '@amb.storage' }),
    ),
  },
}

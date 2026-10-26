/**
 * Starter content for the Mili Talks blog home, mirroring https://www.amb-storage.com/s/stories
 * (Japanese copied from the live site; English translated for the bilingual API).
 */
/** Slug the CMS bootstrap gives the blog's landing page (story_settings.landing_page_id). */
export const MILI_TALKS_LANDING_SLUG = 'mili-talks'

export const isMiliTalksLanding = (page: { type: string; slug: string }) => page.type === 'LANDING' && page.slug === MILI_TALKS_LANDING_SLUG

export const MILI_TALKS_TEMPLATE = {
  titleJa: 'MILI TALKS',
  titleEn: 'MILI TALKS',
  intro: {
    headingJa: 'MILI TALKS',
    headingEn: 'MILI TALKS',
    introductionJa: [
      'Mili Talks は、ヴィンテージに関する知識や経験、そして私たちが現場で培ってきたリアルな視点を共有するためのブログです。',
      'ミリタリーやデニムをはじめとするヴィンテージアイテムの背景やディテール、ストーリーを掘り下げながら、これからヴィンテージの世界に触れる方にも分かりやすく情報を届けていきます。',
      'また、長年ヴィンテージを愛してきたコレクターや、同じ価値観を持つ人たちがつながる場所として、コミュニティを広げていくことも私たちの大切な目的の一つです。',
      '知識や経験を共有しながら、ヴィンテージの魅力をより深く理解できる場所へ。',
      'そしていつか、ヴィンテージに関する情報が集まる小さな「アーカイブ」のような存在になれたらと考えています。',
    ].join('\n\n'),
    introductionEn: [
      'Mili Talks is our blog for sharing knowledge and experience about vintage, along with the real-world perspective we have built up in the field.',
      'We dig into the background, details and stories of vintage items, starting with military and denim, and explain them clearly for people who are just discovering the world of vintage.',
      'Growing a community where long-time collectors and people who share our values can connect is another important goal for us.',
      'A place to understand the appeal of vintage more deeply by sharing knowledge and experience.',
      'And one day, we hope it can become a small “archive” where information about vintage comes together.',
    ].join('\n\n'),
    supportingTextJa: [
      '掲載している情報の多くは、さまざまな資料や参考文献、そして下記に記載するウェブサイト、ディーラー、ブランド、ショップ、コレクターの方々による知見や共有情報をもとに構成されています。',
      'それらを参考にしながら、Amb:STORAGEが独自にリサーチや検証を行い、情報を取捨選択したうえで、補足や編集を加えながら一つのコンテンツとしてまとめています。',
      'ヴィンテージという文化の性質上、同じテーマであってもさまざまな解釈や説が存在する場合があります。\nそれでも、ここで発信する内容が、ヴィンテージをより深く知るためのきっかけとなり、新たな視点や発見につながれば幸いです。',
    ].join('\n\n'),
    supportingTextEn: [
      'Much of the information we publish is built on a wide range of sources and references, and on the knowledge shared by the websites, dealers, brands, shops and collectors listed below.',
      'Using these as references, Amb:STORAGE carries out its own research and verification, selects the information, and adds notes and edits to bring it together as a single piece of content.',
      'Given the nature of vintage culture, there can be many interpretations and theories even on the same topic.\nEven so, we hope what we share here becomes a starting point for knowing vintage more deeply and leads to new perspectives and discoveries.',
    ].join('\n\n'),
  },
  /** One name per line; the live site's first column is headed "Special Thanks" (websites). */
  references: [
    {
      titleJa: 'Special Thanks',
      titleEn: 'Special Thanks',
      items: ['usmilitariaforum.com', 'heddels.com', 'vintageleatherjacket.org'],
    },
    {
      titleJa: 'Brand, Shop',
      titleEn: 'Brand, Shop',
      items: [
        'ACORN Buy&Sell Vintage',
        "EXTRA'S GARMENT Supply & Co.",
        'MASH CO. Ltd.',
        'mushroom',
        'THE NAVY-ism',
        'jollyjack',
        'BedfordCord',
        'Berberjin',
        'BIDSTITCH',
        "Marvin's Vintage",
        'G-1 STALKER',
        'Golden State Vintage',
      ],
    },
    {
      titleJa: 'Collector',
      titleEn: 'Collector',
      items: [
        'Aota Mituhiro',
        'Jiro Okawa',
        'Satoshi Kakui',
        'Okanineko',
        'Jon of LeatherJacketJawn',
        'Eric Maggiori',
        'Antinio Martinez',
        'Ed Anthony Stanford',
      ],
    },
  ],
  grid: { titleJa: '記事一覧', titleEn: 'All articles', limit: 24 },
}

import type { ReactNode } from 'react'
import { isSafeLink, textColorCss } from './rich-text'
import type { RichNode } from './types'

/** Same typography as richTextClassName in amb-storage-web's CmsSections. */
const WEBSITE_RICH_TEXT =
  'text-[15px] tracking-[0.1em] [&_a]:text-[#2C5F34] [&_a]:underline [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-[#2C5F34] md:[&_h1]:text-4xl [&_h2]:mb-4 [&_h2]:mt-2 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-[#2C5F34] md:[&_h2]:text-4xl [&_h3]:mb-3 [&_h3]:mt-2 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-[#2C5F34] md:[&_h3]:text-[1.75rem] [&_p]:mb-6 [&_p]:leading-[1.45] [&_p]:text-gray-900 [&_li]:mb-2 [&_li_p]:mb-0 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_blockquote]:border-l-2 [&_blockquote]:border-[#2C5F34] [&_blockquote]:pl-4'

/** Renders API rich text as React elements (no innerHTML); unknown nodes are skipped. */
export function RichTextView({ value, className }: { value: unknown; className?: string }) {
  if (!value || typeof value !== 'object') return null
  return <div className={className ?? WEBSITE_RICH_TEXT}>{renderChildren(value as RichNode)}</div>
}

function renderChildren(node: RichNode): ReactNode[] {
  return (node.content ?? []).map((child, index) => renderNode(child, index))
}

function renderNode(node: RichNode, key: number): ReactNode {
  switch (node.type) {
    case 'paragraph':
      // Browsers drop a trailing <br> and collapse empty paragraphs; the website keeps both.
      return (
        <p key={key}>
          {renderChildren(node)}
          {!node.content?.length || node.content.at(-1)?.type === 'hardBreak' ? <br /> : null}
        </p>
      )
    case 'heading':
      return Number(node.attrs?.level) === 3 ? <h3 key={key}>{renderChildren(node)}</h3> : <h2 key={key}>{renderChildren(node)}</h2>
    case 'bulletList':
      return <ul key={key}>{renderChildren(node)}</ul>
    case 'orderedList':
      return <ol key={key}>{renderChildren(node)}</ol>
    case 'listItem':
      return <li key={key}>{renderChildren(node)}</li>
    case 'blockquote':
      return <blockquote key={key}>{renderChildren(node)}</blockquote>
    case 'hardBreak':
      return <br key={key} />
    case 'text':
      return <Text key={key} node={node} />
    default:
      return null
  }
}

function Text({ node }: { node: RichNode }) {
  let element: ReactNode = node.text
  // Color goes innermost so <strong> and <a>, which have their own color, do not override it.
  const marks = [...(node.marks ?? [])].sort((a, b) => Number(b.type === 'textColor') - Number(a.type === 'textColor'))
  for (const mark of marks) {
    if (mark.type === 'bold') element = <strong>{element}</strong>
    if (mark.type === 'italic') element = <em>{element}</em>
    if (mark.type === 'textColor') element = <span style={{ color: textColorCss(mark.attrs?.color) }}>{element}</span>
    if (mark.type === 'link' && isSafeLink(mark.attrs?.href))
      element = <a href={mark.attrs.href as string} target="_blank" rel="noreferrer">{element}</a>
  }
  return <>{element}</>
}

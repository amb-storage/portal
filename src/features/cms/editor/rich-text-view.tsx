import type { ReactNode } from 'react'
import { isSafeLink, textColorCss, WEBSITE_RICH_TEXT } from './rich-text'
import type { RichNode } from './types'

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

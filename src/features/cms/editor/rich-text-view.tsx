import type { ReactNode } from 'react'
import { isSafeLink } from './rich-text'
import type { RichNode } from './types'

/** Renders API rich text as React elements (no innerHTML); unknown nodes are skipped. */
export function RichTextView({ value }: { value: unknown }) {
  if (!value || typeof value !== 'object') return null
  return <div className="grid gap-3 leading-relaxed">{renderChildren(value as RichNode)}</div>
}

function renderChildren(node: RichNode): ReactNode[] {
  return (node.content ?? []).map((child, index) => renderNode(child, index))
}

function renderNode(node: RichNode, key: number): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{renderChildren(node)}</p>
    case 'heading': {
      const level = Number(node.attrs?.level) || 2
      const className = level === 1 ? 'text-2xl font-semibold' : level === 2 ? 'text-xl font-semibold' : 'text-lg font-semibold'
      return level === 1 ? <h1 key={key} className={className}>{renderChildren(node)}</h1> : level === 2 ? <h2 key={key} className={className}>{renderChildren(node)}</h2> : <h3 key={key} className={className}>{renderChildren(node)}</h3>
    }
    case 'bulletList':
      return <ul key={key} className="list-disc pl-6">{renderChildren(node)}</ul>
    case 'orderedList':
      return <ol key={key} className="list-decimal pl-6">{renderChildren(node)}</ol>
    case 'listItem':
      return <li key={key}>{renderChildren(node)}</li>
    case 'blockquote':
      return <blockquote key={key} className="border-l-2 pl-4 text-muted-foreground">{renderChildren(node)}</blockquote>
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
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') element = <strong>{element}</strong>
    if (mark.type === 'italic') element = <em>{element}</em>
    if (mark.type === 'link' && isSafeLink(mark.attrs?.href))
      element = <a href={mark.attrs.href as string} target="_blank" rel="noreferrer" className="text-primary underline">{element}</a>
  }
  return <>{element}</>
}

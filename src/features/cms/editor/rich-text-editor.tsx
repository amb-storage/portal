import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Blockquote from '@tiptap/extension-blockquote'
import HardBreak from '@tiptap/extension-hard-break'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Placeholder, UndoRedo } from '@tiptap/extensions'
import { Bold as BoldIcon, Heading2, Heading3, Italic as ItalicIcon, Link2, List, ListOrdered, Quote, Redo2, Undo2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { isSafeLink, normalizeRichText } from './rich-text'
import type { RichNode } from './types'

/** Only the node and mark types the API's rich-text schema allows. */
const extensions = (placeholder: string) => [
  Document,
  Paragraph,
  Text,
  Heading.configure({ levels: [1, 2, 3] }),
  Bold,
  Italic,
  Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https', isAllowedUri: (url) => isSafeLink(url) }),
  Blockquote,
  HardBreak,
  BulletList,
  OrderedList,
  ListItem,
  UndoRedo,
  Placeholder.configure({ placeholder }),
]

interface RichTextEditorProps {
  value: RichNode
  onChange: (value: RichNode) => void
  placeholder?: string
  readOnly?: boolean
}

/** Uncontrolled after mount (key it by section id); emits API-safe JSON on every change. */
export function RichTextEditor({ value, onChange, placeholder = 'Viết nội dung…', readOnly }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: extensions(placeholder),
    content: value,
    editable: !readOnly,
    immediatelyRender: true,
    onUpdate: ({ editor: current }) => {
      const json = normalizeRichText(current.getJSON() as RichNode)
      if (json) onChange(json)
    },
    editorProps: {
      attributes: {
        class:
          'min-h-32 px-3 py-2 text-sm outline-none [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_p]:my-1.5 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
      },
    },
  })

  return (
    <div className="overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring/40">
      {readOnly ? null : <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      h2: current.isActive('heading', { level: 2 }),
      h3: current.isActive('heading', { level: 3 }),
      bullet: current.isActive('bulletList'),
      ordered: current.isActive('orderedList'),
      quote: current.isActive('blockquote'),
      link: current.isActive('link'),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  })
  const chain = () => editor.chain().focus()

  const editLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const href = window.prompt('Nhập liên kết (bắt đầu bằng / hoặc https://). Để trống để bỏ link.', previous ?? 'https://')
    if (href === null) return
    if (href.trim() === '') return void chain().extendMarkRange('link').unsetLink().run()
    if (!isSafeLink(href.trim())) return void window.alert('Chỉ chấp nhận đường dẫn bắt đầu bằng / hoặc https://')
    chain().extendMarkRange('link').setLink({ href: href.trim() }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1" role="toolbar" aria-label="Định dạng chữ">
      <Tool label="Đậm (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()}><BoldIcon /></Tool>
      <Tool label="Nghiêng (Ctrl+I)" active={state.italic} onClick={() => chain().toggleItalic().run()}><ItalicIcon /></Tool>
      <Divider />
      <Tool label="Tiêu đề lớn" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 /></Tool>
      <Tool label="Tiêu đề nhỏ" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 /></Tool>
      <Divider />
      <Tool label="Danh sách chấm" active={state.bullet} onClick={() => chain().toggleBulletList().run()}><List /></Tool>
      <Tool label="Danh sách số" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}><ListOrdered /></Tool>
      <Tool label="Trích dẫn" active={state.quote} onClick={() => chain().toggleBlockquote().run()}><Quote /></Tool>
      <Tool label="Chèn / sửa link" active={state.link} onClick={editLink}><Link2 /></Tool>
      <Divider />
      <Tool label="Hoàn tác (Ctrl+Z)" disabled={!state.canUndo} onClick={() => chain().undo().run()}><Undo2 /></Tool>
      <Tool label="Làm lại" disabled={!state.canRedo} onClick={() => chain().redo().run()}><Redo2 /></Tool>
    </div>
  )
}

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-40 [&_svg]:size-4',
        active && 'bg-background text-foreground shadow-xs',
      )}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />

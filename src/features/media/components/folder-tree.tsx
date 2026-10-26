import { Folder, FolderOpen, Images, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { folderName, isInFolder, ROOT_FOLDER } from '../types'

interface FolderTreeProps {
  /** Every folder path including parents, sorted. */
  folders: string[]
  /** undefined = all images, ROOT_FOLDER = images without a folder. */
  current: string | undefined
  onSelect: (folder: string | undefined) => void
}

const depthOf = (path: string) => path.split('/').length - 1

export function FolderTree({ folders, current, onSelect }: FolderTreeProps) {
  // Children only show under an open branch, so long trees stay short.
  const visible = folders.filter((path) => depthOf(path) === 0 || (current !== undefined && current !== ROOT_FOLDER && isInFolder(current, path.slice(0, path.lastIndexOf('/')))))
  const item = (key: string, label: string, icon: React.ReactNode, value: string | undefined, depth = 0) => {
    const active = current === value
    return (
      <li key={key} className="min-w-0">
        <button
          type="button"
          title={value && value !== ROOT_FOLDER ? value : label}
          onClick={() => onSelect(value)}
          aria-current={active ? 'page' : undefined}
          style={{ paddingLeft: `${0.5 + depth * 0.9}rem` }}
          className={cn(
            'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            active && 'bg-muted font-medium text-foreground',
          )}
        >
          {icon}
          <span className="min-w-0 flex-1 truncate">{label}</span>
        </button>
      </li>
    )
  }

  return (
    <nav aria-label="Thư mục ảnh" className="min-w-0 rounded-xl border bg-card p-2">
      <ul className="grid gap-0.5">
        {item('all', 'Tất cả ảnh', <Images className="size-4 shrink-0" />, undefined)}
        {item('root', 'Chưa phân thư mục', <Inbox className="size-4 shrink-0" />, ROOT_FOLDER)}
      </ul>
      {visible.length > 0 ? (
        <>
          <p className="mt-3 mb-1 px-2 text-xs font-medium text-muted-foreground">Thư mục</p>
          <ul className="grid gap-0.5">
            {visible.map((path) =>
              item(
                path,
                folderName(path),
                current !== undefined && isInFolder(current, path) ? <FolderOpen className="size-4 shrink-0" /> : <Folder className="size-4 shrink-0" />,
                path,
                depthOf(path),
              ),
            )}
          </ul>
        </>
      ) : (
        <p className="mt-3 px-2 pb-1 text-xs text-muted-foreground">Chưa có thư mục. Nhập tên thư mục ở ô “Thư mục” khi tải ảnh lên để tạo.</p>
      )}
    </nav>
  )
}

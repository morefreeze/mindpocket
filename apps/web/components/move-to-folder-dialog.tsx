"use client"

import { Check, FolderMinus, Loader2, Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useFolderStore } from "@/stores"

interface MoveToFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookmarkId: string
  currentFolderId: string | null
  onMoved: (folderId: string | null, folderName: string | null, folderEmoji: string | null) => void
}

export function MoveToFolderDialog({
  open,
  onOpenChange,
  bookmarkId,
  currentFolderId,
  onMoved,
}: MoveToFolderDialogProps) {
  const t = useT()
  const { folders, isLoading, fetchFolders, createFolder } = useFolderStore()
  const [moving, setMoving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      fetchFolders()
      setShowNewFolder(false)
      setNewFolderName("")
    }
  }, [open, fetchFolders])

  useEffect(() => {
    if (showNewFolder) {
      inputRef.current?.focus()
    }
  }, [showNewFolder])

  const handleMove = async (folderId: string | null) => {
    if (folderId === currentFolderId) {
      return
    }
    setMoving(true)
    try {
      const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      })
      if (res.ok) {
        const folder = folderId ? folders.find((f) => f.id === folderId) : null
        onMoved(folderId, folder?.name ?? null, folder?.emoji ?? null)
        onOpenChange(false)
      }
    } finally {
      setMoving(false)
    }
  }

  const handleCreateFolder = async () => {
    const name = newFolderName.trim()
    if (!name || creating) {
      return
    }
    setCreating(true)
    try {
      const created = await createFolder(name)
      if (created) {
        setNewFolderName("")
        setShowNewFolder(false)
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.bookmark.moveToFolder}</DialogTitle>
          <DialogDescription className="sr-only">{t.bookmark.moveToFolder}</DialogDescription>
        </DialogHeader>

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Remove from folder option */}
              {currentFolderId && (
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  disabled={moving}
                  onClick={() => handleMove(null)}
                  type="button"
                >
                  <FolderMinus className="size-4 text-muted-foreground" />
                  <span>{t.bookmark.removeFromFolder}</span>
                </button>
              )}

              {/* Folder list */}
              {folders.length === 0 && !isLoading && (
                <p className="py-4 text-center text-muted-foreground text-sm">
                  {t.bookmark.noFolders}
                </p>
              )}
              {folders.map((f) => {
                const isCurrent = f.id === currentFolderId
                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                      isCurrent && "bg-muted"
                    )}
                    disabled={moving}
                    key={f.id}
                    onClick={() => handleMove(f.id)}
                    type="button"
                  >
                    <span className="text-base">{f.emoji || "📁"}</span>
                    <span className="flex-1 truncate">{f.name}</span>
                    {isCurrent && <Check className="size-4 text-primary" />}
                  </button>
                )
              })}
            </>
          )}
        </div>

        {/* New folder inline input */}
        {showNewFolder ? (
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              disabled={creating}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder()
                }
                if (e.key === "Escape") {
                  setShowNewFolder(false)
                }
              }}
              placeholder={t.bookmark.newFolderPlaceholder}
              ref={inputRef}
              value={newFolderName}
            />
            <Button
              disabled={!newFolderName.trim() || creating}
              onClick={handleCreateFolder}
              size="sm"
            >
              {creating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => setShowNewFolder(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="mr-1.5 size-3.5" />
            {t.bookmark.newFolder}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

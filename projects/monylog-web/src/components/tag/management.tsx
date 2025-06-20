"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Tag as TagIcon, Settings } from "lucide-react"
import { useTags } from "@/hooks/use-tags"
import { toast } from "@/hooks/use-toast"

export function TagManagement() {
  const { tags, addTag, deleteTag } = useTags()
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTag.trim()) {
      toast({ title: "태그 추가 실패", description: "태그 이름을 입력해주세요.", variant: "destructive" })
      return
    }

    if (tags.includes(newTag.trim())) {
      toast({ title: "태그 추가 실패", description: "이미 존재하는 태그입니다.", variant: "destructive" })
      return
    }

    addTag(newTag.trim())
    setNewTag("")
    toast({ title: "태그 추가", description: "태그가 추가되었습니다.", variant: "default" })
  }

  const handleDeleteTag = (tagName: string) => {
    // window.confirm 대체 필요: 추후 커스텀 다이얼로그 적용 가능
    toast({ title: "태그 삭제", description: `"${tagName}" 태그가 삭제되었습니다.`, variant: "default" })
    deleteTag(tagName)
  }

  const handleOpenDialog = () => {
    setIsOpen(true)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-lg font-medium">태그 관리</h4>
        <p className="text-sm text-muted-foreground">거래 분류에 사용할 태그를 관리하세요</p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleOpenDialog}>
            <Settings className="h-4 w-4" />
            태그 관리
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              태그 관리
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 새 태그 추가 폼 */}
            <div className="space-y-3">
              <Label htmlFor="new-tag">새 태그 추가</Label>
              <form onSubmit={handleAddTag} className="flex gap-2">
                <Input
                  id="new-tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="예: 식비, 교통비, 쇼핑"
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newTag.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* 현재 태그 목록 */}
            <div className="space-y-3">
              <Label>현재 태그 ({tags.length}개)</Label>
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">등록된 태그가 없습니다.</p>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium">{tag}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTag(tag)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">💡 참고사항</p>
              <p>
                거래 입력 시 태그는 자동으로 분석하여 제안합니다. 확인 단계에서 필요시 수정할 수 있습니다.
              </p>
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-end">
              <Button onClick={() => setIsOpen(false)} variant="outline">
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

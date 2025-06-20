"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Settings } from "lucide-react"
import { useTags } from "@/hooks/use-tags"
import { toast } from "@/hooks/use-toast"

export function SimpleTagManager() {
  const { tags, addTag, deleteTag } = useTags()
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast({ title: "태그 추가 실패", description: "태그 이름을 입력해주세요.", variant: "destructive" })
      return
    }

    if (tags.includes(newTag.trim())) {
      toast({ title: "태그 추가 실패", description: "이미 존재하는 태그입니다.", variant: "destructive" })
      return
    }

    const success = addTag(newTag.trim())
    if (success) {
      setNewTag("")
      toast({ title: "태그 추가", description: "태그가 추가되었습니다.", variant: "default" })
    }
  }

  const handleDeleteTag = (tagName: string) => {
    toast({ title: "태그 삭제", description: `"${tagName}" 태그가 삭제되었습니다.`, variant: "default" })
    deleteTag(tagName)
  }

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium">태그 관리</h4>
          <p className="text-sm text-muted-foreground">거래 분류에 사용할 태그를 관리하세요</p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            console.log("태그 관리 버튼 클릭됨")
            setIsOpen(true)
          }}
        >
          <Settings className="h-4 w-4" />
          태그 관리
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>태그 관리</span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 새 태그 추가 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">새 태그 추가</label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="예: 식비, 교통비, 쇼핑"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddTag()
                }
              }}
            />
            <Button onClick={handleAddTag} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 태그 목록 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">현재 태그 ({tags.length}개)</label>
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">등록된 태그가 없습니다.</p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{tag}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 참고사항</p>
          <p>거래 입력 시 태그는 자동으로 분석하여 제안합니다. 확인 단계에서 필요시 수정할 수 있습니다.</p>
        </div>
      </CardContent>
    </Card>
  )
}

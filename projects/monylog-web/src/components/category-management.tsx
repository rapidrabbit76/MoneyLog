"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Tag, Settings } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"

export function CategoryManagement() {
  const { categories, addCategory, deleteCategory } = useCategories()
  const [isOpen, setIsOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategory.trim()) {
      alert("카테고리 이름을 입력해주세요.")
      return
    }

    if (categories.includes(newCategory.trim())) {
      alert("이미 존재하는 카테고리입니다.")
      return
    }

    addCategory(newCategory.trim())
    setNewCategory("")
    alert("카테고리가 추가되었습니다.")
  }

  const handleDeleteCategory = (categoryName: string) => {
    if (window.confirm(`"${categoryName}" 카테고리를 삭제하시겠습니까?`)) {
      deleteCategory(categoryName)
      alert("카테고리가 삭제되었습니다.")
    }
  }

  const handleOpenDialog = () => {
    console.log("카테고리 관리 버튼 클릭됨")
    setIsOpen(true)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-lg font-medium">카테고리 관리</h4>
        <p className="text-sm text-muted-foreground">거래 분류에 사용할 카테고리를 관리하세요</p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleOpenDialog}>
            <Settings className="h-4 w-4" />
            카테고리 관리
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              카테고리 관리
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 새 카테고리 추가 폼 */}
            <div className="space-y-3">
              <Label htmlFor="new-category">새 카테고리 추가</Label>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <Input
                  id="new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="예: 식비, 교통비, 쇼핑"
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newCategory.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* 현재 카테고리 목록 */}
            <div className="space-y-3">
              <Label>현재 카테고리 ({categories.length}개)</Label>
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">등록된 카테고리가 없습니다.</p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium">{category}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
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
              <p>
                거래 입력 시 카테고리와 수입/지출 분류는 자동으로 분석하여 제안합니다. 확인 단계에서 필요시 수정할 수
                있습니다.
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

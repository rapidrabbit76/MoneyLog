"use client"
import { useLocalStorage } from "@/hooks/use-local-storage"

// 기본 카테고리 데이터
const DEFAULT_CATEGORIES: string[] = [
  "식비",
  "교통",
  "생활용품",
  "의료",
  "쇼핑",
  "문화생활",
  "교육",
  "급여",
  "용돈",
  "기타수입",
  "기타",
]

export function useCategories() {
  const [categories, setCategories] = useLocalStorage<string[]>("categories", DEFAULT_CATEGORIES)

  const addCategory = (categoryName: string) => {
    const trimmedName = categoryName.trim()
    if (trimmedName && !categories.includes(trimmedName)) {
      const newCategories = [...categories, trimmedName]
      setCategories(newCategories)
      console.log("카테고리 추가됨:", trimmedName)
      console.log("현재 카테고리 목록:", newCategories)
      return true
    }
    return false
  }

  const updateCategory = (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim()
    const index = categories.indexOf(oldName)
    if (index !== -1 && trimmedNewName && !categories.includes(trimmedNewName)) {
      const updatedCategories = [...categories]
      updatedCategories[index] = trimmedNewName
      setCategories(updatedCategories)
      console.log("카테고리 수정됨:", oldName, "->", trimmedNewName)
      return true
    }
    return false
  }

  const deleteCategory = (categoryName: string) => {
    const filteredCategories = categories.filter((cat) => cat !== categoryName)
    setCategories(filteredCategories)
    console.log("카테고리 삭제됨:", categoryName)
    console.log("현재 카테고리 목록:", filteredCategories)
  }

  console.log("useCategories 호출됨, 현재 카테고리:", categories)

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}

"use client";
import { useLocalStorage } from "@/hooks/use-local-storage";

// 기본 태그 데이터
const DEFAULT_TAGS: string[] = [
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
];

export function useTags() {
  const [tags, setTags] = useLocalStorage<string[]>("tags", DEFAULT_TAGS);

  const addTag = (tagName: string) => {
    const trimmedName = tagName.trim();
    if (trimmedName && !tags.includes(trimmedName)) {
      const newTags = [...tags, trimmedName];
      setTags(newTags);
      console.log("태그 추가됨:", trimmedName);
      console.log("현재 태그 목록:", newTags);
      return true;
    }
    return false;
  };

  const updateTag = (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    const index = tags.indexOf(oldName);
    if (index !== -1 && trimmedNewName && !tags.includes(trimmedNewName)) {
      const updatedTags = [...tags];
      updatedTags[index] = trimmedNewName;
      setTags(updatedTags);
      console.log("태그 수정됨:", oldName, "->", trimmedNewName);
      return true;
    }
    return false;
  };

  const deleteTag = (tagName: string) => {
    const filteredTags = tags.filter((t) => t !== tagName);
    setTags(filteredTags);
    console.log("태그 삭제됨:", tagName);
    console.log("현재 태그 목록:", filteredTags);
  };

  console.log("useTags 호출됨, 현재 태그:", tags);

  return {
    tags,
    addTag,
    updateTag,
    deleteTag,
  };
}

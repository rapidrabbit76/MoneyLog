import { create } from "zustand";
import {
    getTags,
    createTag as apiCreateTag,
    updateTag as apiUpdateTag,
    deleteTag as apiDeleteTags,
    ExpenseTag,
    CreateExpenseTagRequest,
} from "@/lib/api/tags";

interface TagStoreState {
    tags: ExpenseTag[];
    loading: boolean;
    error: string | null;
    fetchTags: () => Promise<ExpenseTag[]>;
    createTag: (payload: CreateExpenseTagRequest) => Promise<void>;
    updateTag: (id: string, payload: { name: string }) => Promise<void>;
    deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagStoreState>((set) => ({
    tags: [],
    loading: false,
    error: null,

    fetchTags: async () => {
        set({ loading: true, error: null });
        try {
            const tags = await getTags();
            set({ tags, loading: false });
            return tags;
        } catch (e) {
            set({ error: "태그 목록을 불러오지 못했습니다.", loading: false });
            return [];
        }
    },

    createTag: async (payload) => {
        set({ loading: true, error: null });
        try {
            await apiCreateTag(payload);
            set(() => ({ loading: false }));
        } catch (e) {
            set({ error: "태그 생성 실패", loading: false });
        }
    },

    updateTag: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const tag = await apiUpdateTag(id, payload);
            if (tag) {
                set((state) => ({
                    tags: state.tags.map((t) => (t.id === id ? tag : t)),
                    loading: false,
                }));
            } else {
                set({ error: "태그 수정 실패", loading: false });
            }
        } catch (e) {
            set({ error: "태그 수정 실패", loading: false });
        }
    },

    deleteTag: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const ok = await apiDeleteTags(id);
            if (ok) {
                set((state) => ({
                    tags: state.tags.filter((t) => t.id !== id),
                    loading: false,
                }));
            } else {
                set({ error: "태그 삭제 실패", loading: false });
            }
        } catch (e) {
            set({ error: "태그 삭제 실패", loading: false });
        }
    },
}));

// 사용 예시 (컴포넌트에서)
// const { tags, fetchTags, createTag, updateTag, deleteTags, loading, error } = useTagStore();

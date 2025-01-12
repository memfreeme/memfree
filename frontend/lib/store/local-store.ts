import { create } from 'zustand';
import { User } from '@/lib/types';
import { GPT_4o_MIMI } from '@/lib/llm/model';
import { persist } from 'zustand/middleware';

interface ProfileState {
    profile: string;
    setProfile: (content: string) => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            profile: '',
            setProfile: (content: string) => set({ profile: content }),
        }),
        {
            name: 'profile-storage',
        },
    ),
);

interface UIState {
    isSearch: boolean;
    isShadcnUI: boolean;
    showMindMap: boolean;
    setIsSearch: (isSearch: boolean) => void;
    setIsShadcnUI: (isShadcnUI: boolean) => void;
    setShowMindMap: (showMindMap: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isSearch: true,
            isShadcnUI: true,
            showMindMap: false,
            setIsSearch: (search: boolean) => set({ isSearch: search }),
            setIsShadcnUI: (shadcnUI: boolean) => set({ isShadcnUI: shadcnUI }),
            setShowMindMap: (showMindMap: boolean) => set({ showMindMap }),
        }),
        {
            name: 'UI-config',
        },
    ),
);

interface ConfigState {
    model: string;
    source: string;
    questionLanguage: string;
    answerLanguage: string;
    setModel: (model: string) => void;
    setSource: (source: string) => void;
    setQuestionLanguage: (language: string) => void;
    setAnswerLanguage: (language: string) => void;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            model: GPT_4o_MIMI,
            source: 'all',
            questionLanguage: 'auto',
            answerLanguage: 'auto',
            setModel: (model: string) => set({ model }),
            setSource: (source: string) => set({ source }),
            setQuestionLanguage: (language: string) => set({ questionLanguage: language }),
            setAnswerLanguage: (language: string) => set({ answerLanguage: language }),
        }),
        {
            name: 'config-storage',
        },
    ),
);

export const useModelStore = () =>
    useConfigStore((state) => ({
        model: state.model,
        setModel: state.setModel,
    }));

export const useSourceStore = () =>
    useConfigStore((state) => ({
        source: state.source,
        setSource: state.setSource,
    }));

type UserState = {
    user: User | null;
    setUser: (user: User) => void;
};

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user: User) => set({ user }),
}));

interface IndexState {
    isIndexed: boolean;
    isIndexing: boolean;
    setIsIndexed: (status: boolean) => void;
    setIsIndexing: (status: boolean) => void;
}

export const useIndexStore = create<IndexState>()(
    persist(
        (set) => ({
            isIndexed: false,
            isIndexing: false,
            setIsIndexed: (status: boolean) => set({ isIndexed: status }),
            setIsIndexing: (status: boolean) => set({ isIndexing: status }),
        }),
        {
            name: 'his-index-storage',
        },
    ),
);

interface SearchState {
    isTyping: boolean;
    isCompressHistory: boolean;
    isSearching: boolean;
    setIsSearching: (status: boolean) => void;
    setIsTyping: (status: boolean) => void;
    setIsCompressHistory: (status: boolean) => void;
}

export const useSearchState = create<SearchState>()((set) => ({
    isTyping: false,
    isCompressHistory: false,
    isSearching: false,
    setIsSearching: (status: boolean) => set({ isSearching: status }),
    setIsTyping: (status: boolean) => set({ isTyping: status }),
    setIsCompressHistory: (status: boolean) => set({ isCompressHistory: status }),
}));

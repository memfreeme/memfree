'use client';

import { HeroLanding } from '@/components/sections/hero-landing';
import SearchBar from '@/components/Search';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleHelp, MessageCircleMore, Search } from 'lucide-react';
import { useModeStore } from '@/lib/store';

export default function IndexPage() {
    const router = useRouter();

    const setMode = useModeStore((state) => state.setMode);

    const handleSearch = async (key: string) => {
        if (!key) {
            return;
        }

        if (key.trim() !== '') {
            router.push('/search?q=' + key);
            return;
        }
    };

    const handleTabChange = (value) => {
        console.log('handleTabChange: ', value);
        setMode(value);
        console.log('current tab:', value);
    };

    return (
        <>
            <HeroLanding />
            <SearchBar handleSearch={handleSearch} />
            <div className="flex justify-center py-4">
                <Tabs
                    defaultValue="search"
                    className="w-[360px]"
                    onValueChange={handleTabChange}
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="search">
                            <div className="flex items-center">
                                <Search size={16} className="mr-1"></Search>
                                <span>Search</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="ask">
                            <div className="flex items-center">
                                <CircleHelp
                                    size={16}
                                    className="mr-1"
                                ></CircleHelp>
                                <span>Ask</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="chat">
                            <div className="flex items-center">
                                <MessageCircleMore
                                    size={16}
                                    className="mr-1"
                                ></MessageCircleMore>
                                <span>Chat</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </>
    );
}

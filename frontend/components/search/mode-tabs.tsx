'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleHelp, MessageCircleMore, Search } from 'lucide-react';
import { useModeStore } from '@/lib/store';

interface ModeTabsProps {
    showContent: boolean;
}

const ModeTabs: React.FC<ModeTabsProps> = React.memo(({ showContent }) => {
    const { mode, setMode, initMode } = useModeStore((state) => ({
        mode: state.mode,
        setMode: state.setMode,
        initMode: state.initMode,
    }));

    React.useEffect(() => {
        const initialMode = initMode();
        if (initialMode && initialMode !== mode) {
            setMode(initialMode);
        }
    }, [mode, initMode, setMode]);

    const handleTabChange = (value) => {
        setMode(value);
    };

    return (
        <div className="flex justify-center p-4 mx-auto">
            <Tabs
                defaultValue={mode}
                value={mode}
                onValueChange={handleTabChange}
            >
                <TabsList className="grid w-full mx-auto grid-cols-3">
                    <TabsTrigger value="search">
                        <div className="flex items-center">
                            <Search size={16} className="mr-1"></Search>
                            <span>Search</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="ask">
                        <div className="flex items-center">
                            <CircleHelp size={16} className="mr-1"></CircleHelp>
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
                {showContent && (
                    <>
                        <TabsContent value="search">
                            <div className="w-full mx-auto my-6 p-4 border border-solid rounded-xl">
                                <article className="prose w-full max-w-full">
                                    <ul>
                                        <li>
                                            Quickly Access Relevant Content from
                                            Your Personal Knowledge Base.
                                        </li>
                                        <li>Quickly Obtain Webpage Links.</li>
                                    </ul>
                                </article>
                            </div>
                        </TabsContent>
                        <TabsContent value="ask">
                            <div className="w-full mx-auto my-6 p-4 border border-solid rounded-xl">
                                <article className="prose w-full max-w-full">
                                    <ul>
                                        <li>
                                            Get Detailed, Accurate, and
                                            Up-to-Date Answers.
                                        </li>
                                        <li>
                                            Ask Questions Based on Your Personal
                                            Knowledge Base.
                                        </li>
                                    </ul>
                                </article>
                            </div>
                        </TabsContent>
                        <TabsContent value="chat">
                            <div className="w-full mx-auto my-6 p-4 border border-solid rounded-xl">
                                <article className="prose w-full max-w-full">
                                    <ul>
                                        <li>
                                            Personal Assistant: Coding, Writing,
                                            Brainstorming, Translation, and
                                            More.
                                        </li>
                                        <li>
                                            Questions on History, Culture,
                                            Science, and General Knowledge.
                                        </li>
                                    </ul>
                                </article>
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
});

ModeTabs.displayName = 'ModeTabs';

export default ModeTabs;

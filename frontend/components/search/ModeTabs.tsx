import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleHelp, MessageCircleMore, Search } from 'lucide-react';
import { useModeStore } from '@/lib/store';

const ModeTabs = React.memo(() => {
    const { mode, setMode, initMode } = useModeStore((state) => ({
        mode: state.mode,
        setMode: state.setMode,
        initMode: state.initMode,
    }));

    React.useEffect(() => {
        const initialMode = initMode();
        console.log('initialMode:', initialMode, ' mode: ', mode);
        if (initialMode && initialMode !== mode) {
            setMode(initialMode);
        }
    }, [mode, initMode, setMode]);

    const handleTabChange = (value) => {
        console.log('handleTabChange: ', value);
        setMode(value);
        console.log('handleTabChange current tab:', value);
    };

    return (
        <div className="flex justify-center py-4">
            <Tabs
                defaultValue={mode}
                value={mode}
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
            </Tabs>
        </div>
    );
});

export default ModeTabs;

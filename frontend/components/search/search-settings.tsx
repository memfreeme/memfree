import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AnswerLanguageSelection, QuestionLanguageSelection } from '@/components/search/language-selection';
import { useUIStore } from '@/lib/store/local-store';
import { BookA, BookKey, Map } from 'lucide-react';

interface SearchSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchSettingsDialog({ open, onOpenChange }: SearchSettingsProps) {
    const { showMindMap, setShowMindMap } = useUIStore();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl mx-auto">
                <DialogHeader>
                    <DialogTitle>MemFree Search Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-8 py-4">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                            <BookA className="h-4 w-4" />
                            <Label className="text-sm font-bold">Translate question to target language when web search </Label>
                        </div>
                        <QuestionLanguageSelection className="w-1/3" />
                    </div>

                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                            <BookKey className="h-4 w-4" />
                            <Label className="text-sm font-bold">Answer Language</Label>
                        </div>
                        <AnswerLanguageSelection className="w-1/3" />
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-2">
                            <Map className="h-4 w-4" />
                            <Label className="text-sm font-bold">Mind Map</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="mindmap" checked={showMindMap} onCheckedChange={setShowMindMap} />
                            <Label htmlFor="mindmap">Show Mind Map</Label>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

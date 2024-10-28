import { Icons } from '@/components/shared/icons';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useSearchStore } from '@/lib/store/local-history';
import IconButton from '@/components/layout/icon-button';

interface QuestionSectionProps {
    mesageId: string;
    content: string;
    isShared?: boolean;
    onContentChange: (newContent: string) => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = React.memo(({ mesageId, content, onContentChange, isShared }) => {
    const getTextSizeClass = (text: string) => {
        const length = text.length;
        if (length < 20) return 'text-lg font-medium';
        if (length < 40) return 'text-base font-normal';
        return 'text-sm font-normal';
    };
    const textSizeClass = getTextSizeClass(content);

    const { hasCopied, copyToClipboard } = useCopyToClipboard();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    const handleEditClick = () => {
        setEditedContent(content);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        onContentChange(editedContent);
        setIsEditModalOpen(false);
    };
    const t = useTranslations('Question');

    const { deleteMessage } = useSearchStore();

    return (
        <>
            <div className="group/question relative flex flex-col w-full">
                <div className="relative flex w-full items-start p-4 my-4 rounded-xl bg-violet-50 dark:bg-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors">
                    <h2 className={`text-gray-800 dark:text-gray-50 whitespace-pre-wrap ${textSizeClass}`} dir="auto">
                        {content}
                    </h2>
                </div>
                {!isShared && (
                    <div className="flex space-x-4 opacity-0 group-hover/question:opacity-100">
                        <IconButton onClick={() => copyToClipboard(content)} tooltipText="Copy">
                            {hasCopied ? <Icons.check className="text-primary" /> : <Icons.copy className="text-primary" />}
                        </IconButton>
                        <IconButton onClick={handleEditClick} tooltipText="Edit">
                            <Pencil className="text-primary " />
                        </IconButton>
                        <IconButton onClick={() => deleteMessage(mesageId)} tooltipText="Delete">
                            <Trash2 className="text-primary " />
                        </IconButton>
                    </div>
                )}
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{t('title')}</DialogTitle>
                    </DialogHeader>
                    <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="min-h-[200px]" />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="md:mr-4 rounded-xl my-4 md:my-0"
                            onClick={() => setIsEditModalOpen(false)}
                            aria-label={t('Cancel')}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button className="rounded-xl" onClick={handleSaveEdit} aria-label={t('Search')}>
                            {t('Search')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});

QuestionSection.displayName = 'QuestionSection';
export default QuestionSection;

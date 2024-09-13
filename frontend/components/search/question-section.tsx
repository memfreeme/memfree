import { Icons } from '@/components/shared/icons';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface QuestionSectionProps {
    content: string;
    onContentChange: (newContent: string) => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = React.memo(({ content, onContentChange }) => {
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

    return (
        <>
            <div
                className="group/question relative flex w-full items-start space-x-2 p-4 my-4 rounded-xl bg-violet-50 dark:bg-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                dir="auto"
            >
                <Icons.question className="text-primary size-4 dark:text-gray-50 mt-1" />
                <div className="grow">
                    <h2 className={`text-gray-800 dark:text-gray-50 whitespace-pre-wrap ${textSizeClass}`}>{content}</h2>
                </div>
                <div className="absolute top-2 right-2 flex space-x-4 transition-opacity">
                    <button onClick={handleEditClick} aria-label="Edit">
                        <Pencil className="size-4 text-primary" />
                    </button>
                    <button onClick={() => copyToClipboard(content)} aria-label="Copy">
                        {hasCopied ? <Icons.check className="size-4 text-primary" /> : <Icons.copy className="size-4 text-primary" />}
                    </button>
                </div>
            </div>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{t('title')}</DialogTitle>
                    </DialogHeader>
                    <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="min-h-[200px]" />
                    <DialogFooter>
                        <Button variant="outline" className="md:mr-4 rounded-xl my-4 md:my-0" onClick={() => setIsEditModalOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button className="rounded-xl" onClick={handleSaveEdit}>
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

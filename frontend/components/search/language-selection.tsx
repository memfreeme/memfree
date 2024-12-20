import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { useConfigStore } from '@/lib/store/local-store';

type Language = {
    name: string;
    value: string;
};

type LanguageSelectionProps = {
    type: 'question' | 'answer';
    className?: string;
};

const LanguageItem: React.FC<{ language: Language }> = ({ language }) => (
    <SelectItem key={language.value} value={language.value} className="w-full p-2 block">
        <div className="flex w-full justify-between">
            <span className="text-md mr-2">{language.name}</span>
        </div>
    </SelectItem>
);

export function LanguageSelection({ type, className }: LanguageSelectionProps) {
    const languageMap: Record<string, Language> = {
        auto: {
            name: type === 'question' ? 'Default' : 'Auto',
            value: 'auto',
        },
        en: {
            name: 'English',
            value: 'en',
        },
        zh: {
            name: '中文',
            value: 'zh',
        },
        de: {
            name: 'Deutsch',
            value: 'de',
        },
        fr: {
            name: 'Français',
            value: 'fr',
        },
        es: {
            name: 'Español',
            value: 'es',
        },
        ja: {
            name: '日本語',
            value: 'ja',
        },
        ar: {
            name: 'العربية',
            value: 'ar',
        },
    };

    const { questionLanguage, answerLanguage, setQuestionLanguage, setAnswerLanguage } = useConfigStore();

    const currentLanguage = type === 'question' ? questionLanguage : answerLanguage;
    const setLanguage = type === 'question' ? setQuestionLanguage : setAnswerLanguage;
    const selectedLanguage = languageMap[currentLanguage] ?? languageMap['auto'];
    const label = type === 'question' ? 'Translate the Question to' : 'Answer Language';

    return (
        <Select
            key={currentLanguage}
            value={currentLanguage}
            onValueChange={(value) => {
                if (value && value !== currentLanguage) {
                    setLanguage(value);
                }
            }}
        >
            <SelectTrigger aria-label={label} className={`focus:ring-0 border-none outline-none ${className}`}>
                <SelectValue>
                    <div className="flex items-center space-x-1">
                        <Languages className="h-4 w-4" />
                        <span className="font-semibold">{selectedLanguage.name}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full">
                {Object.values(languageMap).map((item) => (
                    <LanguageItem key={item.value} language={item} />
                ))}
            </SelectContent>
        </Select>
    );
}

export function QuestionLanguageSelection({ className }: { className?: string }) {
    return <LanguageSelection type="question" className={className} />;
}

export function AnswerLanguageSelection({ className }: { className?: string }) {
    return <LanguageSelection type="answer" className={className} />;
}

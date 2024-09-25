'use client';

import { useTransition } from 'react';
import { Locale, usePathname, useRouter } from '@/i18n/routing';
import { RowSelectTrigger, Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface LocaleSelectProps {
    className?: string;
    showCurrentLocale?: boolean;
}

function getLocaleName(locale: string): string {
    const localeMap: { [key: string]: string } = {
        en: 'English',
        zh: '中文',
        de: 'Deutsch',
        fr: 'Français',
        es: 'Español',
        ja: '日本語',
        ar: 'العربية',
    };
    return localeMap[locale] || locale;
}

export default function LocaleSelect({ className, showCurrentLocale = false }: LocaleSelectProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const locale = useLocale();

    function onSelectChange(value: string) {
        startTransition(() => {
            router.replace(pathname, { locale: value as Locale });
        });
    }

    return (
        <Select defaultValue={locale} disabled={isPending} onValueChange={onSelectChange}>
            <RowSelectTrigger
                aria-label="Locale select"
                className={cn('inline-flex items-center justify-center rounded-md text-sm leading-none size-auto p-2', className)}
            >
                <SelectValue>
                    <div className="flex items-center">
                        <Languages size={20} />
                        {showCurrentLocale && <span className="ml-2">{getLocaleName(locale)}</span>}
                    </div>
                </SelectValue>
            </RowSelectTrigger>
            <SelectContent>
                <SelectItem value="en"> English </SelectItem>
                <SelectItem value="zh"> 中文 </SelectItem>
                <SelectItem value="de"> Deutsch </SelectItem>
                <SelectItem value="fr"> Français </SelectItem>
                <SelectItem value="es"> Español </SelectItem>
                <SelectItem value="ja"> 日本語 </SelectItem>
                <SelectItem value="ar"> العربية </SelectItem>
            </SelectContent>
        </Select>
    );
}

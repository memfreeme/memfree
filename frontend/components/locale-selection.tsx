'use client';

import { useTransition } from 'react';
import { Locale, usePathname, useRouter } from '@/i18n/routing';
import { RowSelectTrigger, Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface LocaleSelectProps {
    className?: string;
}

export default function LocaleSelect({ className }: LocaleSelectProps) {
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
                    <Languages size={20}></Languages>
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

'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

import { useTranslations } from 'next-intl';

export function PricingFaq() {
    const t = useTranslations('PricingFAQ');

    const pricingFaqData = [
        {
            id: 'item-1',
            question: t('question1'),
            answer: t('answer1'),
        },
        {
            id: 'item-2',
            question: t('question2'),
            answer: t('answer2'),
        },
        {
            id: 'item-3',
            question: t('question3'),
            answer: t('answer3'),
        },
        {
            id: 'item-4',
            question: t('question4'),
            answer: t('answer4'),
        },
    ];

    return (
        <section className="container max-w-4xl py-10">
            <div className="flex flex-col items-center text-center">
                <h2 className="font-heading text-3xl md:text-4xl lg:text-[40px]">
                    {t('title')}
                </h2>
            </div>

            <Accordion type="single" collapsible className="my-12 w-full">
                {pricingFaqData.map((faqItem) => (
                    <AccordionItem key={faqItem.id} value={faqItem.id}>
                        <AccordionTrigger>{faqItem.question}</AccordionTrigger>
                        <AccordionContent className="sm:text-[15px]">
                            {faqItem.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}

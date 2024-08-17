'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

import { HeaderSection } from '@/components/shared/header-section';

const pricingFaqData = [
    {
        id: 'item-1',
        question: 'What makes Memfree Unqiue?',
        answer: "Memfree is a Hybrid AI search engine that combines the best of both worlds. It uses a combination of Vector Search and SERP Search to provide the most relevant results. It's fast, accurate, and easy to use.",
    },
    {
        id: 'item-2',
        question: 'What is the meaning is Index?',
        answer: 'Memfree will collect and store your bookmarks and URLs using vector indexing. This allows you to quickly search for and retrieve the most similar content. Your index is private and only accessible to you.',
    },
    {
        id: 'item-3',
        question: 'Why Memfree charges monthly fee?',
        answer: 'Memfree charges a monthly fee because the AI services, search services, and vector indexing services we rely on all require ongoing monthly payments.',
    },
    {
        id: 'item-4',
        question: 'How to Contact Us?',
        answer: 'If you encounter any issues with payment or subscription, you can contact us via email at support@memfree.me or through Discord.',
    },
];

export function PricingFaq() {
    return (
        <section className="container max-w-4xl py-2">
            <HeaderSection
                label="FAQ"
                title="Frequently Asked Questions"
                subtitle="Explore our comprehensive FAQ to find quick answers to common
          inquiries. If you need further assistance, don't hesitate to
          contact us for personalized help."
            />

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

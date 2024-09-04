'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserSubscriptionPlan } from '@/types';

import { cn } from '@/lib/utils';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { Button, buttonVariants } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BillingFormButton } from '@/components/forms/billing-form-button';
import { HeaderSection } from '@/components/shared/header-section';
import { Icons } from '@/components/shared/icons';

import { SubscriptionPlan } from '@/types/index';
import { pricingData } from '@/config';
import { useTranslations } from 'next-intl';

interface PricingCardsProps {
    userId?: string;
    subscriptionPlan?: UserSubscriptionPlan;
}

const frees = ['Free1', 'Free2', 'Free3', 'Free5', 'Free6', 'Free7'] as const;

const pros = [
    'Pro1',
    'Pro2',
    'Pro3',
    'Pro4',
    'Pro5',
    'Pro6',
    'Pro7',
    'Pro8',
    'Pro9',
] as const;

const premiums = [
    'Premium1',
    'Premium2',
    'Premium3',
    'Premium4',
    'Premium5',
    'Premium6',
    'Premium7',
] as const;

export function PricingCards({ userId, subscriptionPlan }: PricingCardsProps) {
    const isYearlyDefault =
        !subscriptionPlan?.stripeCustomerId ||
        subscriptionPlan.interval === 'year'
            ? true
            : false;
    const [isYearly, setIsYearly] = useState<boolean>(!!isYearlyDefault);
    const signInModal = useSigninModal();

    const toggleBilling = () => {
        setIsYearly(!isYearly);
    };

    const t = useTranslations('Pricing');

    const OfferList = ({ items }: { items: readonly string[] }) => (
        <>
            {items.map((key) => (
                <li key={key} className="flex items-start gap-x-3">
                    <Icons.check className="size-5 shrink-0 text-purple-500" />
                    <p>{t(`${key}`)}</p>
                </li>
            ))}
        </>
    );

    const OfferComponent = ({ offer }: { offer: { title: string } }) => {
        let items;
        switch (offer.title) {
            case 'Free':
                items = frees;
                break;
            case 'Pro':
                items = pros;
                break;
            case 'Premium':
                items = premiums;
                break;
            default:
                items = [];
        }
        return <OfferList items={items} />;
    };

    const PricingCard = ({ offer }: { offer: SubscriptionPlan }) => {
        return (
            <div
                className={cn(
                    'relative flex flex-col overflow-hidden rounded-3xl border shadow-sm',
                    offer.title.toLocaleLowerCase() === 'pro'
                        ? '-m-0.5 border-2 border-purple-400'
                        : '',
                )}
                key={offer.title}
            >
                <div className="min-h-[150px] items-start space-y-4 bg-muted/50 p-6">
                    <p className="flex font-urban text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {offer.title}
                    </p>

                    <div className="flex flex-row">
                        <div className="flex items-end">
                            <div className="flex text-left text-3xl font-semibold leading-6">
                                {isYearly && offer.prices.monthly > 0 ? (
                                    <>
                                        <span className="mr-2 text-muted-foreground/80 line-through">
                                            ${offer.prices.monthly}
                                        </span>
                                        <span>${offer.prices.yearly / 12}</span>
                                    </>
                                ) : (
                                    `$${offer.prices.monthly}`
                                )}
                            </div>
                            <div className="-mb-1 ml-2 text-left text-sm font-medium text-muted-foreground">
                                <div>/month</div>
                            </div>
                        </div>
                    </div>
                    {offer.prices.monthly > 0 ? (
                        <div className="text-left text-sm text-muted-foreground">
                            {isYearly
                                ? `$${offer.prices.yearly} will be charged when annual`
                                : 'when charged monthly'}
                        </div>
                    ) : null}
                </div>

                <div className="flex h-full flex-col justify-between gap-16 p-6">
                    <ul className="space-y-2 text-left text-sm font-medium leading-normal">
                        <OfferComponent offer={offer} />
                    </ul>

                    {userId && subscriptionPlan ? (
                        offer.title === 'Free' ? (
                            <Link
                                href="/"
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        rounded: 'full',
                                    }),
                                    'w-full',
                                )}
                            >
                                {t('free-call')}
                            </Link>
                        ) : (
                            <BillingFormButton
                                year={isYearly}
                                offer={offer}
                                subscriptionPlan={subscriptionPlan}
                            />
                        )
                    ) : (
                        <Button
                            variant={
                                offer.title.toLocaleLowerCase() === 'pro'
                                    ? 'default'
                                    : 'outline'
                            }
                            rounded="full"
                            onClick={signInModal.onOpen}
                        >
                            Sign in
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="container flex flex-col items-center text-center">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-gradient_indigo-purple mb-4 font-semibold">
                    {t('title')}
                </h1>
                <h2 className="font-heading text-3xl md:text-4xl lg:text-[40px]">
                    {t('description')}
                </h2>
            </div>

            <div className="mb-4 mt-10 flex items-center gap-5">
                <ToggleGroup
                    type="single"
                    size="sm"
                    defaultValue={isYearly ? 'yearly' : 'monthly'}
                    onValueChange={toggleBilling}
                    aria-label="toggle-year"
                    className="h-9 overflow-hidden rounded-full border bg-background p-1 *:h-7 *:text-muted-foreground"
                >
                    <ToggleGroupItem
                        value="yearly"
                        className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
                        aria-label="Toggle yearly billing"
                    >
                        Yearly (-20%)
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="monthly"
                        className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
                        aria-label="Toggle monthly billing"
                    >
                        Monthly
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="mx-auto grid max-w-6xl gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
                {pricingData.map((offer) => (
                    <PricingCard offer={offer} key={offer.title} />
                ))}
            </div>
        </section>
    );
}

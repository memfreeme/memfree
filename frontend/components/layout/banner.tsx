import Link from 'next/link';

export default function PromotionBanner() {
    return (
        <div className="relative text-sm isolate flex items-center gap-x-6 overflow-hidden bg-primary text-violet-50 px-6 py-2.5 sm:px-3.5">
            {/* Promotion content */}
            <div className="flex  w-full flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <p className="leading-6">
                    <span>Black Friday Mega Sale 🎉 </span>
                    <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
                        <circle cx={1} cy={1} r={1} />
                    </svg>
                    <span>
                        Apply promo code <strong className="font-semibold">BLACK24</strong> to avail 30% discount. Valid till Nov 30.
                    </span>
                </p>
                <Link href="/pricing" prefetch={false} className="text-violet-50 font-bold underline">
                    Purchase now <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>
        </div>
    );
}

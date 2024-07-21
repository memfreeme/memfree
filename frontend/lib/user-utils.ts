export function checkIsPro(user: any) {
    if (!user) return false;
    const periodEnd = new Date(user.stripeCurrentPeriodEnd || 0);

    const isPaid =
        user.stripePriceId && periodEnd.getTime() + 86_400_000 > Date.now()
            ? true
            : false;
    return isPaid;
}
export function HeroLanding() {
    return (
        <section className="space-y-6 py-10 sm:py-20 lg:py-10">
            <div className="container flex  flex-col items-center gap-5 text-center">
                <h1 className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
                    Search Anything with{' '}
                    <span className="text-gradient_indigo-purple font-extrabold">
                        MemFree
                    </span>
                </h1>

                <p
                    className="text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                    style={{
                        animationDelay: '0.35s',
                        animationFillMode: 'forwards',
                    }}
                >
                    Instantly Get Accurate Answers from the Internet, Bookmarks,
                    Notes, and Docs
                </p>
            </div>
        </section>
    );
}

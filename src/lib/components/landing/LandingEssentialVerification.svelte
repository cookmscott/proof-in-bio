<script>
    import { ShieldCheck, ArrowRight } from 'lucide-svelte';
    import { Button } from '$lib/ui/button/index.js';

    // Local static assets
    let newsLogos = [
        "/landing/carousel_news/abcnews.png",
        "/landing/carousel_news/afp.png",
        "/landing/carousel_news/associatedpress.png",
        "/landing/carousel_news/bbcnews.png",
        "/landing/carousel_news/bloomberg.png",
        "/landing/carousel_news/cbsnews.png",
        "/landing/carousel_news/cnn.png",
        "/landing/carousel_news/foxnewschannel.png",
        "/landing/carousel_news/france24.png",
        "/landing/carousel_news/nbcnews.png",
        "/landing/carousel_news/npr.png",
        "/landing/carousel_news/pbs.png",
        "/landing/carousel_news/reuters.png",
        "/landing/carousel_news/theguardian.png"
    ];

    let photos = [
        "/landing/carousel_photos/blackhole.jpg",
        "/landing/carousel_photos/bluemarbleremastered.jpg",
        "/landing/carousel_photos/chichenitza.jpg",
        "/landing/carousel_photos/daphnia.jpg",
        "/landing/carousel_photos/dmanisi-skull5excavation.jpg",
        "/landing/carousel_photos/earthriseapollo15.jpg",
        "/landing/carousel_photos/eiffeltowerparis.jpg",
        "/landing/carousel_photos/göbeklitepe-buildingc.jpg",
        "/landing/carousel_photos/grandcanyonusa.jpg",
        "/landing/carousel_photos/hubbleultradeepfieldhigh.jpg",
        "/landing/carousel_photos/jwstspacecraft.jpg",
        "/landing/carousel_photos/machupicchuperu.jpg",
        "/landing/carousel_photos/niagarafalls.jpg",
        "/landing/carousel_photos/pillarsofcreation.jpg",
        "/landing/carousel_photos/simonebilesrio2016.jpg",
        "/landing/carousel_photos/snailporridgethefatduck.jpg",
        "/landing/carousel_photos/spursvslakersnbaaction.jpg",
        "/landing/carousel_photos/sydneyoperahousenight.jpg",
        "/landing/carousel_photos/vancouverskyline.jpg"
    ];

    // Helper to shuffle array (Fisher-Yates)
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        // While there remain elements to shuffle.
        while (currentIndex > 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // Shuffle the base arrays on load
    newsLogos = shuffle(newsLogos);
    photos = shuffle(photos);

    // Helper to duplicate array for seamless looping
    const triple = (arr) => [...arr, ...arr, ...arr];
    
    // Create rows (triple the shuffled arrays)
    // For row 3, we can reshuffle newsLogos or just reverse/triple again.
    // Let's create a fresh shuffle for Row 3 for variety.
    const row1 = triple([...newsLogos]);
    const row2 = triple([...photos]);
    const row3 = triple(shuffle([...newsLogos]));

</script>

<section class="bg-zinc-50 dark:bg-zinc-900 py-20 border-y border-border/40 overflow-hidden">
    <div class="container mx-auto max-w-7xl px-6 mb-12">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
            <div class="max-w-2xl">
                <div class="inline-flex items-center gap-2 text-primary font-medium mb-3">
                    <ShieldCheck class="h-4 w-4" />
                    <span class="text-sm uppercase tracking-wider">High-Stakes Proof</span>
                </div>
                <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                    Where Being Real Is Non-Negotiable
                </h2>
            </div>
            <div class="max-w-md space-y-4">
                <p class="text-muted-foreground text-base leading-relaxed">
                    Millions of images, infinite feeds. We provide the infrastructure to know what's real in an era of synthetic media.
                </p>
                <Button variant="outline" href="#how-it-works" class="group rounded-full bg-background">
                    Prove It’s Real
                    <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </div>
    </div>

    <!-- Marquee Rows -->
    <div class="flex flex-col gap-4 relative">
        
        <!-- Row 1: News Logos (Right to Left) - Slow -->
        <div class="relative flex overflow-hidden w-full select-none">
            <div class="flex gap-4 animate-marquee whitespace-nowrap items-center will-change-transform" style="animation-duration: 80s;">
                {#each row1 as url}
                    <div class="h-16 w-32 md:h-20 md:w-40 flex items-center justify-center p-4 transition-all duration-500">
                        <img 
                            src={url} 
                            alt="News Agency Logo" 
                            loading="lazy"
                            class="max-w-full max-h-full object-contain"
                        />
                    </div>
                {/each}
            </div>
             <!-- Saturation Vignette Overlay -->
             <div class="absolute inset-0 z-10 pointer-events-none vignette-saturation"></div>
        </div>

        <!-- Row 2: Photos (Left to Right) - Slower (Focus) -->
        <div class="relative flex overflow-hidden w-full select-none">
            <div class="flex gap-3 animate-marquee-reverse whitespace-nowrap items-center will-change-transform" style="animation-duration: 100s;">
                {#each row2 as url}
                    <div class="relative h-40 w-56 md:h-52 md:w-80 rounded-lg overflow-hidden shrink-0">
                        <img 
                            src={url} 
                            alt="Proven Photo" 
                            loading="lazy"
                            class="w-full h-full object-cover"
                        />
                        <div class="absolute inset-0 bg-black/5"></div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Row 3: News Logos (Right to Left) - Faster -->
        <div class="relative flex overflow-hidden w-full select-none">
            <div class="flex gap-4 animate-marquee whitespace-nowrap items-center will-change-transform" style="animation-duration: 45s;">
                {#each row3 as url}
                    <div class="h-12 w-24 md:h-16 md:w-32 flex items-center justify-center p-3 transition-all duration-500">
                        <img 
                            src={url} 
                            alt="News Agency Logo" 
                            loading="lazy"
                            class="max-w-full max-h-full object-contain"
                        />
                    </div>
                {/each}
            </div>
            <!-- Saturation Vignette Overlay -->
            <div class="absolute inset-0 z-10 pointer-events-none vignette-saturation"></div>
        </div>
        
        <!-- Side Fades (Opacity/Background blend) -->
        <div class="absolute inset-y-0 left-0 w-16 md:w-48
        bg-gradient-to-r
        from-zinc-100 via-zinc-100/80 to-transparent
        dark:from-neutral-900 dark:via-neutral-900/80
        z-10 pointer-events-none"></div>

        <div class="absolute inset-y-0 right-0 w-16 md:w-48
        bg-gradient-to-l
        from-zinc-100 via-zinc-100/80 to-transparent
        dark:from-neutral-900 dark:via-neutral-900/80
        z-10 pointer-events-none"></div>

    </div>
</section>

<style>
    .animate-marquee {
        animation: marquee 60s linear infinite;
    }

    .animate-marquee-reverse {
        animation: marquee-reverse 60s linear infinite;
    }

    @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.33%); }
    }

    @keyframes marquee-reverse {
        0% { transform: translateX(-33.33%); }
        100% { transform: translateX(0%); }
    }

    .will-change-transform {
        will-change: transform;
    }

    /* 
       This overlay applies a grayscale backdrop filter to the sides, 
       while keeping the center fully colored (transparent mask).
       - backdrop-filter: grayscale(100%) makes everything behind it grayscale.
       - mask-image: defines WHERE this backdrop filter is visible.
         - white/black = visible (filter applied)
         - transparent = invisible (filter NOT applied, original color shows)
    */
    .vignette-saturation {
        backdrop-filter: grayscale(100%);
        -webkit-backdrop-filter: grayscale(100%);
        mask-image: linear-gradient(to right, black 0%, transparent 35%, transparent 65%, black 100%);
        -webkit-mask-image: linear-gradient(to right, black 0%, transparent 35%, transparent 65%, black 100%);
    }
</style>

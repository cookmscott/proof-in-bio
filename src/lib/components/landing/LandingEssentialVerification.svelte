<script>
    import { Briefcase, Newspaper, User, ShieldCheck, ArrowRight } from 'lucide-svelte';
    import { Button } from '$lib/ui/button/index.js';
</script>

<section class="bg-background py-12 sm:py-16">
    <div class="container mx-auto max-w-6xl px-6">
        
        <!-- Header: Simplified and aligned -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-border/40 pb-8">
            <div class="max-w-2xl">
                <div class="inline-flex items-center gap-2 text-primary font-medium mb-3">
                    <ShieldCheck class="h-4 w-4" />
                    <span class="text-sm uppercase tracking-wider">High-Stakes Verification</span>
                </div>
                <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                    Where Authenticity is Non-Negotiable
                </h2>
            </div>
            <p class="text-muted-foreground max-w-md text-base leading-relaxed">
                Immutable records for industries that demand truth. Verify your work's provenance instantly.
            </p>
        </div>

        <!-- Grid: Flatter, border-based, no overlapping layers -->
        <div class="grid md:grid-cols-3 gap-6 mb-16">
            
            <!-- Card 1 -->
            <div class="group flex flex-col rounded-2xl border border-border bg-card p-2 transition-all duration-300 hover:border-primary/20">
                <div class="aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted relative">
                    <img
                        src="https://images.pexels.com/photos/30797176/pexels-photo-30797176.jpeg?width=400"
                        alt="Commercial"
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div class="absolute top-3 left-3 bg-background/95 backdrop-blur border border-border/50 p-2 rounded-lg">
                        <Briefcase class="w-4 h-4 text-orange-500" />
                    </div>
                </div>
                <div class="p-4 pt-5">
                    <h3 class="text-lg font-semibold text-foreground mb-1">Commercial & Brand</h3>
                    <p class="text-sm text-muted-foreground">Show clients it’s real.</p>
                </div>
            </div>

            <!-- Card 2 -->
            <div class="group flex flex-col rounded-2xl border border-border bg-card p-2 transition-all duration-300 hover:border-primary/20">
                <div class="aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted relative">
                    <img
                        src="https://images.pexels.com/photos/13237007/pexels-photo-13237007.jpeg?w=400"
                        alt="Documentary"
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div class="absolute top-3 left-3 bg-background/95 backdrop-blur border border-border/50 p-2 rounded-lg">
                        <Newspaper class="w-4 h-4 text-blue-500" />
                    </div>
                </div>
                <div class="p-4 pt-5">
                    <h3 class="text-lg font-semibold text-foreground mb-1">Documentary</h3>
                    <p class="text-sm text-muted-foreground">Preserve trust in events.</p>
                </div>
            </div>

            <!-- Card 3 -->
            <div class="group flex flex-col rounded-2xl border border-border bg-card p-2 transition-all duration-300 hover:border-primary/20">
                <div class="aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted relative">
                    <img
                        src="/mrbeast.webp"
                        alt="Creator"
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                     <div class="absolute top-3 left-3 bg-background/95 backdrop-blur border border-border/50 p-2 rounded-lg">
                        <User class="w-4 h-4 text-green-500" />
                    </div>
                </div>
                <div class="p-4 pt-5">
                    <h3 class="text-lg font-semibold text-foreground mb-1">Creator Identity</h3>
                    <p class="text-sm text-muted-foreground">Verified by capture.</p>
                </div>
            </div>

        </div>

        <!-- Footer / CTA: Clean row, no heavy container -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-border/50 bg-muted/30 p-8">
            <div class="space-y-1 text-center md:text-left">
                <h4 class="font-semibold text-foreground">Ready to prove your work?</h4>
                <p class="text-sm text-muted-foreground">Secured by C2PA technology for news, legal, and history.</p>
            </div>
            <Button size="lg" href="#how-it-works" class="rounded-full px-8">
                Integrate Proof in Bio
                <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
        </div>

    </div>
</section>
<!-- 
  +page.svelte
  Landing page for Proof in Bio - a C2PA-verified photo platform
  Built with SvelteKit 5, Tailwind CSS, and shadcn-svelte
  Design emphasizes authenticity with bold visuals and clear messaging
-->
<script>
    import { Button } from '$lib/ui/button/index.js';
    import { Card } from '$lib/ui/card/index.js';
    import { Badge } from '$lib/ui/badge/index.js';
    import { 
        CheckCircle2, 
        ShieldCheck, 
        Camera, 
        ArrowRight, 
        Upload,
        Sparkles,
        Ban,
        Link2,
        Users,
        Zap
    } from 'lucide-svelte';

    // Hero gallery images with verification badges
    const heroImages = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        src: `https://picsum.photos/300/300?random=${i + 1}`,
        alt: `Random photo ${i + 1}`,
        rotation: [
            '-rotate-3',
            'rotate-2',
            'rotate-6',
            '-rotate-2',
            'rotate-3'
        ][i]
    }));

    // Stats for social proof
    const stats = [
        { value: '10K+', label: 'Verified Creators' },
        { value: '250K+', label: 'Authentic Photos' },
        { value: '99.9%', label: 'Trust Score' }
    ];
</script>

<div class="bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
    <!-- Header -->
    <header class="container mx-auto max-w-6xl px-6 py-6">
        <nav class="flex items-center justify-between">
            <a href="/" class="flex items-center gap-2 group">
                <div class="relative">
                    <Camera class="h-7 w-7 transition-transform group-hover:scale-110" />
                    <CheckCircle2 class="h-3 w-3 absolute -bottom-1 -right-1 text-green-500" />
                </div>
                <span class="font-bold text-lg">Proof in Bio</span>
            </a>
            <div class="flex items-center gap-3">
                <Button variant="ghost" size="sm">How it Works</Button>
                <Button size="sm">Get Started</Button>
            </div>
        </nav>
    </header>

    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section class="py-20 md:py-32">
            <div class="container mx-auto max-w-7xl px-6">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <!-- Left: Text Content -->
                    <div class="text-center lg:text-left">
                        <!-- C2PA Badge -->
                        <Badge variant="secondary" class="inline-flex items-center gap-2 px-4 py-2 mb-8">
                            <CheckCircle2 class="h-4 w-4 text-green-500" />
                            <span class="font-bold">C2PA Verified Platform</span>
                        </Badge>
                        
                        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight font-alpino">
                            Your photos.<br/>
                            <span class="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Actually yours.
                            </span>
                        </h1>
                        <p class="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-balance">
                            One link in your bio that proves every photo is real. No AI. No heavy edits. Just authentic creativity from verified humans.
                        </p>
                        <div class="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <Button size="lg" class="group">
                                <Upload class="mr-2 h-5 w-5" />
                                Upload Your First Photo
                                <ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button size="lg" variant="outline" as="a" href="/janedoe">
                                <Link2 class="mr-2 h-5 w-5" />
                                See Example Gallery
                            </Button>
                        </div>
                    </div>

                    <!-- Right: Expressive Image Collage with Glow -->
                    <div class="relative h-[500px] w-full hidden lg:block">
                        <!-- Each Card is an image in the collage -->
                        <Card class="absolute top-10 left-0 w-1/3 overflow-hidden shadow-xl py-0 {heroImages[0].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                            <img src={heroImages[0].src} alt={heroImages[0].alt} class="w-full h-full object-cover aspect-[3/4]" />
                        </Card>
                        <Card class="absolute top-0 right-0 w-1/4 overflow-hidden shadow-xl py-0 {heroImages[1].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                            <img src={heroImages[1].src} alt={heroImages[1].alt} class="w-full h-full object-cover aspect-[3/4]" />
                        </Card>
                        <Card class="absolute bottom-10 right-1/4 w-1/3 overflow-hidden shadow-xl py-0 {heroImages[2].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                            <img src={heroImages[2].src} alt={heroImages[2].alt} class="w-full h-full object-cover aspect-[4/3]" />
                        </Card>
                        <Card class="absolute bottom-0 left-1/4 w-1/3 overflow-hidden shadow-xl py-0 {heroImages[3].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                            <img src={heroImages[3].src} alt={heroImages[3].alt} class="w-full h-full object-cover aspect-[4/3]" />
                        </Card>
                        <Card class="absolute top-1/3 left-1/2 -translate-x-1/2 w-1/4 overflow-hidden shadow-2xl z-20 py-0 {heroImages[4].rotation} transition-all duration-300 hover:scale-110 hover:rotate-0">
                            <img src={heroImages[4].src} alt={heroImages[4].alt} class="w-full h-full object-cover aspect-square" />
                        </Card>
                    </div>
                </div>
                
                <!-- Centered collage for medium screens -->
                <div class="mt-16 relative h-[400px] w-full max-w-4xl mx-auto hidden md:block lg:hidden">
                    <!-- Each Card is an image in the collage -->
                    <Card class="absolute top-10 left-0 w-1/3 overflow-hidden shadow-xl py-0 {heroImages[0].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                        <img src={heroImages[0].src} alt={heroImages[0].alt} class="w-full h-full object-cover aspect-[3/4]" />
                    </Card>
                    <Card class="absolute top-0 right-0 w-1/4 overflow-hidden shadow-xl py-0 {heroImages[1].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                        <img src={heroImages[1].src} alt={heroImages[1].alt} class="w-full h-full object-cover aspect-[3/4]" />
                    </Card>
                    <Card class="absolute bottom-10 right-1/4 w-1/3 overflow-hidden shadow-xl py-0 {heroImages[2].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                            <img src={heroImages[2].src} alt={heroImages[2].alt} class="w-full h-full object-cover aspect-[4/3]" />
                        </Card>
                        <Card class="absolute bottom-0 left-1/4 w-1/3 overflow-hidden shadow-xl py-0 {heroImages[3].rotation} transition-all duration-300 hover:scale-105 hover:z-10 hover:rotate-0">
                            <img src={heroImages[3].src} alt={heroImages[3].alt} class="w-full h-full object-cover aspect-[4/3]" />
                        </Card>
                        <Card class="absolute top-1/3 left-1/2 -translate-x-1/2 w-1/4 overflow-hidden py-0 shadow-2xl z-20 {heroImages[4].rotation} transition-all duration-300 hover:scale-110 hover:rotate-0">
                            <img src={heroImages[4].src} alt={heroImages[4].alt} class="w-full h-full object-cover aspect-square" />
                        </Card>
                </div>
                
                <!-- Simplified collage for mobile -->
                <div class="mt-16 grid grid-cols-2 gap-4 md:hidden">
                    <img src={heroImages[0].src} alt={heroImages[0].alt} class="w-full h-full object-cover rounded-lg" />
                    <img src={heroImages[1].src} alt={heroImages[1].alt} class="w-full h-full object-cover rounded-lg" />
                    <img src={heroImages[2].src} alt={heroImages[2].alt} class="w-full h-full object-cover rounded-lg" />
                    <img src={heroImages[3].src} alt={heroImages[3].alt} class="w-full h-full object-cover rounded-lg" />
                </div>
            </div>
        </section>

        <!-- The Problem/Solution Section -->
        <section class="bg-muted/30 py-20 md:py-28">
            <div class="container mx-auto max-w-6xl px-6">
                <div class="grid md:grid-cols-2 gap-16 items-center">
                    <!-- The Problem -->
                    <div class="space-y-6">
                        <div class="inline-flex items-center gap-2 text-red-500">
                            <Ban class="h-5 w-5" />
                            <span class="font-semibold">The Problem</span>
                        </div>
                        <h2 class="text-3xl md:text-4xl font-bold font-alpino">
                            Nobody knows what's real anymore
                        </h2>
                        <div class="space-y-4 text-muted-foreground">
                            <div class="flex gap-3">
                                <Sparkles class="h-5 w-5 mt-0.5 text-red-500/50" />
                                <p>AI-generated images flooding every platform</p>
                            </div>
                            <div class="flex gap-3">
                                <Sparkles class="h-5 w-5 mt-0.5 text-red-500/50" />
                                <p>Heavy filters and edits destroying authenticity</p>
                            </div>
                            <div class="flex gap-3">
                                <Sparkles class="h-5 w-5 mt-0.5 text-red-500/50" />
                                <p>No way to verify if a photo is genuinely human-made</p>
                            </div>
                        </div>
                    </div>

                    <!-- The Solution -->
                    <div class="space-y-6">
                        <div class="inline-flex items-center gap-2 text-green-500">
                            <CheckCircle2 class="h-5 w-5" />
                            <span class="font-semibold">The Solution</span>
                        </div>
                        <h2 class="text-3xl md:text-4xl font-bold font-alpino">
                            One link that proves it all
                        </h2>
                        <div class="space-y-4">
                            <div class="flex gap-3">
                                <CheckCircle2 class="h-5 w-5 mt-0.5 text-green-500" />
                                <div>
                                    <p class="font-medium">C2PA verification on every upload</p>
                                    <p class="text-sm text-muted-foreground">Industry-standard cryptographic proof</p>
                                </div>
                            </div>
                            <div class="flex gap-3">
                                <CheckCircle2 class="h-5 w-5 mt-0.5 text-green-500" />
                                <div>
                                    <p class="font-medium">Beautiful gallery you control</p>
                                    <p class="text-sm text-muted-foreground">Your verified work, your way</p>
                                </div>
                            </div>
                            <div class="flex gap-3">
                                <CheckCircle2 class="h-5 w-5 mt-0.5 text-green-500" />
                                <div>
                                    <p class="font-medium">Drop it in your bio anywhere</p>
                                    <p class="text-sm text-muted-foreground">Instagram, Twitter, LinkedIn - prove it everywhere</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works -->
        <section class="container mx-auto max-w-6xl px-6 py-20 md:py-28">
            <div class="text-center space-y-4 mb-16">
                <h2 class="text-4xl md:text-5xl font-bold font-alpino">
                    Dead simple. Crazy powerful.
                </h2>
                <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Get your verified gallery up in 60 seconds
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div class="text-center space-y-4">
                    <div class="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Upload class="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 class="text-xl font-semibold font-alpino">1. Upload with C2PA</h3>
                    <p class="text-muted-foreground">
                        Drag and drop photos straight from your camera or verified editing tools
                    </p>
                </div>

                <div class="text-center space-y-4">
                    <div class="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <ShieldCheck class="h-8 w-8 text-green-500" />
                    </div>
                    <h3 class="text-xl font-semibold font-alpino">2. Instant Verification</h3>
                    <p class="text-muted-foreground">
                        We check the cryptographic proof - if it's not real, it doesn't get in
                    </p>
                </div>

                <div class="text-center space-y-4">
                    <div class="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                        <Link2 class="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 class="text-xl font-semibold font-alpino">3. Share Your Link</h3>
                    <p class="text-muted-foreground">
                        Get your unique gallery URL to drop in any bio - instant credibility
                    </p>
                </div>
            </div>
        </section>

        <!-- Social Proof -->
        <section class="bg-muted/30 py-20">
            <div class="container mx-auto max-w-6xl px-6">
                <div class="text-center space-y-4 mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold font-alpino">
                        Creators are taking back control
                    </h2>
                </div>

                <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <Card class="p-6 space-y-4">
                        <div class="flex gap-1">
                            {#each Array(5) as _}
                                <Zap class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {/each}
                        </div>
                        <p class="text-sm">
                            "Finally, a way to show my photography is actually mine. Game changer for client trust."
                        </p>
                        <div class="flex items-center gap-2">
                            <div class="h-8 w-8 rounded-full bg-muted" />
                            <div>
                                <p class="text-sm font-medium">Sarah Chen</p>
                                <p class="text-xs text-muted-foreground">@sarahcaptures</p>
                            </div>
                        </div>
                    </Card>

                    <Card class="p-6 space-y-4">
                        <div class="flex gap-1">
                            {#each Array(5) as _}
                                <Zap class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {/each}
                        </div>
                        <p class="text-sm">
                            "My illustrations stand out now. Collectors know they're getting authentic human art."
                        </p>
                        <div class="flex items-center gap-2">
                            <div class="h-8 w-8 rounded-full bg-muted" />
                            <div>
                                <p class="text-sm font-medium">Marcus Rodriguez</p>
                                <p class="text-xs text-muted-foreground">@marcusdraws</p>
                            </div>
                        </div>
                    </Card>

                    <Card class="p-6 space-y-4">
                        <div class="flex gap-1">
                            {#each Array(5) as _}
                                <Zap class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {/each}
                        </div>
                        <p class="text-sm">
                            "Proof in Bio = instant credibility. My engagement went through the roof."
                        </p>
                        <div class="flex items-center gap-2">
                            <div class="h-8 w-8 rounded-full bg-muted" />
                            <div>
                                <p class="text-sm font-medium">Alex Kim</p>
                                <p class="text-xs text-muted-foreground">@alexshootsfilm</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Final CTA -->
        <section class="container mx-auto max-w-6xl px-6 py-20 md:py-28">
            <Card class="relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-10" />
                <div class="relative p-12 md:p-16 text-center space-y-6">
                    <h2 class="text-4xl md:text-5xl font-bold font-alpino">
                        Prove it's human.
                    </h2>
                    <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of creators building trust with every upload. 
                        Free to start, powerful forever.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button size="lg" class="group">
                            Create Your Gallery
                            <ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button size="lg" variant="outline">
                            Learn About C2PA
                        </Button>
                    </div>
                    <p class="text-sm text-muted-foreground">
                        No credit card required • 50 photos free • 2-minute setup
                    </p>
                </div>
            </Card>
        </section>
    </main>

    <!-- Footer -->
    <footer class="border-t">
        <div class="container mx-auto max-w-6xl px-6 py-12">
            <div class="grid md:grid-cols-4 gap-8">
                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <Camera class="h-5 w-5" />
                        <span class="font-bold">Proof in Bio</span>
                    </div>
                    <p class="text-sm text-muted-foreground">
                        The verified gallery for real creators.
                    </p>
                </div>
                
                <div class="space-y-4">
                    <h4 class="font-semibold">Product</h4>
                    <ul class="space-y-2 text-sm text-muted-foreground">
                        <li><a href="/features" class="hover:text-foreground">Features</a></li>
                        <li><a href="/examples" class="hover:text-foreground">Examples</a></li>
                    </ul>
                </div>
                
                <div class="space-y-4">
                    <h4 class="font-semibold">Resources</h4>
                    <ul class="space-y-2 text-sm text-muted-foreground">
                        <li><a href="/c2pa" class="hover:text-foreground">What is C2PA?</a></li>
                        <li><a href="/supported-cameras" class="hover:text-foreground">Supported Cameras</a></li>
                        <li><a href="/help" class="hover:text-foreground">Help Center</a></li>
                    </ul>
                </div>
                
                <div class="space-y-4">
                    <h4 class="font-semibold">Company</h4>
                    <ul class="space-y-2 text-sm text-muted-foreground">
                        <li><a href="/about" class="hover:text-foreground">About</a></li>
                        <li><a href="/blog" class="hover:text-foreground">Blog</a></li>
                        <li><a href="/contact" class="hover:text-foreground">Contact</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Proof in Bio. All rights reserved.</p>
                <div class="flex gap-6 mt-4 sm:mt-0">
                    <a href="/privacy" class="hover:text-foreground">Privacy</a>
                    <a href="/terms" class="hover:text-foreground">Terms</a>
                </div>
            </div>
        </div>
    </footer>
</div>
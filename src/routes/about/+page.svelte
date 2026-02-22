<!-- 
  routes/about/+page.svelte
  About page for Proof in Bio
  - Adopts the design language of the main landing page (Tailwind, shadcn-svelte)
  - Clearly explains the mission, the problem of AI content, and the C2PA solution
  - Focuses on trust, authenticity, and human-verified creation
  - Simplified to a "blog post" or "mission statement" style with a single-column layout
-->
<script>
    import { Button } from '$lib/ui/button/index.js';
    import { Badge } from '$lib/ui/badge/index.js';
    import { 
        Camera, 
        ArrowRight,
        CheckCircle2,
        ShieldCheck,
        ImageOff,
        BadgeCheck
    } from 'lucide-svelte';
</script>

<div class="bg-background text-foreground min-h-screen antialiased flex flex-col">
    <!-- Header -->
    <header class="container mx-auto max-w-6xl px-6 py-6 border-b border-border/40 md:border-none">
        <nav class="flex items-center justify-between">
            <a href="/" class="flex items-center gap-2 group">
                <div class="relative">
                    <Camera class="h-7 w-7 transition-transform group-hover:scale-110" />
                    <CheckCircle2 class="h-3 w-3 absolute -bottom-1 -right-1 text-green-500 bg-background rounded-full" />
                </div>
                <span class="font-bold text-lg tracking-tight">Proof in Bio</span>
            </a>
            <div class="flex items-center gap-3">
                <a href="/"><Button variant="ghost" size="sm">Home</Button></a>
                <Button size="sm">Get Started</Button>
            </div>
        </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto max-w-3xl px-6 py-20 md:py-28">
        <article class="max-w-none space-y-20">
            
            <!-- Hero / Mission Statement -->
            <header class="text-center">
                <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1]">
                    To build a more 
                    <span class="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        human-created
                    </span>
                     internet.
                </h1>
                <p class="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    In a world flooded with AI-generated content, Proof in Bio is a sanctuary for human creativity. We're here to restore trust and provide a platform where authenticity isn't just valued—it's <strong class="text-foreground">verified</strong>.
                </p>
            </header>

            <!-- Verified Content Notice -->
            <div class="flex items-start gap-5 p-6 md:p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-900 dark:text-green-300 shadow-sm">
                <ShieldCheck class="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 text-green-600 dark:text-green-500" />
                <div class="space-y-2">
                    <h3 class="font-semibold text-lg md:text-xl text-green-950 dark:text-green-100">Strictly Human-Created</h3>
                    <p class="text-base opacity-90 leading-relaxed">
                        Only verified, human-created content is allowed on Proof in Bio. AI-generated, synthetic, or unverified images are strictly excluded by design. 
                    </p>
                </div>
            </div>

            <!-- The Problem -->
            <section>
                <h2 class="text-3xl font-bold tracking-tight text-foreground mb-6">The Problem: A Crisis of Trust</h2>
                <div class="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>
                        The internet is saturated with AI-generated images, deepfakes, and heavily manipulated content. This digital noise makes it nearly impossible to trust what you see. It devalues the work of genuine creators and erodes our shared sense of reality. 
                    </p>
                    <p>
                        For artists, photographers, and makers, proving that your work is genuinely yours has become a profound challenge. When everything can be faked, how do you prove what's real?
                    </p>
                </div>

                <!-- Visual Comparison -->
                <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <!-- AI / Fake Image -->
                    <div class="relative group rounded-xl overflow-hidden border border-border/50 bg-muted shadow-sm">
                        <div class="absolute top-4 left-4 z-10">
                            <Badge variant="destructive" class="flex items-center gap-1.5 font-bold shadow-md px-3 py-1 text-sm">
                                <ImageOff class="w-4 h-4" /> 
                                AI / FAKE
                            </Badge>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" 
                            alt="AI Generated Landscape" 
                            class="w-full h-56 object-cover opacity-90 transition-opacity group-hover:opacity-100 rounded-xl" 
                        />
                    </div>
                    
                    <!-- Real / Verified Image -->
                    <div class="relative group rounded-xl overflow-hidden border border-green-500/30 shadow-lg ring-1 ring-green-500/20">
                        <div class="absolute top-4 left-4 z-10">
                            <Badge class="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 font-bold shadow-md px-3 py-1 text-sm transition-colors">
                                <BadgeCheck class="w-4 h-4" /> 
                                C2PA Verified
                            </Badge>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80" 
                            alt="Verified Human Created Landscape" 
                            class="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105 rounded-xl" 
                        />
                    </div>
                </div>
            </section>

            <!-- The Solution -->
            <section>
                <h2 class="text-3xl font-bold tracking-tight text-foreground mb-6">Our Solution: Verifiable Authenticity</h2>
                <div class="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>
                        We believe the story of how something was made is as important as the final product. That's why we've built our platform on <strong class="text-foreground">C2PA</strong>, the open industry standard for content provenance. By attaching a secure, tamper-proof "ingredient list" to every file, we can cryptographically verify its origin, creator, and edit history.
                    </p>
                    <p>
                        If an image wasn't created by a human or has been manipulated by AI, it doesn't get in. It's that simple. This provides a clear, reliable way for audiences to distinguish real from replica, and gives creators their power back.
                    </p>
                </div>
            </section>
            
            <!-- Our Promise -->
            <section>
                <h2 class="text-3xl font-bold tracking-tight text-foreground mb-6">Our Promise</h2>
                <div class="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>
                        Proof in Bio is more than a platform; it's a movement. We are committed to championing human creativity and building a future where digital work is authentic, transparent, and trustworthy. We promise to provide creators with the tools to prove their work is real and to give audiences a single source of truth they can rely on.
                    </p>
                </div>
            </section>
            
            <!-- CTA -->
            <footer class="pt-12 border-t border-border flex flex-col items-center text-center">
                <h3 class="text-3xl font-bold tracking-tight text-foreground">Join the Movement</h3>
                <p class="mt-4 text-muted-foreground text-lg max-w-md">
                    Help us build a more authentic internet. Claim your space and create your verified gallery today.
                </p>
                <div class="mt-8">
                    <Button size="lg" class="group h-14 px-8 text-base rounded-full shadow-md">
                        Create Your Verified Gallery
                        <ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </footer>
        </article>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border/50 bg-muted/20 mt-auto">
        <div class="container mx-auto max-w-6xl px-6 py-12 md:py-16">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                <div class="col-span-2 md:col-span-1 space-y-4">
                    <div class="flex items-center gap-2">
                        <Camera class="h-5 w-5" />
                        <span class="font-bold tracking-tight">Proof in Bio</span>
                    </div>
                    <p class="text-sm text-muted-foreground leading-relaxed">
                        The verified gallery for real creators. Defending human art in the age of AI.
                    </p>
                </div>
                
                <div class="space-y-4">
                    <h4 class="font-semibold text-foreground">Product</h4>
                    <ul class="space-y-3 text-sm text-muted-foreground">
                        <li><a href="/features" class="hover:text-foreground transition-colors">Features</a></li>
                        <li><a href="/examples" class="hover:text-foreground transition-colors">Examples</a></li>
                        <li><a href="/pricing" class="hover:text-foreground transition-colors">Pricing</a></li>
                    </ul>
                </div>
                
                <div class="space-y-4">
                    <h4 class="font-semibold text-foreground">Resources</h4>
                    <ul class="space-y-3 text-sm text-muted-foreground">
                        <li><a href="/c2pa" class="hover:text-foreground transition-colors">What is C2PA?</a></li>
                        <li><a href="/supported-cameras" class="hover:text-foreground transition-colors">Supported Cameras</a></li>
                        <li><a href="/help" class="hover:text-foreground transition-colors">Help Center</a></li>
                    </ul>
                </div>
                
                <div class="space-y-4">
                    <h4 class="font-semibold text-foreground">Company</h4>
                    <ul class="space-y-3 text-sm text-muted-foreground">
                        <li><a href="/about" class="text-foreground font-medium">About</a></li>
                        <li><a href="/blog" class="hover:text-foreground transition-colors">Blog</a></li>
                        <li><a href="/contact" class="hover:text-foreground transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-border/50 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Proof in Bio. All rights reserved.</p>
                <div class="flex gap-6">
                    <a href="/privacy" class="hover:text-foreground transition-colors">Privacy Policy</a>
                    <a href="/terms" class="hover:text-foreground transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
</div>
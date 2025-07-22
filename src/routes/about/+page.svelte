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
    import { Card } from '$lib/ui/card/index.js';
    import { Badge } from '$lib/ui/badge/index.js';
    import { 
        Camera, 
        ArrowRight,
        CheckCircle2
    } from 'lucide-svelte';
</script>

<div class="bg-background text-foreground min-h-screen antialiased">
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
                <a href="/"><Button variant="ghost" size="sm">Home</Button></a>
                <Button size="sm">Get Started</Button>
            </div>
        </nav>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto max-w-3xl px-6 py-20 md:py-28">
        <article class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-muted-foreground">
            <!-- Hero / Mission Statement -->
            <header class="text-center mb-16">
                <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
                    To build a more 
                    <span class="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        human-created
                    </span>
                     internet.
                </h1>
                <p class="mt-6 text-xl !text-foreground">
                    In a world flooded with AI-generated content, Proof in Bio is a sanctuary for human creativity. We're here to restore trust and provide a platform where authenticity isn't just valued—it's verified.
                </p>
            </header>

            <!-- Verified Content Notice -->
            <div class="mb-12 flex justify-start">
                <div class="flex items-center px-4 py-4 rounded text-left
                    bg-green-100
                    dark:bg-transparent dark:border dark:border-green-600 dark:text-green-400"
                >
                    <span class="mr-3 flex-shrink-0">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                d="M12 3l7 4v5c0 5.25-3.75 10-7 10s-7-4.75-7-10V7l7-4z"/>
                            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12l2 2 4-4"/>
                        </svg>
                    </span>
                    <span class="text-foreground dark:text-green-400 font-semibold">
                        Only verified, human-created content is allowed on Proof in Bio. AI-generated or unverified images are strictly excluded.
                    </span>
                </div>
            </div>

            <!-- The Problem -->
            <section class="space-y-4 mt-6">
                <h2 class="font-semibold">The Problem: A Crisis of Trust</h2>
                <p>
                    The internet is saturated with AI-generated images, deepfakes, and heavily manipulated content. This digital noise makes it nearly impossible to trust what you see. It devalues the work of genuine creators and erodes our shared sense of reality. For artists, photographers, and makers, proving that your work is genuinely yours has become a profound challenge.
                </p>
                <div class="flex flex-col md:flex-row gap-6 justify-center items-center mt-8">
                    <!-- AI / Fake Image -->
                    <div class="relative w-full md:w-1/3 flex flex-col items-center">
                        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="AI Generated" class="rounded-lg shadow-lg object-cover w-full h-40" />
                        <div class="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                            <div class="bg-red-600 text-white px-4 py-1 h-8 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg border-2 border-white whitespace-nowrap">
                                <span>AI / FAKE</span>
                                <span class="text-base">✗</span>
                            </div>
                        </div>
                    </div>
                    <!-- Real / Verified Image -->
                    <div class="relative w-full md:w-1/3 flex flex-col items-center">
                        <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80" alt="Human Created" class="rounded-lg shadow-lg object-cover w-full h-40" />
                        <div class="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                            <div class="bg-green-600 text-white px-4 py-1 h-8 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg border-2 border-white whitespace-nowrap">
                                <span>C2PA Verified</span>
                                <span>
                                    <!-- Clean check mark SVG -->
                                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                                        <path stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 8.5l3 3 5-5"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- The Solution -->
            <section class="mt-12 space-y-4">
                <h2 class="font-semibold">Our Solution: Verifiable Authenticity</h2>
                <p>
                    We believe the story of how something was made is as important as the final product. That's why we've built our platform on C2PA, the open industry standard for content provenance. By attaching a secure, tamper-proof "ingredient list" to every file, we can cryptographically verify its origin, creator, and edit history.
                </p>
                <p>
                    If an image wasn't created by a human or has been manipulated by AI, it doesn't get in. It's that simple. This provides a clear, reliable way for audiences to distinguish real from replica.
                </p>
            </section>
            
            <!-- Our Promise -->
            <section class="mt-12 space-y-4">
                <h2 class="font-semibold">Our Promise</h2>
                <p>
                    Proof in Bio is more than a platform; it's a movement. We are committed to championing human creativity and building a future where digital work is authentic, transparent, and trustworthy. We promise to provide creators with the tools to prove their work is real and to give audiences a source of truth they can rely on.
                </p>
            </section>
            
            <!-- CTA -->
            <footer class="mt-16 border-t pt-12 text-center">
                <h3 class="text-2xl font-bold text-foreground">Join the Movement</h3>
                <p class="mt-2">
                    Help us build a more authentic internet. Create your verified gallery today.
                </p>
                <div class="mt-6">
                    <Button size="lg" class="group">
                        Create Your Verified Gallery
                        <ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </footer>
        </article>
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

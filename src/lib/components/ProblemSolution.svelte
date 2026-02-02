<script>
    import { 
        Briefcase, 
        Newspaper, 
        User, 
        ShieldCheck, 
        ArrowRight, 
        AlertTriangle, 
        Sparkles, 
        XCircle, 
        Fingerprint, 
        CheckCircle2,
        Eye
    } from 'lucide-svelte';
    import { Button } from '$lib/ui/button/index.js';
</script>

<section class="bg-background py-24 sm:py-32 font-sans selection:bg-primary selection:text-primary-foreground">
    <div class="container mx-auto max-w-7xl px-6">
        
        <!-- SECTION 1: The Problem & Solution -->
        
        <!-- Header: High Design / Clean -->
        <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors border-red-200/50 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 mb-6 gap-2">
                <AlertTriangle class="h-4 w-4" />
                <span>The Reality Gap</span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                Nobody knows what's real anymore.
            </h2>
            <p class="text-xl text-muted-foreground leading-relaxed">
                As synthetic media floods the internet, trust is eroding. We provide the cryptographic infrastructure to distinguish human creation from AI generation.
            </p>
        </div>

        <!-- The Split Cards: Clean, border-based (Flatter aesthetic) -->
        <div class="grid md:grid-cols-2 gap-6 mb-32">
            
            <!-- Problem Card -->
            <div class="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 md:p-10 flex flex-col justify-between transition-all hover:shadow-lg">
                <div class="mb-8">
                    <div class="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                        <XCircle class="h-6 w-6" />
                    </div>
                    <h3 class="text-2xl font-bold text-foreground mb-4">The Trust Crisis</h3>
                    <ul class="space-y-4">
                        <li class="flex gap-3 items-start">
                            <Sparkles class="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <strong class="text-foreground font-semibold">AI Flood:</strong>
                                <span class="text-muted-foreground"> Synthetic images are now indistinguishable from reality, flooding news feeds and portfolios.</span>
                            </div>
                        </li>
                        <li class="flex gap-3 items-start">
                            <Eye class="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <strong class="text-foreground font-semibold">Invisible Edits:</strong>
                                <span class="text-muted-foreground"> Heavy manipulation destroys the provenance of digital assets.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Solution Card -->
            <div class="group relative overflow-hidden rounded-[2rem] border border-green-200/50 bg-green-50/10 dark:bg-green-900/5 p-8 md:p-10 flex flex-col justify-between transition-all hover:shadow-lg">
                <div class="mb-8">
                    <div class="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                        <ShieldCheck class="h-6 w-6" />
                    </div>
                    <h3 class="text-2xl font-bold text-foreground mb-4">The Standard of Truth</h3>
                    <ul class="space-y-4">
                        <li class="flex gap-3 items-start">
                            <Fingerprint class="h-5 w-5 text-green-600/80 shrink-0 mt-0.5" />
                            <div>
                                <strong class="text-foreground font-semibold">C2PA Verification:</strong>
                                <span class="text-muted-foreground"> Cryptographic proof embedded in every pixel. Industry-standard security.</span>
                            </div>
                        </li>
                        <li class="flex gap-3 items-start">
                            <CheckCircle2 class="h-5 w-5 text-green-600/80 shrink-0 mt-0.5" />
                            <div>
                                <strong class="text-foreground font-semibold">Verified Gallery:</strong>
                                <span class="text-muted-foreground"> A beautiful, controlled space for your work that proves its origin instantly.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
</section>
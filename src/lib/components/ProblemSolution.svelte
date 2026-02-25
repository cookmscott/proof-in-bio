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

<section class="relative overflow-hidden bg-background py-24 font-sans selection:bg-primary selection:text-primary-foreground">
<div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/0 via-background/40 to-background"></div>

<div class="absolute -top-24 left-1/2 h-96 w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b from-red-400/20 via-orange-400/10 to-transparent blur-3xl"></div>




<div class="container relative z-10 mx-auto max-w-7xl px-6">
        
        <!-- SECTION 1: The Problem & Solution -->
        
        <!-- Header: High Design / Clean -->
        <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors border-red-200/50 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 mb-6 gap-2">
                <Eye class="h-4 w-4" />
                <span>Reality Check</span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                Nobody knows what's real anymore.
            </h2>
            <p class="text-xl text-muted-foreground leading-relaxed">
                As synthetic media floods the internet, trust is eroding. We provide the secure digital proof to distinguish human creation from AI generation.
            </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
            
            <!-- Problem Side -->
            <div class="rounded-[2.5rem] border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 p-8 md:p-10 h-full">
                <div class="flex items-center gap-4 mb-8">
                    <div class="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
                        <XCircle class="h-6 w-6" />
                    </div>
                    <h3 class="text-2xl font-bold text-foreground tracking-tight">The Trust Crisis</h3>
                </div>
                
                <ul class="space-y-6 mb-10">
                    <li class="flex gap-4 items-start">
                        <Sparkles class="h-6 w-6 text-red-600/50 shrink-0 mt-0.5" />
                        <div class="space-y-1">
                            <p class="text-foreground font-bold text-lg leading-tight">AI Flood</p>
                            <p class="text-muted-foreground text-sm leading-relaxed">Synthetic images are now indistinguishable from reality, flooding news feeds and portfolios.</p>
                        </div>
                    </li>
                    <li class="flex gap-4 items-start">
                        <Eye class="h-6 w-6 text-red-600/50 shrink-0 mt-0.5" />
                        <div class="space-y-1">
                            <p class="text-foreground font-bold text-lg leading-tight">Invisible Edits</p>
                            <p class="text-muted-foreground text-sm leading-relaxed">Heavy manipulation destroys the provenance of digital assets, making truth impossible to find.</p>
                        </div>
                    </li>
                </ul>

                <!-- Embedded Video -->
                <div class="relative rounded-2xl overflow-hidden border border-red-200/50 dark:border-red-900/50 shadow-lg aspect-video group bg-black">
                    <video 
                       src="/landing/viral_fakes.mp4" 
                       autoplay 
                       muted 
                       loop 
                       playsinline
                       class="w-full h-full object-cover"
                   ></video>
                   
                   <!-- AI Warning Label -->
                   <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div class="bg-red-600/90 text-white px-4 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase shadow-2xl backdrop-blur-sm border border-red-400/50 flex items-center gap-2 rotate-[-2deg]">
                           <AlertTriangle class="h-4 w-4" />
                           <span>AI Generated Fake</span>
                       </div>
                   </div>
               </div>
               <p class="text-center text-[10px] text-red-600/60 mt-3 tracking-widest uppercase font-medium">
                   Exhibit A: Synthetic Media
               </p>
            </div>

            <!-- Solution Side -->
            <div class="rounded-[2.5rem] border border-green-100 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10 p-8 md:p-10 h-full">
                <div class="flex items-center gap-4 mb-8">
                    <div class="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                        <ShieldCheck class="h-6 w-6" />
                    </div>
                    <h3 class="text-2xl font-bold text-foreground tracking-tight">The Standard for Trust</h3>
                </div>
                
                <ul class="space-y-6 mb-10">
                    <li class="flex gap-4 items-start">
                        <Fingerprint class="h-6 w-6 text-green-600/60 shrink-0 mt-0.5" />
                        <div class="space-y-1">
                            <p class="text-foreground font-bold text-lg leading-tight">Digital Provenance</p>
                            <p class="text-muted-foreground text-sm leading-relaxed">We use the C2PA open standard to create a tamper-evident seal for your work. It's like a digital signature that proves your content is human-made.</p>
                        </div>
                    </li>
                    <li class="flex gap-4 items-start">
                        <CheckCircle2 class="h-6 w-6 text-green-600/60 shrink-0 mt-0.5" />
                        <div class="space-y-1">
                            <p class="text-foreground font-bold text-lg leading-tight">Verified at the Source</p>
                            <p class="text-muted-foreground text-sm leading-relaxed">By connecting with compatible cameras and tools, we verify the moment of creation. This technical link ensures your photos are authentic from the start.</p>
                        </div>
                    </li>
                </ul>

                <!-- Solution Visual -->
                <div class="relative rounded-2xl overflow-hidden border border-green-200/50 dark:border-green-900/50 shadow-lg aspect-video bg-white dark:bg-zinc-900 flex items-center justify-center group">
                    <img 
                        src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop" 
                        alt="Verified Content" 
                        class="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    <div class="text-center p-6 relative z-10">
                        <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100/80 dark:bg-green-900/50 text-green-600 dark:text-green-400 mb-4 animate-pulse backdrop-blur-sm">
                            <Fingerprint class="h-8 w-8" />
                        </div>
                        <div class="font-bold text-lg mb-1 text-foreground">Authenticity Verified</div>
                        <div class="text-xs text-muted-foreground">Signed by C2PA Standard</div>
                        <div class="mt-4 flex justify-center gap-1">
                            <div class="h-1.5 w-12 bg-green-500/20 rounded-full"></div>
                            <div class="h-1.5 w-8 bg-green-500/20 rounded-full"></div>
                        </div>
                    </div>
                    
                    <!-- Overlay Badge -->
                    <div class="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 class="h-3 w-3" />
                        <span>VALID</span>
                    </div>
                </div>
                <p class="text-center text-[10px] text-green-600/60 mt-3 tracking-widest uppercase font-medium">
                    Exhibit B: Cryptographic Proof
                </p>
            </div>
        </div>
</section>

<script>
    import { ShieldCheck, Upload, Link2, Check } from 'lucide-svelte';
    import DetectiveRobot from '$lib/components/DetectiveRobot.svelte';

    const steps = [
        {
            icon: Upload,
            title: 'You upload',
            description: 'Drop in a photo from a supported camera or editing app. We read the built-in proof and show what was captured.',
            points: [
                'Read the proof data and capture info.',
                'Capture time and camera/app details.',
                'Keep the original file intact.'
            ],
            image: 'https://images.pexels.com/photos/3762375/pexels-photo-3762375.jpeg?w=800',
            color: '#E9ECED'
        },
        {
            icon: ShieldCheck,
            title: "We check it's real",
            description: "We check it's real and not fake or AI-generated. If anything doesn't add up, it's marked unproven.",
            points: [
                'Confirm it came from the original capture.',
                'Call out edits recorded in the file.',
                'Show a clear pass/fail badge.'
            ],
            image: 'https://images.pexels.com/photos/8090132/pexels-photo-8090132.jpeg?w=800',
            color: '#FFFCEB'
        },
        {
            icon: Link2,
            title: 'Share a proof link',
            description: 'Publish a proof page with a clear badge that says it’s not fake or AI-generated.',
            points: [
                'Use the URL in bios, portfolios, and client deliveries.',
                'Details stay attached so anyone can check it’s real.',
                'Share once, earn trust everywhere.'
            ],
            image: 'https://images.pexels.com/photos/1540338/pexels-photo-1540338.jpeg?w=800',
            color: '#ECF9FD'
        }
    ];
</script>

<section id="how-it-works" class="relative py-24 sm:py-32 bg-secondary/10 overflow-hidden">
    <!-- Ambient Background Decorative Elements -->
    <div class="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[10%] left-[-10%] w-[40%] aspect-square rounded-full bg-blue-500/5 blur-3xl"></div>
        <div class="absolute bottom-[20%] right-[-10%] w-[40%] aspect-square rounded-full bg-green-500/5 blur-3xl"></div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-20 md:mb-32">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Verification Process
            </div>
            <h2 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
                How It Works
            </h2>
            <p class="text-lg md:text-xl text-muted-foreground">
                Turn a real photo into a shareable proof page. Every step keeps the proof trail intact so viewers can see it’s not fake or AI-generated.
            </p>
        </div>

        <!-- Steps Timeline -->
        <div class="relative max-w-6xl mx-auto">
            <!-- Central connecting line (Desktop only) -->
            <div class="hidden lg:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-border to-transparent -translate-x-1/2"></div>

            <div class="space-y-24 lg:space-y-32">
                {#each steps as step, i}
                    <!-- Alternating layout: even items reverse row on large screens -->
                    <div class="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-24 {i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}">
                        
                        <!-- Desktop Center Node -->
                        <div class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-background border-2 border-primary/20 rounded-full items-center justify-center shadow-sm z-20">
                            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {i + 1}
                            </div>
                        </div>

                        <!-- Text Content -->
                        <div class="flex-1 w-full relative z-10">
                            <!-- Large watermark number -->
                            <div class="absolute -top-16 -left-8 text-[12rem] font-black text-foreground/[0.03] dark:text-foreground/[0.02] select-none -z-10 leading-none tracking-tighter">
                                0{i + 1}
                            </div>
                            
                            <div class="relative">
                                <div class="inline-flex items-center justify-center p-3 rounded-2xl bg-background shadow-sm border border-border mb-6 group-hover:scale-110 transition-transform">
                                    <svelte:component this={step.icon} class="w-6 h-6 text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 class="text-3xl lg:text-4xl font-bold leading-tight text-foreground mb-4">
                                    {step.title}
                                </h3>
                                <p class="text-lg text-muted-foreground leading-relaxed mb-8">
                                    {step.description}
                                </p>
                                <ul class="space-y-4">
                                    {#each step.points as point}
                                        <li class="flex items-start gap-3 text-muted-foreground">
                                            <div class="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <Check class="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                                            </div>
                                            <span>{point}</span>
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </div>

                        <!-- Visual Content -->
                        <div class="flex-1 w-full relative group perspective">
                            <div class="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-[2rem] transform {i % 2 !== 0 ? '-rotate-3 translate-x-4' : 'rotate-3 -translate-x-4'} transition-all duration-500 group-hover:rotate-0 group-hover:translate-x-0 -z-10"></div>

                            <div class="relative rounded-[2rem] overflow-hidden shadow-2xl bg-background aspect-[4/3] border border-border/50 transform transition-all duration-500 hover:-translate-y-2">
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    class="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                                {#if i === 1}
                                    <div class="absolute inset-0 z-20 pointer-events-none">
                                        <DetectiveRobot />
                                    </div>
                                {/if}
                                
                                <div class="absolute bottom-6 left-6 z-30">
                                    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-widest shadow-lg transition-transform hover:scale-105">
                                        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                        C2PA Verified
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                {/each}
            </div>
        </div>
    </div>
</section>

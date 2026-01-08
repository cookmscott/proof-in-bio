<script>
    import { Camera, ShieldCheck, Monitor, Smartphone, Check, Info } from 'lucide-svelte';
    
    const manufacturers = [
        {
            name: "Leica",
            description: "First to integrate hardware-based signing.",
            models: ["M11-P", "SL3-S"],
            iconBg: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-600"
        },
        {
            name: "Sony",
            description: "Authenticity via firmware updates.",
            models: ["Alpha 1", "Alpha 1 II", "A7 IV", "A7S III", "A9 III"],
            note: "Requires specific firmware.",
            iconBg: "bg-zinc-100 dark:bg-zinc-800",
            iconColor: "text-zinc-900 dark:text-zinc-100"
        },
        {
            name: "Nikon",
            description: "Cloud-linked authenticity service.",
            models: ["Z6 III"],
            note: "With later firmware.",
            iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
            iconColor: "text-yellow-600"
        },
        {
            name: "Canon",
            description: "Native support in pro mirrorless.",
            models: ["EOS R1", "EOS R5 Mark II"],
            iconBg: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-700"
        },
        {
            name: "Fujifilm",
            description: "Integrated C2PA in GFX & X series.",
            models: ["GFX100S II", "X-T50"],
            iconBg: "bg-emerald-100 dark:bg-emerald-900/20",
            iconColor: "text-emerald-600"
        },
        {
            name: "Google",
            description: "Mobile credentials via Pixel Camera.",
            models: ["Pixel 10"],
            icon: Smartphone,
            iconBg: "bg-blue-100 dark:bg-blue-900/20",
            iconColor: "text-blue-500"
        }
    ];

    const software = [
        {
            category: "Adobe Ecosystem",
            tools: [
                { name: "Adobe Photoshop", description: "Supports Content Credentials metadata in edits." },
                { name: "Adobe Lightroom / Classic / Mobile", description: "Attach and preserve Content Credentials on photos." },
                { name: "Adobe Premiere Pro", description: "Supports Content Credentials for video." },
                { name: "Adobe Stock & Behance", description: "Display/preserve Content Credentials with assets." },
                { name: "Adobe Content Authenticity (Beta) & Extension", description: "Tools for applying and inspecting credentials." },
                { name: "Adobe Firefly (and APIs)", description: "Automatically apply credentials to AI-generated assets." }
            ]
        },
        {
            category: "Other Platforms & Services",
            tools: [
                { name: "Cloudinary", description: "Integrates C2PA into media management and delivery workflows." },
                { name: "Google Photos", description: "Displays C2PA metadata for compatible images." },
                { name: "LinkedIn", description: "Shows Content Credentials on images in feeds." },
                { name: "ChatGPT / OpenAI Images", description: "C2PA credentials embedded in generated images." },
                { name: "Stability AI / Google Gemini", description: "Generative AI tools with manifest support." }
            ]
        }
    ];
</script>

<section class="py-24 relative overflow-hidden" id="supported-devices">
    <!-- Subtle grid background -->
    <div class="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

    <div class="container mx-auto px-6 max-w-5xl">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6 gap-2">
                <ShieldCheck class="h-4 w-4" />
                <span>Ecosystem Support</span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight mb-6">C2PA Supported Tools</h2>
            <p class="text-xl text-muted-foreground leading-relaxed">
                From capture devices to editing software and publishing platforms, the C2PA ecosystem is growing rapidly.
            </p>
        </div>

        <!-- Hardware Cards -->
        <div class="mb-20">
            <div class="flex items-center gap-3 mb-6">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                    <Camera class="h-6 w-6" />
                </div>
                <div>
                    <h3 class="text-2xl font-bold">Capture Devices</h3>
                    <p class="text-muted-foreground">Cameras and phones that embed C2PA metadata at the moment of capture.</p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {#each manufacturers as brand}
                    <div class="group relative flex flex-col rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div class="p-6 flex-1">
                            <div class="flex items-start justify-between mb-6">
                                <div>
                                    <h3 class="text-2xl font-bold">{brand.name}</h3>
                                    <p class="text-sm text-muted-foreground mt-1">{brand.description}</p>
                                </div>
                                <div class="p-3 rounded-xl {brand.iconBg} transition-colors shrink-0">
                                    {#if brand.icon}
                                        <svelte:component this={brand.icon} class="h-6 w-6 {brand.iconColor}" />
                                    {:else}
                                        <Camera class="h-6 w-6 {brand.iconColor}" />
                                    {/if}
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supported Models</div>
                                <ul class="space-y-2.5">
                                    {#each brand.models as model}
                                        <li class="flex items-center gap-3 text-sm font-medium">
                                            <div class="rounded-full bg-primary/10 p-1">
                                                <Check class="h-3 w-3 text-primary" />
                                            </div>
                                            <span>{model}</span>
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                        
                        {#if brand.note}
                            <div class="px-6 py-4 bg-muted/50 border-t rounded-b-2xl text-xs text-muted-foreground flex items-start gap-2.5">
                                <Info class="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/70" />
                                <p>{brand.note}</p>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Software Table -->
        <div>
            <div class="flex items-center gap-3 mb-6">
                <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600">
                    <Monitor class="h-6 w-6" />
                </div>
                <div>
                    <h3 class="text-2xl font-bold">Creator & Editing Software</h3>
                    <p class="text-muted-foreground">Tools that generate, attach, or preserve C2PA Content Credentials.</p>
                </div>
            </div>

            <div class="space-y-8">
                {#each software as group}
                    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div class="bg-muted/30 px-6 py-4 border-b">
                            <h4 class="font-semibold text-lg">{group.category}</h4>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm">
                                <tbody class="divide-y">
                                    {#each group.tools as tool}
                                        <tr class="hover:bg-muted/50 transition-colors">
                                            <td class="p-6 font-semibold w-1/3 sm:w-1/4 align-top">{tool.name}</td>
                                            <td class="p-6 text-muted-foreground align-top">{tool.description}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</section>

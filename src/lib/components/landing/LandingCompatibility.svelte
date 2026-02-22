<script>
    import { tick } from 'svelte';
    import { Camera, ShieldCheck, Monitor, Smartphone, Check, Info, ChevronRight, Search } from 'lucide-svelte';
    
    const manufacturers = [
        {
            name: "Leica",
            description: "First to integrate hardware-based signing.",
            iconBg: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-600",
            models: [
                { name: "M11-P", status: "Current", implementation: "Native", details: "The world's first camera with built-in C2PA Content Credentials, setting the standard for the industry." },
                { name: "M11-D", status: "Current", implementation: "Native", details: "The second Leica model to feature native C2PA integration." },
                { name: "SL3-S", status: "Current", implementation: "Native", details: "Expands C2PA support to Leica's SL line of mirrorless cameras." },
                { name: "Q3 Monochrom", status: "Current", implementation: "Native", details: "The first camera in the Leica Q family to feature C2PA technology." }
            ]
        },
        {
            name: "Sony",
            description: "Authenticity via firmware updates.",
            iconBg: "bg-zinc-100 dark:bg-zinc-800",
            iconColor: "text-zinc-900 dark:text-zinc-100",
            models: [
                { name: "Alpha 1 (ILCE-1)", status: "Current", implementation: "Firmware v2.00+", details: "Support for still images added via firmware. Video support is planned for a future update after November 2025." },
                { name: "A7S III", status: "Current", implementation: "Firmware v3.00+", details: "Still image support added. C2PA for video is planned for a 2026 firmware update." },
                { name: "A7 IV", status: "Current", implementation: "Firmware v3.00+", details: "Still image support added via firmware. Video support planned for after November 2025." },
                { name: "A9 III", status: "Current", implementation: "Firmware v2.00+", details: "One of the first models to receive C2PA support for both still images and video." },
                { name: "Alpha 1 II", status: "Current", implementation: "Firmware v2.00+", details: "Supports C2PA for both stills and video from a recent firmware update." },
                { name: "FX3", status: "Current", implementation: "Firmware Update", details: "Part of Sony's professional cinema line, this camera now supports C2PA for video, aimed at news and broadcast industries." },
                { name: "FX30", status: "Current", implementation: "Firmware Update", details: "Alongside the FX3, this model received a firmware update to enable C2PA-compliant video authenticity." },
                { name: "A7R V", status: "Upcoming Support", implementation: "Firmware Update", details: "Sony has announced C2PA support for video will be added via a firmware update sometime after November 2025." }
            ]
        },
        {
            name: "Canon",
            description: "Native support in pro mirrorless.",
            iconBg: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-700",
            models: [
                { name: "EOS R1", status: "Current", implementation: "Native", details: "Canon's flagship professional mirrorless camera, launched with C2PA support." },
                { name: "EOS R5 Mark II", status: "Current", implementation: "Native", details: "C2PA support was included at launch for this high-end hybrid camera." }
            ]
        },
        {
            name: "Nikon",
            description: "Cloud-linked authenticity service.",
            iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
            iconColor: "text-yellow-600",
            models: [
                { name: "Z6 III", status: "Current (Suspended)", implementation: "Firmware v2.00 Beta", details: "Nikon's authenticity service was temporarily suspended in September 2025 after a vulnerability was discovered that allowed AI-generated images to be signed. All certificates issued were revoked. A fix is in development." }
            ]
        },
        {
            name: "Fujifilm",
            description: "Integrated C2PA in GFX & X series.",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/20",
            iconColor: "text-emerald-600",
            models: [
                { name: "GFX100S II", status: "Current", implementation: "Native", details: "Fujifilm announced its commitment to C2PA by including support in its new GFX and X series cameras." },
                { name: "X-T50", status: "Current", implementation: "Native", details: "Launched alongside the GFX100S II with native C2PA support." }
            ]
        },
        {
            name: "Samsung",
            description: "Mobile credentials via Galaxy AI.",
            icon: Smartphone,
            iconBg: "bg-blue-100 dark:bg-blue-900/20",
            iconColor: "text-blue-600",
            models: [
                { name: "Galaxy S25 Series", status: "Current", implementation: "Native", details: "The first smartphone lineup with native C2PA support, creating Content Credentials for images generated or edited with Galaxy AI features. Support is expanding to more devices via One UI 7." }
            ]
        },
        {
            name: "Google",
            description: "Mobile credentials via Pixel Camera.",
            icon: Smartphone,
            iconBg: "bg-blue-100 dark:bg-blue-900/20",
            iconColor: "text-blue-500",
            models: [
                { name: "Pixel 10 Series", status: "Upcoming (2025)", implementation: "Native", details: "Google announced the Pixel 10 will embed C2PA metadata by default in every photo taken with the native camera app, a major step for widespread consumer adoption." }
            ]
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

    let selectedId = manufacturers[0].name;
    let scrollContainer;
    
    async function scrollToSection(id) {
        selectedId = id;
        await tick();
        const element = document.getElementById(id);
        if (element && scrollContainer) {
            const top = element.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop;
            scrollContainer.scrollTo({ top: top - 32, behavior: 'smooth' });
        }
    }

    let searchTerm = "";

    $: filteredManufacturers = searchTerm ? manufacturers.map(brand => {
        const brandMatches = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchingModels = brand.models.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.details.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (brandMatches) return brand;
        if (matchingModels.length > 0) return { ...brand, models: matchingModels };
        return null;
    }).filter(Boolean) : manufacturers;

    $: filteredSoftware = searchTerm ? software.map(group => {
        const categoryMatches = group.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchingTools = group.tools.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (categoryMatches) return group;
        if (matchingTools.length > 0) return { ...group, tools: matchingTools };
        return null;
    }).filter(Boolean) : software;
</script>

<section class="py-24 relative overflow-hidden" id="supported-devices">
    <!-- Subtle grid background -->
    <div class="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

    <div class="container mx-auto px-6 max-w-5xl">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors border-transparent bg-primary/10 text-primary mb-6 gap-2">
                <ShieldCheck class="h-4 w-4" />
                <span>Ecosystem Support</span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight mb-6">C2PA Supported Cameras & Software</h2>
            <p class="text-xl text-muted-foreground leading-relaxed">
                Explore the growing ecosystem of cameras, software, and platforms that support Content Credentials.
            </p>
        </div>

        <div class="flex flex-col md:flex-row gap-8 lg:gap-12">
            <!-- Sidebar Navigation -->
            <nav class="w-full md:w-64 shrink-0">
                <div class="relative mb-4">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text"
                        bind:value={searchTerm}
                        placeholder="Search..."
                        class="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                    />
                </div>

                <div class="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-4 md:pb-0 no-scrollbar snap-x">
                    
                    <!-- Hardware Section -->
                    {#if filteredManufacturers.length > 0}
                        <div class="hidden md:block px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Hardware
                        </div>
                    {/if}
                    {#each filteredManufacturers as brand}
                        <button 
                            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap snap-start
                            {selectedId === brand.name ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}"
                            on:click={() => scrollToSection(brand.name)}
                        >
                            {#if brand.icon}
                                <svelte:component this={brand.icon} class="h-4 w-4" />
                            {:else}
                                <Camera class="h-4 w-4" />
                            {/if}
                            {brand.name}
                        </button>
                    {/each}

                    <!-- Software Section -->
                    {#if filteredSoftware.length > 0}
                        <div class="hidden md:block px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Software
                        </div>
                    {/if}
                    {#each filteredSoftware as group}
                        <button 
                            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap snap-start
                            {selectedId === group.category ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}"
                            on:click={() => scrollToSection(group.category)}
                        >
                            <Monitor class="h-4 w-4" />
                            {group.category}
                        </button>
                    {/each}
                </div>
            </nav>

            <!-- Main Content Area -->
            <div class="flex-1 min-w-0 bg-card rounded-2xl border shadow-sm flex flex-col h-[600px] overflow-hidden">
                <div class="flex-1 overflow-y-auto px-4 md:px-8 pb-0 md:pb-8 space-y-12 no-scrollbar scroll-smooth" bind:this={scrollContainer}>
                    {#each filteredManufacturers as brand}
                        <div id={brand.name} class="scroll-mt-6 {!searchTerm && selectedId !== brand.name ? 'hidden md:block' : ''}">
                            <div class="sticky top-0 z-10 bg-muted/50 border-b backdrop-blur-sm mb-0 md:mb-4 py-2 px-4 md:px-8 -mx-4 md:-mx-8 flex items-center gap-3">
                                <div class="p-1.5 rounded-md {brand.iconBg}">
                                    {#if brand.icon}
                                        <svelte:component this={brand.icon} class="h-4 w-4 {brand.iconColor}" />
                                    {:else}
                                        <Camera class="h-4 w-4 {brand.iconColor}" />
                                    {/if}
                                </div>
                                <h3 class="text-lg font-bold">{brand.name}</h3>
                            </div>

                            <div class="overflow-x-auto border border-border bg-background -mx-4 md:mx-0 rounded-none md:rounded-lg">
                                <table class="w-full min-w-[500px] md:min-w-0 text-sm text-left">
                                    <thead class="bg-muted/40 text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                                        <tr>
                                            <th class="px-3 md:px-4 py-3 w-[28%]">Model</th>
                                            <th class="px-3 md:px-4 py-3 w-[22%]">Implementation</th>
                                            <th class="px-3 md:px-4 py-3">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-border">
                                        {#each brand.models as model}
                                            <tr class="group hover:bg-muted/20 transition-colors">
                                                <td class="px-3 md:px-4 py-2.5 font-medium text-foreground align-top">
                                                    <div class="flex flex-col items-start gap-1.5">
                                                        <span>{model.name}</span>
                                                        {#if model.status.includes('Upcoming') || model.status.includes('Suspended')}
                                                            <span class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-colors border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 leading-none">
                                                                {model.status}
                                                            </span>
                                                        {/if}
                                                    </div>
                                                </td>
                                                <td class="px-3 md:px-4 py-2.5 align-top">
                                                    <span class="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-border/50 whitespace-nowrap">
                                                        {model.implementation}
                                                    </span>
                                                </td>
                                                <td class="px-3 md:px-4 py-2.5 text-muted-foreground align-top leading-snug">
                                                    {model.details}
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/each}

                    {#each filteredSoftware as group}
                        <div id={group.category} class="scroll-mt-6 {!searchTerm && selectedId !== group.category ? 'hidden md:block' : ''}">
                            <div class="sticky top-0 z-10 bg-muted/50 border-b backdrop-blur-sm mb-4 py-2 px-4 md:px-8 -mx-4 md:-mx-8 flex items-center gap-3">
                                <div class="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/20">
                                    <Monitor class="h-4 w-4 text-purple-600" />
                                </div>
                                <h3 class="text-lg font-bold">{group.category}</h3>
                            </div>

                            <div class="overflow-x-auto rounded-lg border border-border bg-background">
                                <table class="w-full min-w-[500px] md:min-w-0 text-sm text-left">
                                    <thead class="bg-muted/40 text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                                        <tr>
                                            <th class="px-3 md:px-4 py-3 w-[40%]">Tool / Platform</th>
                                            <th class="px-3 md:px-4 py-3">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-border">
                                        {#each group.tools as tool}
                                            <tr class="group hover:bg-muted/20 transition-colors">
                                                <td class="px-3 md:px-4 py-2.5 font-medium text-foreground align-top">
                                                    {tool.name}
                                                </td>
                                                <td class="px-3 md:px-4 py-2.5 text-muted-foreground align-top leading-snug">
                                                    {tool.description}
                                                </td>
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
    </div>
</section>

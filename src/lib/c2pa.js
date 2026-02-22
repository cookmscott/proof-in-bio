<script>
    import { 
        ShieldCheck, ShieldAlert, ShieldQuestion, 
        MinusCircle, Loader2, Info 
    } from 'lucide-svelte';

    // This is the object returned from your `analyzeProvenance(store)` function
    export let provenanceData = null; 
    export let isLoading = false;

    // 1. Determine the Trust State based on technical flags
    $: trustState = getTrustState(provenanceData, isLoading);

    function getTrustState(data, loading) {
        if (loading) return 'loading';
        if (!data || !data.hasManifest) return 'none';
        if (!data.signatureValidated) return 'invalid';
        if (!data.signingCredentialTrusted) return 'untrusted';
        return 'verified';
    }

    // 2. Map the state to Human-Readable UI configuration
    $: uiConfig = {
        'loading': {
            title: 'Checking History...',
            description: 'Scanning file for Content Credentials...',
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-50 border-blue-200',
            icon: Loader2,
            spin: true
        },
        'verified': {
            title: 'Verified History',
            description: 'This content was signed by a trusted organization and its history has not been altered.',
            colorClass: 'text-emerald-600',
            bgClass: 'bg-emerald-50 border-emerald-200',
            icon: ShieldCheck,
            spin: false
        },
        'untrusted': {
            title: 'Unverified Issuer',
            description: 'This content has a tracked history, but it was signed by an unknown or independent creator.',
            colorClass: 'text-yellow-600',
            bgClass: 'bg-yellow-50 border-yellow-200',
            icon: ShieldQuestion,
            spin: false
        },
        'invalid': {
            title: 'Invalid History',
            description: 'Warning: This content has been altered since its history was recorded, or the data is broken.',
            colorClass: 'text-red-600',
            bgClass: 'bg-red-50 border-red-200',
            icon: ShieldAlert,
            spin: false
        },
        'none': {
            title: 'No History Available',
            description: 'No Content Credentials or tracking history were found for this file.',
            colorClass: 'text-gray-500',
            bgClass: 'bg-gray-50 border-gray-200',
            icon: MinusCircle,
            spin: false
        }
    }[trustState];

</script>

<!-- UI Card Layout -->
<div class={`flex items-start p-4 rounded-lg border ${uiConfig.bgClass} transition-colors duration-300`}>
    
    <!-- Status Icon -->
    <div class={`flex-shrink-0 mt-0.5 ${uiConfig.colorClass}`}>
        <svelte:component 
            this={uiConfig.icon} 
            size={24} 
            class={uiConfig.spin ? 'animate-spin' : ''} 
        />
    </div>

    <!-- Human Readable Text -->
    <div class="ml-3 flex-1">
        <h3 class={`text-sm font-semibold ${uiConfig.colorClass}`}>
            {uiConfig.title}
        </h3>
        <p class="mt-1 text-sm text-gray-600">
            {uiConfig.description}
        </p>

        <!-- Optional: Technical Details Dropdown (Progressive Disclosure) -->
        {#if trustState !== 'none' && trustState !== 'loading' && provenanceData}
            <div class="mt-3 text-xs bg-white/60 p-2 rounded border border-black/5">
                <div class="flex items-center gap-1 font-medium text-gray-700 mb-1">
                    <Info size={14} />
                    Technical Details
                </div>
                <ul class="text-gray-600 space-y-1 ml-5 list-disc">
                    {#if provenanceData.activeSigner}
                        <li><strong>Signed by:</strong> {provenanceData.activeSigner}</li>
                    {/if}
                    <li><strong>AI Tools Used:</strong> {provenanceData.actions?.some(a => a.action.includes('AI') || a.parameters?.digitalSourceType?.includes('Algorithmic')) ? 'Yes' : 'None Detected'}</li>
                    <li><strong>Tracked Edits:</strong> {provenanceData.actions?.length || 0} changes recorded</li>
                </ul>
            </div>
        {/if}
    </div>
</div>
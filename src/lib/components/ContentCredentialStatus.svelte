<script>
	import {
		ShieldCheck,
		ShieldAlert,
		ShieldQuestion,
		MinusCircle,
		Loader2,
		Info
	} from 'lucide-svelte';

	let { provenanceData = null, isLoading = false } = $props();

	function getTrustState(data, loading) {
		if (loading) return 'loading';
		if (!data || !data.hasManifest) return 'none';
		if (!data.signatureValidated) return 'invalid';
		if (!data.signingCredentialTrusted) return 'untrusted';
		return 'verified';
	}

	let trustState = $derived(getTrustState(provenanceData, isLoading));

	let uiConfig = $derived(
		{
			loading: {
				icon: Loader2,
				title: 'Checking content credentials',
				description: 'Reading the file and validating any attached proof in your browser.',
				accent: 'text-primary',
				card: 'border-primary/20 bg-primary/5'
			},
			verified: {
				icon: ShieldCheck,
				title: 'Content credentials verified',
				description: 'This file includes a valid signed history that can be read in this viewer.',
				accent: 'text-green-600 dark:text-green-400',
				card: 'border-green-500/20 bg-green-500/5'
			},
			untrusted: {
				icon: ShieldAlert,
				title: 'Signed, but signer is not trusted here',
				description: 'A signature was found, but the signing credential is not trusted by this viewer.',
				accent: 'text-amber-600 dark:text-amber-400',
				card: 'border-amber-500/20 bg-amber-500/5'
			},
			invalid: {
				icon: ShieldAlert,
				title: 'Content credentials could not be verified',
				description: 'The file has a manifest, but the signature did not validate in this viewer.',
				accent: 'text-destructive',
				card: 'border-destructive/20 bg-destructive/5'
			},
			none: {
				icon: ShieldQuestion,
				title: 'No content credentials found',
				description: 'This file does not appear to include a C2PA manifest.',
				accent: 'text-muted-foreground',
				card: 'border-border bg-muted/20'
			}
		}[trustState]
	);

	let labelRows = $derived(
		!provenanceData
			? []
			: [
					{
						label: 'Proof Found',
						value: provenanceData.hasManifest ? 'Yes' : 'No',
						tone: provenanceData.hasManifest ? 'good' : 'muted'
					},
					{
						label: 'Signature Check',
						value: !provenanceData.hasManifest
							? 'Not available'
							: provenanceData.signatureValidated
								? 'Pass'
								: 'Could not verify',
						tone: !provenanceData.hasManifest
							? 'muted'
							: provenanceData.signatureValidated
								? 'good'
								: 'warn'
					},
					{
						label: 'Trusted Signer',
						value: !provenanceData.hasManifest
							? 'Not available'
							: provenanceData.signingCredentialTrusted
								? 'Yes'
								: 'Not trusted in this viewer',
						tone: !provenanceData.hasManifest
							? 'muted'
							: provenanceData.signingCredentialTrusted
								? 'good'
								: 'warn'
					},
					{
						label: 'Camera Capture',
						value: !provenanceData.hasManifest
							? 'Not available'
							: provenanceData.hasCaptureProvenance
								? provenanceData.captureSignatureValidated === true
									? 'Found and verified'
									: provenanceData.captureSignatureValidated == null
										? 'Found (viewer cannot confirm signature)'
										: 'Found (not verified)'
								: 'Not found',
						tone: !provenanceData.hasManifest
							? 'muted'
							: provenanceData.hasCaptureProvenance
								? 'good'
								: 'warn'
					},
					{
						label: 'AI Tools Used',
						value: !provenanceData.hasManifest
							? 'Not available'
							: provenanceData.has_ai
								? 'Yes'
								: 'None detected',
						tone: !provenanceData.hasManifest ? 'muted' : provenanceData.has_ai ? 'warn' : 'good'
					}
				]
	);

	function rowToneClass(tone) {
		if (tone === 'good') return 'text-green-700 dark:text-green-300';
		if (tone === 'warn') return 'text-amber-700 dark:text-amber-300';
		return 'text-muted-foreground';
	}
</script>

<div class="rounded-xl border p-4 md:p-5 space-y-4 {uiConfig.card}">
	<div class="flex items-start gap-3">
		<div class="mt-0.5 shrink-0">
			<svelte:component
				this={uiConfig.icon}
				class="h-5 w-5 {uiConfig.accent} {trustState === 'loading' ? 'animate-spin' : ''}"
			/>
		</div>
		<div class="min-w-0">
			<p class="text-sm font-semibold leading-tight">{uiConfig.title}</p>
			<p class="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
				{uiConfig.description}
			</p>
		</div>
	</div>

	<div class="rounded-lg border bg-background/80 overflow-hidden">
		<div class="px-3 py-2 border-b bg-muted/40">
			<p class="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
				Content Credential Summary
			</p>
		</div>

		<div class="divide-y">
			{#each labelRows as row}
				<div class="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start px-3 py-2.5">
					<p class="text-xs md:text-sm font-medium text-foreground">{row.label}</p>
					<p class="text-xs md:text-sm text-right leading-relaxed {rowToneClass(row.tone)}">
						{row.value}
					</p>
				</div>
			{/each}
		</div>
	</div>

	{#if provenanceData?.hasManifest}
		<div class="rounded-lg border bg-background/70 p-3 space-y-2">
			<p class="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
				Who Signed It
			</p>
			<ul class="space-y-2 text-xs md:text-sm text-muted-foreground">
				<li class="flex items-start gap-2">
					<Info class="h-3.5 w-3.5 mt-0.5 shrink-0" />
					<span>
						<strong class="text-foreground font-medium">Current file signer:</strong>
						{provenanceData.activeSigner || 'Unknown'}
					</span>
				</li>
				{#if provenanceData.captureSigner && provenanceData.captureSigner !== provenanceData.activeSigner}
					<li class="flex items-start gap-2">
						<MinusCircle class="h-3.5 w-3.5 mt-0.5 shrink-0" />
						<span>
							<strong class="text-foreground font-medium">Original camera signer:</strong>
							{provenanceData.captureSigner}
						</span>
					</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>

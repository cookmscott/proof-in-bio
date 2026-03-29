<script lang="ts">
	import { Button } from '$lib/ui/button/index.js';
	import * as Accordion from '$lib/ui/accordion/index.js';

	const features = [
		{
			title: 'Unlimited uploads',
			body: 'No caps, no compression. Upload full-resolution originals and never worry about space.'
		},
		{
			title: 'Instant gallery',
			body: 'Your photos become a clean, minimal portfolio. Share everything with one link.'
		},
		{
			title: 'Verified originals',
			body: 'Every upload is verified via C2PA, so your work is provably and permanently yours.'
		}
	];

	const steps = [
		{
			number: '1',
			tag: 'Capture',
			title: 'Shoot with a supported camera',
			body: 'The camera signs a credential the moment you press the shutter — recording the device, time, and location.',
			logos: ['Sony', 'Leica', 'Nikon', 'Google']
		},
		{
			number: '2',
			tag: 'Edit',
			title: 'Edit in supported software',
			body: 'Each adjustment is added to the credential chain — crops, retouches, exports, all accounted for.',
			logos: ['Lightroom', 'Photoshop']
		},
		{
			number: '3',
			tag: 'Upload',
			title: 'Verified = unlimited',
			body: "We read the full credential chain. An unbroken chain means it's real — and your uploads are unlimited.",
			logos: []
		}
	];

	const faqs = [
		{
			value: 'c2pa',
			question: 'What is C2PA?',
			answer:
				'C2PA embeds tamper-evident metadata into your photo at capture — recording how, when, and on what device it was taken.'
		},
		{
			value: 'devices',
			question: 'Which devices are compatible?',
			answer:
				'Recent models from Sony, Leica, Nikon, and select Samsung and Google devices. A full compatibility list is in your account settings.'
		},
		{
			value: 'editing',
			question: 'Can I edit my photos before uploading?',
			answer:
				'Yes. Lightroom, Photoshop, and other C2PA-aware tools log each adjustment in the chain. As long as the chain stays intact, your edits are fully supported.'
		},
		{
			value: 'free',
			question: 'Is it really free?',
			answer:
				'Yes. Verified photos get unlimited uploads and a public gallery. Optional paid tiers add custom domains, analytics, and print integrations.'
		}
	];
</script>

<svelte:head>
	<title>Real — Unlimited Photo Storage</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,600;0,8..60,700;1,8..60,400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page">
	<main>
		<!-- HERO -->
		<header class="section" style="padding-top: 7rem; padding-bottom: 5rem;">
			<p class="mono eyebrow">[ Made by people, not by prompts ]</p>
			<h1>Unlimited storage<br />for real photography.</h1>
			<p class="hero-sub">
				Upload every photo you've ever taken — full resolution, no compression, no limits.
			</p>
			<p class="mono device-note">* For C2PA-compatible cameras and devices only</p>
			<Button href="#join" class="cta-btn">Get started free</Button>
			<span class="mono hint">No credit card required</span>

			<!-- Wireframe mockup -->
			<div class="wire-window">
				<div class="wire-bar">
					<div class="wire-dot red"></div>
					<div class="wire-dot"></div>
					<div class="wire-dot"></div>
				</div>
				<div class="wire-grid">
					<div class="wire-thumb"></div>
					<div class="wire-thumb"></div>
					<div class="wire-thumb span2 tint1"></div>
					<div class="wire-thumb"></div>
					<div class="wire-thumb span2 tint2"></div>
					<div class="wire-thumb"></div>
					<div class="wire-thumb"></div>
					<div class="wire-thumb"></div>
					<div class="wire-thumb span2 tint1"></div>
				</div>
			</div>
		</header>

		<hr />

		<!-- FEATURES -->
		<section class="section">
			<p class="mono section-label"><span class="red">01</span> Features</p>
			<h2>Everything you need. Nothing you don't.</h2>
			<div class="bordered-grid cols-3">
				{#each features as feat}
					<div class="bordered-cell">
						<h3 class="mono cell-title">{feat.title}</h3>
						<p class="cell-body">{feat.body}</p>
					</div>
				{/each}
			</div>
		</section>

		<hr />

		<!-- HOW IT WORKS -->
		<section id="how-it-works" class="section">
			<p class="mono section-label"><span class="red">02</span> How it works</p>
			<h2>Photos with a proof trail.</h2>
			<p class="how-intro">
				C2PA is tamper-evident metadata baked into a photo at the moment of capture. It records
				<em>who</em> took it, <em>what</em> device was used, and <em>every edit</em> that followed —
				cryptographically signed. If your camera and editing software support it, you get unlimited
				uploads.
			</p>

			<!-- Steps -->
			<div class="bordered-grid cols-3" style="margin-bottom: 1.25rem;">
				{#each steps as step}
					<div class="bordered-cell" style="text-align: left;">
						<div class="step-header">
							<div class="step-num mono">{step.number}</div>
							<span class="mono step-tag">{step.tag}</span>
						</div>
						<h4>{step.title}</h4>
						<p class="cell-body">{step.body}</p>
						{#if step.logos.length}
							<div class="logo-row">
								{#each step.logos as logo}
									<span class="mono logo-chip">{logo}</span>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Rules -->
			<div class="bordered-grid cols-2">
				<div class="bordered-cell" style="text-align: left; display: flex; gap: 1rem; align-items: flex-start;">
					<span class="mono rule-mark yes">[Y]</span>
					<div>
						<h4 class="rule-title">Edits are welcome</h4>
						<p class="cell-body">Crop, exposure, color grading — traditional post-processing is fully supported and tracked.</p>
					</div>
				</div>
				<div class="bordered-cell" style="text-align: left; display: flex; gap: 1rem; align-items: flex-start;">
					<span class="mono rule-mark no">[N]</span>
					<div>
						<h4 class="rule-title">AI manipulation is not</h4>
						<p class="cell-body">Any break in the provenance chain prevents the photo from being published. No exceptions.</p>
					</div>
				</div>
			</div>
		</section>

		<hr />

		<!-- CTA -->
		<section id="join" class="section">
			<p class="mono section-label"><span class="red">03</span> Get started</p>
			<h2 class="cta-h2">Your photos deserve a real home.</h2>
			<p class="cta-sub">Create your free account in under a minute. No credit card, no strings.</p>
			<Button href="#" class="cta-btn">Create Account</Button>
			<span class="mono hint">Free forever — upgrade anytime.</span>
		</section>

		<hr />

		<!-- FAQ -->
		<section class="section">
			<p class="mono section-label"><span class="red">04</span> FAQ</p>
			<h2>Common questions.</h2>
			<div class="faq-wrap">
				<Accordion.Root type="single" collapsible class="faq-root">
					{#each faqs as faq}
						<Accordion.Item value={faq.value} class="faq-item">
							<Accordion.Trigger class="faq-trigger">
								{faq.question}
							</Accordion.Trigger>
							<Accordion.Content class="faq-content">
								<p>{faq.answer}</p>
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</div>
		</section>
	</main>

	<footer>
		<p class="mono">&copy; 2026 Real.</p>
		<ul>
			<li><a href="/">Privacy</a></li>
			<li><a href="/">Terms</a></li>
			<li><a href="mailto:hello@real.gallery">Contact</a></li>
		</ul>
	</footer>
</div>

<style>
	/* ── TOKENS ── */
	:global(:root) {
		--serif: 'Source Serif 4', 'Times New Roman', Georgia, serif;
		--mono: 'Courier New', Courier, monospace;
		--sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
		--r: 6px;
	}

	/* ── BASE ── */
	.page {
		--ink: var(--foreground);
		--bg: var(--background);
		--muted: var(--muted-foreground);
		--edge: var(--border);
		--light: var(--accent);
		--surface: var(--card);
		--surface-ink: var(--card-foreground);
		--highlight: var(--primary);
		--highlight-ink: var(--primary-foreground);
		background: var(--bg);
		color: var(--ink);
		font-family: var(--sans);
		font-size: 16px;
		line-height: 1.6;
		text-align: center;
		-webkit-font-smoothing: antialiased;
	}

	h1, h2, h4 { font-family: var(--serif); font-weight: 700; }

	.mono {
		font-family: var(--mono);
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	/* ── LAYOUT ── */
	.section {
		max-width: 800px;
		margin: 0 auto;
		padding: 6rem 1.5rem;
	}

	hr {
		border: none;
		border-top: 1px solid var(--edge);
		max-width: 800px;
		margin: 0 auto;
	}

	/* ── SECTION LABELS ── */
	.section-label { margin-bottom: 1.25rem; }
	.red { color: var(--highlight); }

	/* ── HERO ── */
	.eyebrow { color: var(--highlight); margin-bottom: 1.5rem; }

	h1 {
		font-size: clamp(2.6rem, 6.5vw, 4.8rem);
		letter-spacing: -0.025em;
		line-height: 1.07;
		margin-bottom: 1.4rem;
	}

	.hero-sub {
		max-width: 460px;
		margin: 0 auto 0.5rem;
		font-size: 1.05rem;
		color: var(--muted);
		line-height: 1.65;
	}

	.device-note {
		margin-bottom: 2rem;
		opacity: 0.65;
	}

	/* CTA button — override shadcn */
	:global(.cta-btn) {
		font-size: 0.95rem !important;
		font-weight: 500 !important;
		border: 1px solid var(--highlight) !important;
		border-radius: var(--r) !important;
		background: var(--highlight) !important;
		color: var(--highlight-ink) !important;
		padding: 0.75rem 2.2rem !important;
		height: auto !important;
		transition: background 0.2s, color 0.2s, border-color 0.2s !important;
		box-shadow: none !important;
	}
	:global(.cta-btn:hover) {
		background: color-mix(in srgb, var(--highlight) 88%, black) !important;
		border-color: color-mix(in srgb, var(--highlight) 88%, black) !important;
		color: var(--highlight-ink) !important;
	}

	.hint {
		display: block;
		margin-top: 0.85rem;
		opacity: 0.6;
	}

	/* ── WIREFRAME ── */
	.wire-window {
		margin: 3.5rem auto 0;
		max-width: 560px;
		border: 1px solid var(--edge);
		border-radius: var(--r);
		overflow: hidden;
		text-align: left;
	}

	.wire-bar {
		border-bottom: 1px solid var(--edge);
		padding: 7px 12px;
		display: flex; gap: 6px; align-items: center;
		background: var(--light);
	}

	.wire-dot {
		width: 10px; height: 10px;
		border: 1px solid var(--edge);
		border-radius: 50%;
		background: var(--surface);
	}
	.wire-dot.red { background: var(--highlight); border-color: var(--highlight); }

	.wire-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1px;
		background: var(--edge);
		padding: 1px;
		height: 185px;
	}

	.wire-thumb { background: var(--surface); }
	.wire-thumb.span2 { grid-column: span 2; }
	.wire-thumb.tint1 { background: var(--light); }
	.wire-thumb.tint2 { background: color-mix(in srgb, var(--light) 45%, var(--surface)); }

	/* ── SECTION H2 ── */
	h2 {
		font-size: clamp(1.8rem, 3.5vw, 2.6rem);
		letter-spacing: -0.02em;
		line-height: 1.15;
		margin-bottom: 2.5rem;
	}

	/* ── BORDERED GRID (shared-border pattern) ── */
	.bordered-grid {
		border: 1px solid var(--edge);
		border-radius: var(--r);
		overflow: hidden;
		display: grid;
	}

	.bordered-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
	.bordered-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }

	.bordered-cell {
		padding: 1.75rem 1.5rem;
		border-right: 1px solid var(--edge);
	}
	.bordered-cell:last-child { border-right: none; }

	.cell-title {
		font-size: 0.8rem;
		margin-bottom: 0.85rem;
	}

	.cell-body {
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.65;
	}

	/* ── STEPS ── */
	.step-header {
		display: flex; align-items: center; gap: 0.7rem;
		margin-bottom: 1rem;
	}

	.step-num {
		width: 28px; height: 28px;
		border: 1px solid var(--edge);
		border-radius: 4px;
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
	}

	.step-tag { font-size: 0.68rem; letter-spacing: 0.08em; }

	.bordered-cell h4 {
		font-family: var(--serif);
		font-size: 1.05rem; font-weight: 700;
		margin-bottom: 0.45rem;
		line-height: 1.25;
	}

	.logo-row {
		margin-top: 1rem;
		display: flex; flex-wrap: wrap; gap: 0.4rem;
	}

	.logo-chip {
		font-size: 0.62rem;
		border: 1px solid var(--edge);
		border-radius: 3px;
		padding: 0.2rem 0.5rem;
		color: var(--muted);
		background: color-mix(in srgb, var(--surface) 84%, var(--highlight) 16%);
	}

	/* ── RULES ── */
	.rule-mark { font-size: 0.85rem; font-weight: bold; padding-top: 2px; flex-shrink: 0; }
	.rule-mark.yes { color: var(--highlight); }
	.rule-mark.no  { color: var(--highlight); }

	.rule-title {
		font-family: var(--sans);
		font-weight: 600;
		font-size: 0.92rem;
		margin-bottom: 0.3rem;
	}

	/* ── CTA ── */
	.cta-h2 {
		font-size: clamp(2rem, 4.5vw, 3.2rem);
		letter-spacing: -0.02em;
		line-height: 1.1;
		margin-bottom: 0.85rem;
	}

	.cta-sub {
		font-size: 0.95rem;
		color: var(--muted);
		max-width: 360px;
		margin: 0 auto 2rem;
		line-height: 1.65;
	}

	/* ── FAQ ── */
	.faq-wrap {
		max-width: 580px;
		margin: 0 auto;
		text-align: left;
	}

	:global(.faq-root) {
		border: 1px solid var(--edge);
		border-radius: var(--r);
		overflow: hidden;
		background: var(--surface);
		color: var(--surface-ink);
	}

	:global(.faq-item) {
		border-bottom: 1px solid var(--edge) !important;
	}
	:global(.faq-item:last-child) {
		border-bottom: none !important;
	}

	:global(.faq-trigger) {
		font-family: var(--sans) !important;
		font-size: 0.95rem !important;
		font-weight: 400 !important;
		padding: 1.4rem 1.25rem !important;
		color: var(--ink) !important;
		text-decoration: none !important;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		background: none;
		border: none;
	}

	/* Replace shadcn chevron with [+]/[-] */
	:global(.faq-trigger > svg) { display: none !important; }
	:global(.faq-trigger::after) {
		content: '[+]';
		font-family: var(--mono);
		font-size: 0.9rem;
		color: var(--highlight);
		flex-shrink: 0;
	}
	:global(.faq-trigger[data-state='open']::after) { content: '[-]'; }

	:global(.faq-content) {
		padding: 0 1.25rem !important;
	}
	:global(.faq-content p) {
		font-size: 0.88rem;
		color: var(--muted);
		line-height: 1.7;
		padding-bottom: 1.4rem;
	}

	/* ── FOOTER ── */
	footer {
		border-top: 1px solid var(--edge);
		max-width: 800px;
		margin: 0 auto;
		padding: 1.75rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	footer ul {
		list-style: none;
		display: flex;
		gap: 1.75rem;
	}

	footer a {
		font-family: var(--mono);
		font-size: 0.75rem;
		color: var(--muted);
		text-decoration: none;
		transition: color 0.2s;
	}
	footer a:hover { color: var(--ink); }

	/* ── HOW IT WORKS intro ── */
	.how-intro {
		max-width: 520px;
		margin: -1.5rem auto 2.5rem;
		font-size: 0.97rem;
		color: var(--muted);
		line-height: 1.75;
	}
	.how-intro em { font-style: italic; color: var(--ink); }

	/* ── RESPONSIVE ── */
	@media (max-width: 680px) {
		.bordered-grid.cols-3,
		.bordered-grid.cols-2 { grid-template-columns: 1fr; }

		.bordered-cell {
			border-right: none;
			border-bottom: 1px solid var(--edge);
		}
		.bordered-cell:last-child { border-bottom: none; }

		footer { flex-direction: column; gap: 1.25rem; text-align: center; }
		footer ul { justify-content: center; }
	}
</style>

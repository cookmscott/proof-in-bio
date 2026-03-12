<script>
	import { BadgeCheck, Camera, WandSparkles, ArrowRight, ShieldCheck } from 'lucide-svelte';

	const photoFiles = [
		'19_Wing_Comox_2025_SAREX_(9353410).jpg',
		'19_Wing_Comox_2025_SAREX_(9353415).jpg',
		'241210_pmtrac_gen38_starkholzruecken_2.jpg',
		'309th_expeditionary_depot_team_maximizes_F-16_resources_(8940513).jpg',
		'A._H._Chapman_House_Chico_(2025)-L1007056.jpg',
		'AMISTAD_2025-_Salvadoran_service_members_apply_TCCC_during_mass_casualty_exercise_(9126276).jpg',
		'AMISTAD_2025-_U_S_Air_Force_medical_personnel_observe_surgical_procedure_in_El_Salvador_(9130205).jpg',
		'A_bowl_of_ramen_in_Osaka_Japan.jpg',
		'A_restaurant_in_Dotonbori_Osaka_Japan.jpg',
		'Air_Force_delivers_first_dental_care_to_Tarumandy_(9271087).jpg',
		'AmericaFest_2025_-_Zeitgeist_14.jpg',
		'Army_SOF_Readiness_Review_with_National_Leaders_(9107558).jpg',
		'Borries_von_Notz_2025_01.jpg',
		'CARAT_Brunei_25_Morale_Welfare_and_Recreation_event_(9418696).jpg',
		'CASSINA_Dudet_Patricia_Urquiola_ph_Francesco_Dolfo_2.jpg',
		'COP30_-_Protests_17.jpg',
		"Captain_TaRail_A_Vernon's_Patient_Informational_Minute_with_Dr_Rosy_Aiello_(8878691).jpg",
		'Caretos_Starting_the_Bonfire.jpg',
		'Christmas_in_Raleigh_suburbs_(54984839142).jpg',
		'DougKaye-USF-Dance-20241120-00640-topaz.jpg',
		'Ethan_Strand_wins_the_mile_at_Boston_University_John_Thomas_Terrier_Classic_breaking_the_NCAA_indoor_mile_record.jpg',
		'F-22_Raptor_Aerial_Demonstration_Team_performs_at_FIDAE_2024_(9480101).jpg',
		'FC_Seoul_v_Melbourne_City_10-12-25.jpg',
		'Foto_Profil_Andien_Aisyah_(cropped).jpg',
		'GTW2024.jpg',
		"Ghost_Brigade's_equipment_arrives_on_the_Peninsula_(8667716).jpg",
		'Giant_Claw_(Keith_Rankin)_performing_Die_Endlessly.jpg',
		'Hokuhoku_train_EchigoYuzawa_202601_03.jpg',
		'James_Cameron_13_Dec_2025.jpg',
		'Japanese_grapes_sold_at_a_market_in_Tokyo_Japan.jpg',
		'Judge_beating_a_protester_(Royal_Courts_of_Justice).jpg',
		'Kegon_Falls_Nikko_National_Park_Japan1.jpg',
		'North_Saskatchewan_River_and_downtown_Edmonton_Alberta_Canada3.jpg',
		'Porto_-_Haja_vergonha.jpg',
		'Porto_-_Palacio_da_Bolsa_(54937672507).jpg',
		'Porto_-_rio_Douro_-_54943668095.jpg',
		'Prescribed_fire_operations_in_Saskatchewan_Alberta_Canada5.jpg',
		'Quays_Theatre_empty.jpg',
		'Umi_to_Sora_no_Ouchi_1F_play_hall_Yokohama.jpg',
		'W7370_Caterham_Super7_BJ_Italiennes2025_20251005_095103497PXL.jpg'
	];

	let isExpanded = false;
	const collapsedCount = 12;

	const toPhotoUrl = (filename) => `/landing/c2pa_photos/${encodeURIComponent(filename)}`;
	const toAltText = (filename) => filename.replace(/\.[^.]+$/, '').replaceAll('_', ' ');

	const captureLogos = [
		{ name: 'Leica', src: '/landing/manufactuer_icons/leica_icon.svg' },
		{ name: 'Sony', src: '/landing/manufactuer_icons/sony_icon.webp' },
		{ name: 'Google', src: '/landing/manufactuer_icons/google_icon.png' }
	];
	const editLogos = [
		{ name: 'Lightroom', src: '/landing/manufactuer_icons/lighroom_icon.svg.png' },
		{ name: 'Photoshop', src: '/landing/manufactuer_icons/photoshop_icon.webp' },
		{ name: 'Google', src: '/landing/manufactuer_icons/google_icon.png' }
	];
	const verifyLogos = [{ name: 'Proof in Bio', src: '/cr_icon.svg' }];

	const toggleExpanded = () => {
		isExpanded = !isExpanded;
	};
</script>

<section class="relative py-28 sm:py-36 bg-background overflow-hidden">
	<!-- Subtle background texture -->
	<div class="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23888%22 fill-opacity=%221%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
	</div>

	<div class="container mx-auto px-6 relative">
		<!-- ─── Intro / Hero Block ─── -->
		<div class="max-w-4xl mx-auto mb-20 sm:mb-24">
			<!-- Small badge -->
			<div class="flex justify-center mb-8">
				<div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
					</span>
					<span class="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
						Built on C2PA
					</span>
				</div>
			</div>

			<!-- Headline -->
			<h2 class="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
				Photos with a
				<span class="relative inline-block">
					<span class="relative z-10">proof trail</span>
					<span class="absolute bottom-1 left-0 w-full h-3 bg-emerald-500/20 rounded-sm -z-0"></span>
				</span>
			</h2>

			<!-- Sub-copy: short, punchy, scannable -->
			<p class="mt-6 text-center text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
				Content Credentials are tamper-evident metadata baked into a photo at the moment of capture.
				They record <em>who</em> took it, <em>what</em> device was used, and <em>every edit</em> that followed — cryptographically signed and impossible to fake.
			</p>

			<p class="mt-4 text-center text-base text-muted-foreground/80 max-w-xl mx-auto">
				Proof in Bio reads that chain of trust and turns it into a visible
				<img src="/cr_icon.svg" alt="CR" class="inline h-4 w-4 -mt-0.5 mx-0.5 opacity-80" />
				badge on your profile — so visitors know your work is real at a glance.
			</p>
		</div>

		<!-- ─── 3-Step Pipeline ─── -->
		<div class="max-w-5xl mx-auto mb-24 sm:mb-28">
			<div class="grid gap-5 md:grid-cols-3 relative">
				<!-- Step 1 — Capture -->
				<div class="step-card group relative rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.06] to-card p-6 shadow-sm">
					<div class="mb-4 flex items-center gap-3">
						<span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-sm shadow-emerald-500/25">
							1
						</span>
						<span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/25 bg-card text-emerald-600 dark:text-emerald-400">
							<Camera class="h-4 w-4" />
						</span>
					</div>
					<p class="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-2">
						Capture
					</p>
					<p class="text-base font-semibold text-foreground">Shoot with a supported camera</p>
					<p class="mt-1.5 text-sm text-muted-foreground leading-relaxed">
						The camera signs a credential at the exact moment you press the shutter — recording the device, time, and location.
					</p>
					<div class="mt-5 flex flex-wrap gap-2">
						{#each captureLogos as logo}
							<span class="inline-flex h-9 w-12 items-center justify-center rounded-lg border border-zinc-200/80 bg-white px-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
								<img src={logo.src} alt={logo.name + ' logo'} class="h-5 w-auto object-contain" loading="lazy" />
							</span>
						{/each}
					</div>
				</div>

				<!-- Step 2 — Edit -->
				<div class="step-card group relative rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.06] to-card p-6 shadow-sm">
					<div class="mb-4 flex items-center gap-3">
						<span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white shadow-sm shadow-sky-500/25">
							2
						</span>
						<span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/25 bg-card text-sky-600 dark:text-sky-400">
							<WandSparkles class="h-4 w-4" />
						</span>
					</div>
					<p class="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400 mb-2">
						Edit
					</p>
					<p class="text-base font-semibold text-foreground">Edit in supported software</p>
					<p class="mt-1.5 text-sm text-muted-foreground leading-relaxed">
						Each adjustment is logged as a new entry in the credential chain — crops, retouches, exports, all accounted for.
						<a href="#supported-devices" class="underline decoration-dotted underline-offset-4 hover:text-foreground transition-colors">See full list</a>.
					</p>
					<div class="mt-5 flex flex-wrap gap-2">
						{#each editLogos as logo}
							<span class="inline-flex h-9 w-12 items-center justify-center rounded-lg border border-zinc-200/80 bg-white px-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
								<img src={logo.src} alt={logo.name + ' logo'} class="h-5 w-auto object-contain" loading="lazy" />
							</span>
						{/each}
					</div>
				</div>

				<!-- Step 3 — Verify -->
				<div class="step-card group relative rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.06] to-card p-6 shadow-sm">
					<div class="mb-4 flex items-center gap-3">
						<span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white shadow-sm shadow-violet-500/25">
							3
						</span>
						<span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/25 bg-card text-violet-600 dark:text-violet-400">
							<BadgeCheck class="h-4 w-4" />
						</span>
					</div>
					<p class="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-400 mb-2">
						Verify
					</p>
					<p class="text-base font-semibold text-foreground">
						<img src="/cr_icon.svg" alt="CR" class="inline h-4 w-4 -mt-0.5 mr-1" />
						badge = verified
					</p>
					<p class="mt-1.5 text-sm text-muted-foreground leading-relaxed">
						Proof in Bio validates the full credential chain and shows the
						<img src="/cr_icon.svg" alt="CR" class="inline h-3.5 w-3.5 -mt-0.5 mx-0.5 opacity-70" />
						mark on your profile so visitors instantly know it's legit.
					</p>
					<div class="mt-5 flex flex-wrap gap-2">
						{#each verifyLogos as logo}
							<span class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
								<img src={logo.src} alt={logo.name + ' logo'} class="h-5 w-5 object-contain" loading="lazy" />
								{logo.name}
							</span>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- ─── Photo Gallery ─── -->
		<div class="max-w-6xl mx-auto">
			<div class="flex items-center justify-between mb-8">
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">
						Already verified
					</p>
					<h3 class="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
						{photoFiles.length} photos with credentials
					</h3>
				</div>
				<div class="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
					<ShieldCheck class="h-4 w-4 text-emerald-500" />
					<span>All C2PA verified</span>
				</div>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
				{#each isExpanded ? photoFiles : photoFiles.slice(0, collapsedCount) as filename}
					<figure class="photo-card group relative overflow-hidden rounded-xl border border-border/40 bg-card">
						<div class="relative">
							<img
								src={toPhotoUrl(filename)}
								alt={toAltText(filename)}
								loading="lazy"
								class="h-44 md:h-52 w-full object-cover"
							/>
							<!-- CR badge overlay -->
							<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<div class="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md">
									<img src="/cr_icon.svg" alt="CR" class="h-3 w-3" />
									Verified
								</div>
							</div>
						</div>
						<figcaption class="px-3 py-2 text-[11px] text-muted-foreground truncate">
							{toAltText(filename)}
						</figcaption>
					</figure>
				{/each}
			</div>

			{#if photoFiles.length > collapsedCount}
				<div class="mt-10 flex justify-center">
					<button
						type="button"
						class="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
						on:click={toggleExpanded}
					>
						{isExpanded ? 'Show less' : `Show all ${photoFiles.length} photos`}
						{#if !isExpanded}
							<ArrowRight class="h-3.5 w-3.5" />
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.step-card {
		transition: transform 220ms ease, box-shadow 220ms ease;
	}
	.step-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	.photo-card {
		transition: transform 220ms ease, box-shadow 220ms ease;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	}
	.photo-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
	}
</style>

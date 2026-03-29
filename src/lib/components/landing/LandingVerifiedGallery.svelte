<script>
	import { ArrowRight, ShieldCheck } from 'lucide-svelte';

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

	const toggleExpanded = () => {
		isExpanded = !isExpanded;
	};
</script>

<section class="py-24 sm:py-28 bg-background">
	<div class="container mx-auto max-w-5xl px-6">
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
				<ShieldCheck class="h-4 w-4 text-verified" />
				<span>All C2PA verified</span>
			</div>
		</div>

		<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
			{#each isExpanded ? photoFiles : photoFiles.slice(0, collapsedCount) as filename}
				<figure
					class="photo-card group relative overflow-hidden rounded-xl border border-border/40 bg-card"
				>
					<div class="relative">
						<img
							src={toPhotoUrl(filename)}
							alt={toAltText(filename)}
							loading="lazy"
							class="h-44 md:h-52 w-full object-cover"
						/>
						<div
							class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
						>
							<div
								class="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md"
							>
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
</section>

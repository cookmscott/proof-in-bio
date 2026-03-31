<script>
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '$lib/ui/accordion';

	const faqs = [
		{
			question: 'What is Proof in Bio?',
			answer:
				'Proof in Bio gives your photos a permanent proof page that shows where they came from and how they were edited. It turns invisible metadata into something anyone can understand and trust.'
		},
		{
			question: 'How do you verify that a photo is real?',
			answer:
				'We read Content Credentials (C2PA) embedded in your image. If the file has a valid capture and edit history, we preserve it and display it clearly on your proof page.'
		},
		{
			question: 'What kind of photos can I upload?',
			answer:
				'You can upload photos from supported cameras or apps that include Content Credentials. If the proof chain is intact, your image will be marked as verified.'
		},
		{
			question: 'Why not just post on Instagram or my portfolio site?',
			answer:
				'Most platforms strip or hide metadata. Your proof page keeps that information intact and shareable — so editors, clients, and collectors can trust your work before they even ask.'
		}
	];
</script>

<section class="bg-background py-24">
	<div class="container mx-auto max-w-4xl px-6">
		<div class="mx-auto mb-10 max-w-3xl text-center">
			<p class="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">FAQ</p>
			<h2 class="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
				Questions people ask before they trust the proof.
			</h2>
		</div>

		<div class="rounded-[1.75rem] border border-border/80 bg-card/60 px-6 py-3 shadow-sm backdrop-blur-sm sm:px-8">
			<Accordion type="single" collapsible class="w-full">
				{#each faqs as faq, index (faq.question)}
					<AccordionItem value={`faq-${index}`} class="border-border/80">
						<AccordionTrigger class="py-5 text-lg font-semibold text-foreground hover:no-underline">
							{faq.question}
						</AccordionTrigger>
						<AccordionContent class="pb-5 text-base leading-8 text-muted-foreground">
							{faq.answer}
						</AccordionContent>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	</div>
</section>

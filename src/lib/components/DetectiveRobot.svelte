<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	let scene; // The container for the whole scene

	onMount(() => {
		const ctx = gsap.context(() => {
			// 1. Robot "Blinking" Animation (loops independently)
			const blinkTl = gsap.to('.robot-eye-single', {
				scaleY: 0.1,
				duration: 0.1,
				repeat: -1,
				yoyo: true,
				repeatDelay: 3,
				transformOrigin: 'center center',
				ease: 'power1.inOut',
				paused: true
			});

			// --- NEW: Set initial "Hmm" face state ---
			gsap.set('.robot-mouth', { width: 8, height: 8, borderRadius: '50%', top: '45px' });
			gsap.set('.robot-eyebrow', { opacity: 1 });
			gsap.set('.left-eyebrow', { y: -5, rotation: 10 });
			gsap.set('.right-eyebrow', { y: 2, rotation: -5 });

			// 2. Antenna Light "Blinking" (loops independently)
			gsap.to('.robot-antenna::after', {
				opacity: 0.3,
				duration: 0.7,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});

			// 3. Robot "Idle Hover" Animation (this will be the base "Hmm" state)
			gsap.set('.robot', { x: 0, y: -200, rotation: 0 });
			const hoverTl = gsap
				.timeline({
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut',
					onStart: () => blinkTl.resume(),
					onReverseComplete: () => blinkTl.resume()
				})
				.to('.robot', { y: -215, duration: 1.5 })
				.to('.robot', { rotation: -5, duration: 1.5 }, '<');

			hoverTl.play();

			// 4. Main Scanning Sequence
			const mainScanTl = gsap.timeline({
				repeat: -1,
				repeatDelay: 0.5,
				onStart: () => {
					hoverTl.pause();
					blinkTl.pause();
					gsap.set('.robot-eye-single', { scaleY: 1 });
				},
				onComplete: () => {
					hoverTl.resume();
				}
			});

			const imageTop = -205;
			const imageBottom = 205;
			const imageLeft = -200;

			mainScanTl
				// --- Robot moves from idle ("Hmm" state) to scan start position ---
				.to(
					'.robot',
					{
						x: imageLeft - 50,
						y: imageTop,
						rotation: 15,
						duration: 1.2,
						ease: 'power2.inOut'
					},
					'startScan'
				) // Start robot movement

				// --- EXPRESSION: "Hmm" -> "Discerning" (Detective Look) ---
				.to(
					'.left-eyebrow',
					{
						y: -1,
						rotation: 5,
						x: -3,
						duration: 0.5,
						ease: 'power2.inOut'
					},
					'startScan+=0.2'
				)
				.to(
					'.right-eyebrow',
					{
						y: 1,
						rotation: -5,
						x: 3,
						duration: 0.5,
						ease: 'power2.inOut'
					},
					'<'
				)
				.to('.left-eye', { scaleY: 0.4, duration: 0.5, ease: 'power2.inOut' }, '<')
				.to('.right-eye', { scaleY: 0.7, duration: 0.5, ease: 'power2.inOut' }, '<')
				.to(
					'.robot-mouth',
					{
						width: 15,
						height: 3,
						borderRadius: '2px',
						top: '48px',
						duration: 0.5,
						ease: 'power2.inOut'
					},
					'<'
				)

				// Scanner line appears at the top of the image
				.fromTo(
					'.scanner-line',
					{
						y: imageTop,
						opacity: 0,
						height: '15px',
						transformOrigin: 'center center'
					},
					{
						x: 0,
						y: imageTop,
						opacity: 0.8,
						height: '3px',
						duration: 0.5,
						ease: 'power2.out'
					},
					'startScan+=0.7'
				)

				// Animate the scanner line moving down
				.to('.scanner-line', {
					y: imageBottom,
					duration: 2.5,
					ease: 'power1.inOut'
				})
				// Robot follows the scanner line down
				.to(
					'.robot',
					{
						y: imageBottom,
						duration: 2.5,
						ease: 'power1.inOut'
					},
					'<'
				)

				// Scanner line pulses and fades
				.to('.scanner-line', {
					opacity: 0,
					height: '15px',
					duration: 0.5,
					ease: 'power2.out'
				})

				// --- EXPRESSION: "Very Happy" ---
				.to(
					'.robot-mouth',
					{
						width: 25,
						height: 12,
						borderRadius: '2px 2px 10px 10px',
						top: '42px',
						duration: 0.4,
						ease: 'elastic.out(1, 0.7)'
					},
					'<'
				)
				.to(
					'.robot-eye-single',
					{
						scaleY: 1.2,
						duration: 0.4,
						ease: 'elastic.out(1, 0.7)'
					},
					'<'
				)
				.to('.robot-cheek', { opacity: 0.7, duration: 0.4, ease: 'power2.out' }, '<')
				.to('.robot-eyebrow', { opacity: 0, duration: 0.2 }, '<')

				// Robot moves back to the center-top idle position
				.to(
					'.robot',
					{
						x: 0,
						y: -200,
						rotation: 0,
						duration: 1,
						ease: 'power2.inOut'
					},
					'>+0.2'
				)

				// Add a short "happy hover"
				.to('.robot', {
					y: -215,
					duration: 1,
					yoyo: true,
					repeat: 1,
					ease: 'sine.inOut'
				})

				// --- EXPRESSION: Reset to "Hmm" (for next loop) ---
				.to(
					'.robot-mouth',
					{
						width: 8,
						height: 8,
						top: '45px',
						borderRadius: '50%',
						duration: 0.5,
						ease: 'power2.inOut'
					},
					'>-0.5'
				)
				.to('.robot-eye-single', { scaleY: 1, duration: 0.5, ease: 'power2.inOut' }, '<')
				.to('.robot-cheek', { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, '<')
				.to('.robot-eyebrow', { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, '<')
				.to(
					'.left-eyebrow',
					{ y: -5, rotation: 10, x: 0, duration: 0.5, ease: 'power2.inOut' },
					'<'
				)
				.to(
					'.right-eyebrow',
					{ y: 2, rotation: -5, x: 0, duration: 0.5, ease: 'power2.inOut' },
					'<'
				);
		}, scene);

		return () => ctx.revert();
	});
</script>

<div class="scene" bind:this={scene}>
	<!-- The scanning line --><div class="scanner-line"></div>
	<!-- The robot --><div class="robot">
		<div class="robot-antenna"></div>
		<div class="robot-eyes">
			<div class="robot-eye-single left-eye"></div>
			<div class="robot-eye-single right-eye"></div>
		</div>
		<div class="robot-eyebrow left-eyebrow"></div>
		<div class="robot-eyebrow right-eyebrow"></div>
		<div class="robot-cheek left-cheek"></div>
		<div class="robot-cheek right-cheek"></div>
		<div class="robot-mouth"></div>
	</div>
</div>

<style>
	.scene {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: visible;
		z-index: 10;
	}
	.robot {
		position: absolute;
		width: 80px;
		height: 60px;
		background: linear-gradient(145deg, #e0e0e0, #ffffff);
		border-radius: 50% / 40%;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15), inset 0 -4px 10px rgba(0, 0, 0, 0.05);
		z-index: 10;
		will-change: transform;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.robot-eyes {
		position: absolute;
		display: flex;
		gap: 8px;
		top: 22px;
	}
	.robot-eye-single {
		width: 18px;
		height: 18px;
		background: #000;
		border-radius: 50%;
		position: relative;
		overflow: hidden;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
		transform-origin: center center;
	}
	.robot-eye-single::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: #00bfff;
		border-radius: 50%;
		box-shadow: 0 0 8px #00bfff, 0 0 12px #00bfff;
		transform: scale(0.7);
	}
	.robot-eye-single::before {
		content: '';
		position: absolute;
		width: 6px;
		height: 6px;
		background: #fff;
		border-radius: 50%;
		top: 4px;
		left: 4px;
		z-index: 2;
	}
	.robot-eyebrow {
		position: absolute;
		width: 18px;
		height: 3px;
		background: #444;
		border-radius: 1px;
		top: 18px;
		z-index: 15;
		transform-origin: center center;
		opacity: 0;
	}
	.left-eyebrow {
		left: 24px;
	}
	.right-eyebrow {
		right: 24px;
	}
	.robot-cheek {
		position: absolute;
		width: 12px;
		height: 12px;
		background: #ffb6c1;
		border-radius: 50%;
		top: 40px;
		opacity: 0;
		filter: blur(2px);
		z-index: 5;
	}
	.left-cheek {
		left: 15px;
	}
	.right-cheek {
		right: 15px;
	}
	.robot-mouth {
		position: absolute;
		width: 8px;
		height: 8px;
		background: #444;
		border-radius: 50%;
		top: 45px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
	.robot-antenna {
		position: absolute;
		width: 4px;
		height: 20px;
		background: #b0b0b0;
		left: 50%;
		top: -18px;
		transform: translateX(-50%);
	}
	.robot-antenna::after {
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		background: #ff4141;
		border-radius: 50%;
		top: -4px;
		left: 50%;
		transform: translateX(-50%);
		box-shadow: 0 0 8px #ff4141;
	}
	.scanner-line {
		position: absolute;
		left: 0;
		right: 0;
		width: 100%;
		height: 3px;
		background: #00bfff;
		border-radius: 2px;
		box-shadow: 0 0 15px 3px #00bfff;
		z-index: 5;
		opacity: 0;
		will-change: transform, opacity;
	}
</style>
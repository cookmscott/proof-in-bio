<script>
	// Pure CSS animations version
</script>

<div class="scene">
	<!-- The scanning line -->
	<div class="scanner-line"></div>

	<!-- The robot -->
	<div class="robot">
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
		pointer-events: none;
	}

	.robot {
		position: absolute;
		width: 80px;
		height: 60px;
		background: linear-gradient(145deg, #e0e0e0, #ffffff);
		border-radius: 50% / 40%;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15), inset 0 -4px 10px rgba(0, 0, 0, 0.05);
		z-index: 10;
		display: flex;
		justify-content: center;
		align-items: center;
		will-change: transform;
		/* Master Animation Loop */
		animation: robot-scan-move 8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
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
		animation: blink 4s infinite;
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
		/* Eyebrow Expression Animation */
		animation: eyebrows-scan 8s ease-in-out infinite;
	}

	.left-eyebrow {
		left: 24px;
		--base-rot: 5deg;
		--scan-rot: 15deg;
		--happy-rot: -5deg;
	}

	.right-eyebrow {
		right: 24px;
		--base-rot: -5deg;
		--scan-rot: -15deg;
		--happy-rot: 5deg;
	}

	.robot-cheek {
		position: absolute;
		width: 12px;
		height: 12px;
		background: #ffb6c1;
		border-radius: 50%;
		top: 40px;
		filter: blur(2px);
		z-index: 5;
		/* Cheek Visibility Animation */
		animation: cheeks-scan 8s ease-in-out infinite;
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
		/* Mouth Expression Animation */
		animation: mouth-scan 8s ease-in-out infinite;
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
		animation: pulse 2s infinite ease-in-out;
	}

	.scanner-line {
		position: absolute;
		left: 0;
		width: 100%;
		height: 3px;
		background: #00bfff;
		border-radius: 2px;
		box-shadow: 0 0 15px 3px #00bfff;
		z-index: 5;
		opacity: 0;
		will-change: transform, opacity;
		/* Scanner Line Animation */
		animation: scanner-line-move 8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
	}

	/* --- Keyframes --- */

	/* Robot Movement: Idle -> Scan Down -> Happy Jump -> Reset */
	@keyframes robot-scan-move {
		0% { transform: translateY(-210px) rotate(-2deg); } /* Idle */
		10% { transform: translateY(-220px) rotate(2deg); } /* Idle bob */
		20% { transform: translateY(-200px) rotate(0deg); } /* Move to Start Scan */
		
		30% { transform: translateY(-200px); } /* Ready... */
		60% { transform: translateY(200px); } /* Scan Complete (Bottom) */
		
		65% { transform: translateY(180px) scale(1.1); } /* Happy Pop */
		75% { transform: translateY(200px) scale(1); } /* Land */

		85% { transform: translateY(-210px) rotate(-2deg); } /* Return to Idle */
		100% { transform: translateY(-210px) rotate(-2deg); }
	}

	/* Scanner Line: Follows the robot during the scan phase */
	@keyframes scanner-line-move {
		0%, 25% { opacity: 0; transform: translateY(-200px) scaleX(0); }
		
		30% { opacity: 1; transform: translateY(-200px) scaleX(1); } /* Beam On */
		60% { opacity: 1; transform: translateY(200px) scaleX(1); } /* Beam Down */
		
		65% { opacity: 0; transform: translateY(200px) scaleX(1.2); } /* Dissipate */
		100% { opacity: 0; transform: translateY(-210px); }
	}

	/* Mouth: O (Idle) -> Flat (Scan) -> D (Happy) */
	@keyframes mouth-scan {
		0%, 20% { 
			width: 8px; height: 8px; border-radius: 50%; top: 45px; /* O */
		}
		30%, 60% { 
			width: 16px; height: 4px; border-radius: 4px; top: 48px; /* - (Concentrating) */
		}
		65%, 80% { 
			width: 24px; height: 12px; border-radius: 2px 2px 12px 12px; top: 44px; /* D (Smile) */
		}
		90%, 100% { 
			width: 8px; height: 8px; border-radius: 50%; top: 45px; /* O */
		}
	}

	/* Eyebrows: Neutral -> Angry/Focused -> Happy */
	@keyframes eyebrows-scan {
		0%, 20% { 
			transform: rotate(var(--base-rot)) translateY(0); 
		}
		30%, 60% { 
			transform: rotate(var(--scan-rot)) translateY(2px); /* Focused */
		}
		65%, 80% { 
			transform: rotate(var(--happy-rot)) translateY(-4px); /* Happy/Surprised */
		}
		90%, 100% { 
			transform: rotate(var(--base-rot)) translateY(0); 
		}
	}

	/* Cheeks: Only visible when happy */
	@keyframes cheeks-scan {
		0%, 60% { opacity: 0; }
		65%, 80% { opacity: 0.6; }
		90%, 100% { opacity: 0; }
	}

	@keyframes blink {
		0%, 48%, 52%, 100% { transform: scaleY(1); }
		50% { transform: scaleY(0.1); }
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
		50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
	}
</style>
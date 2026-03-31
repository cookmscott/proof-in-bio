<div class="upload-splay" aria-hidden="true">
    <!-- Back Left Icon: Image Variant 1 (Single Mountain) -->
    <svg viewBox="0 0 80 80" class="upload-splay__icon upload-splay__icon--left" aria-hidden="true">
        <rect x="0" y="0" width="80" height="80" rx="20" fill="#A8B8FF"/>
        <circle cx="22" cy="22" r="6" fill="white"/>
        <path d="M 10 60 L 45 25 L 70 50" stroke="white" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Back Right Icon: Image Variant 2 (Two Sharp Peaks) -->
    <svg viewBox="0 0 80 90" class="upload-splay__icon upload-splay__icon--right" aria-hidden="true">
        <rect x="0" y="0" width="80" height="90" rx="18" fill="#6B83FF"/>
        <circle cx="55" cy="20" r="5" fill="white"/>
        <path d="M 5 65 L 30 33 L 50 53 L 65 40 L 75 55" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>

    <!-- Front Center Icon: Original Image Icon (Valley) -->
    <svg viewBox="0 0 90 75" class="upload-splay__icon upload-splay__icon--center" aria-hidden="true">
        <rect x="0" y="0" width="90" height="75" rx="20" fill="#3858FF"/>
        <circle cx="60" cy="15.5" r="7" fill="white"/>
        <path d="M 15 47.5 L 30 22.5 L 47 40.5 L 60 30.5 L 75 47.5" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
</div>

<style>
    .upload-splay {
        position: relative;
        height: 13rem;
        width: 15.5rem;
    }

    .upload-splay__icon {
        position: absolute;
        left: 50%;
        top: 50%;
        /* The SVGs are tightly cropped now, so they naturally sit smaller than the old 300x300 bounding box */
        height: 4.5rem;
        width: auto;
        transform-origin: center;
        opacity: 0;
        animation-duration: 0.3s;
        animation-iteration-count: 1;
        animation-fill-mode: both;
        animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .upload-splay__icon--left {
        animation-name: upload-snap-left;
        animation-delay: 0s;
        filter: drop-shadow(0 14px 24px rgb(40 56 120 / 0.08));
    }

    .upload-splay__icon--right {
        animation-name: upload-snap-right;
        animation-delay: 0.08s;
        height: 5rem; /* Naturally a bit taller */
        filter: drop-shadow(0 14px 24px rgb(40 56 120 / 0.1));
    }

    .upload-splay__icon--center {
        animation-name: upload-snap-center;
        animation-delay: 0.16s;
        height: 4.25rem; /* Naturally a bit wider */
        z-index: 2;
        filter: drop-shadow(0 14px 24px rgb(40 56 120 / 0.12));
    }

    @keyframes upload-snap-left {
        0% {
            transform: translate(-50%, -50%) translate(0, 28px) scale(0.35);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) translate(-65px, -15px) rotate(-24deg) scale(1);
            opacity: 1;
        }
    }

    @keyframes upload-snap-right {
        0% {
            transform: translate(-50%, -50%) translate(0, 28px) scale(0.35);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) translate(60px, -25px) rotate(22deg) scale(1);
            opacity: 1;
        }
    }

    @keyframes upload-snap-center {
        0% {
            transform: translate(-50%, -50%) translate(0, 28px) scale(0.35);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) translate(0, 25px) rotate(0deg) scale(1.15);
            opacity: 1;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .upload-splay__icon {
            animation: none;
            opacity: 1;
        }

        .upload-splay__icon--left {
            transform: translate(-50%, -50%) translate(-65px, -15px) rotate(-24deg) scale(1);
        }

        .upload-splay__icon--right {
            transform: translate(-50%, -50%) translate(60px, -25px) rotate(22deg) scale(1);
        }

        .upload-splay__icon--center {
            transform: translate(-50%, -50%) translate(0, 25px) rotate(0deg) scale(1.15);
        }
    }
</style>
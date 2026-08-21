/**
 * Lightweight, device-aware page background.
 * Uses a CSS background everywhere and defers video to capable desktop devices.
 */
(function () {
    'use strict';

    var videoEl = null;
    var container = null;
    var videoAllowed = false;

    var wallpaperCSS = `
        .solar-luxury-bg {
            position: fixed;
            inset: 0;
            z-index: -3;
            overflow: hidden;
            pointer-events: none;
            background:
                radial-gradient(circle at 82% 18%, rgba(16, 185, 112, 0.09), transparent 38%),
                radial-gradient(circle at 18% 82%, rgba(101, 151, 64, 0.07), transparent 34%),
                linear-gradient(135deg, #030a06 0%, #07180d 50%, #010603 100%);
        }

        .solar-bg-video {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.42;
        }

        @media (prefers-reduced-motion: reduce) {
            .solar-bg-video { display: none; }
        }
    `;

    var styleEl = document.createElement('style');
    styleEl.textContent = wallpaperCSS;
    document.head.appendChild(styleEl);

    function shouldUseVideo() {
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var slowConnection = connection && (connection.saveData || /2g|slow-2g/.test(connection.effectiveType || ''));
        var smallScreen = window.matchMedia('(max-width: 900px)').matches;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var memory = navigator.deviceMemory || 4;
        var cores = navigator.hardwareConcurrency || 4;

        return !slowConnection && !smallScreen && !reducedMotion && memory >= 4 && cores >= 4;
    }

    function createBackground() {
        if (!document.body) return;

        container = document.createElement('div');
        container.className = 'solar-luxury-bg';
        document.body.insertBefore(container, document.body.firstChild);
        videoAllowed = shouldUseVideo();

        if (videoAllowed) {
            window.addEventListener('load', loadVideo, { once: true });
        }
    }

    function loadVideo() {
        if (!videoAllowed || videoEl || document.hidden) return;

        videoEl = document.createElement('video');
        videoEl.className = 'solar-bg-video';
        videoEl.src = 'Images/9788714-sd_640_360_30fps.mp4';
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.preload = 'metadata';
        container.appendChild(videoEl);
        videoEl.play().catch(function () {});
    }

    document.addEventListener('visibilitychange', function () {
        if (!videoEl) return;
        if (document.hidden) {
            videoEl.pause();
        } else if (videoAllowed) {
            videoEl.play().catch(function () {});
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBackground, { once: true });
    } else {
        createBackground();
    }
})();

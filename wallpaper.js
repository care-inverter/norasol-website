/**
 * wallpaper.js — Optimized Real-World Solar Background & Adaptive Neural Mesh
 * 
 * Features:
 * - Single lightweight background video loop (Images/9788714-sd_640_360_30fps.mp4)
 * - Hardware-friendly multi-stop radial gradients (eliminates expensive CPU CSS blur filters)
 * - Dynamic low-power performance engine (adaptive FPS monitoring & auto particle scaling)
 * - Automatic visibility pause on background tab switch
 * - Respects prefers-reduced-motion accessibility settings
 */
(function () {
    'use strict';

    // ===================== CSS STYLES =====================
    var wallpaperCSS = `
        /* DEEP SPACE & ATMOSPHERE BACKGROUND */
        .solar-luxury-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -3;
            background: #000201;
            overflow: hidden;
        }

        /* SINGLE BACKGROUND VIDEO CONTAINER */
        .solar-bg-video {
            position: absolute;
            top: 50%;
            left: 50%;
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            transform: translate(-50%, -50%);
            object-fit: cover;
            opacity: 0.75;
            z-index: -3;
            pointer-events: none;
        }

        /* DYNAMIC CANVAS LAYER */
        #luxurySolarCanvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
        }

        /* ATMOSPHERIC GLOW ORBS - OPTIMIZED WITH MULTI-STOP GRADIENTS (NO CPU BLUR) */
        .solar-orb {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            z-index: -3;
            mix-blend-mode: screen;
            animation: orbFloat 25s ease-in-out infinite alternate;
            will-change: transform;
        }

        .orb-sun {
            width: 850px;
            height: 850px;
            background: radial-gradient(circle, rgba(255, 215, 80, 0.28) 0%, rgba(255, 180, 40, 0.16) 25%, rgba(255, 160, 20, 0.06) 50%, rgba(0,0,0,0) 75%);
            bottom: -250px;
            right: -150px;
        }

        .orb-emerald {
            width: 950px;
            height: 950px;
            background: radial-gradient(circle, rgba(16, 245, 150, 0.22) 0%, rgba(10, 180, 110, 0.12) 30%, rgba(5, 100, 60, 0.04) 60%, rgba(0,0,0,0) 80%);
            bottom: -350px;
            right: -100px;
            animation-delay: -12s;
        }

        @keyframes orbFloat {
            0% { transform: translate(0, 0); }
            50% { transform: translate(-20px, -20px); }
            100% { transform: translate(15px, 15px); }
        }

        /* VIGNETTE */
        .luxury-vignette {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: radial-gradient(circle at 90% 90%, rgba(0,0,0,0) 40%, rgba(1, 10, 6, 0.65) 100%);
            pointer-events: none;
        }
    `;

    // Inject CSS
    var styleEl = document.createElement('style');
    styleEl.textContent = wallpaperCSS;
    document.head.appendChild(styleEl);

    var videoEl = null;

    // ===================== DOM SETUP =====================
    function setupDOM() {
        if (!document.body) return;

        var container = document.createElement('div');
        container.className = 'solar-luxury-bg';

        // Single Background Video setup
        videoEl = document.createElement('video');
        videoEl.className = 'solar-bg-video';
        videoEl.src = 'Images/9788714-sd_640_360_30fps.mp4';
        videoEl.muted = true;
        videoEl.autoplay = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.preload = 'auto';

        videoEl.play().catch(function(err) {
            console.log("Background video autoplay prevented: ", err);
        });

        container.appendChild(videoEl);

        var orb1 = document.createElement('div');
        orb1.className = 'solar-orb orb-sun';

        var orb2 = document.createElement('div');
        orb2.className = 'solar-orb orb-emerald';

        var canvas = document.createElement('canvas');
        canvas.id = 'luxurySolarCanvas';

        var overlay = document.createElement('div');
        overlay.className = 'luxury-vignette';

        container.appendChild(orb1);
        container.appendChild(orb2);
        container.appendChild(canvas);
        container.appendChild(overlay);
        document.body.insertBefore(container, document.body.firstChild);

        initNeuralWebEngine(canvas);
    }

    // ===================== NEURAL WEB & PARTICLES ENGINE =====================
    function initNeuralWebEngine(canvas) {
        var ctx = canvas.getContext('2d', { alpha: true });
        var width, height;

        // Low-end hardware detection & adaptive scaling
        var cores = navigator.hardwareConcurrency || 4;
        var isLowPowerMode = (cores <= 4);
        var targetFPS = isLowPowerMode ? 30 : 60;
        var frameInterval = 1000 / targetFPS;

        var maxNodes = isLowPowerMode ? 35 : 120;
        var maxParticleCount = isLowPowerMode ? 15 : 35;
        var connectionDist = isLowPowerMode ? 85 : 140;
        var mouseDist = isLowPowerMode ? 160 : 250;

        // Rolling FPS Counter
        var lastFrameTime = performance.now();
        var frameCount = 0;
        var fpsCheckStart = performance.now();

        var mouse = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2
        };

        window.addEventListener('mousemove', function(e) {
            mouse.targetX = e.clientX;
            mouse.targetY = e.clientY;
        }, { passive: true });

        var floatingNodes = [];
        var particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            buildElements();
        }

        function buildElements() {
            floatingNodes = [];
            particles = [];

            for (var fn = 0; fn < maxNodes; fn++) {
                floatingNodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2,
                    radius: 1.5 + Math.random() * 2.5
                });
            }

            for (var ep = 0; ep < maxParticleCount; ep++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vy: -(0.3 + Math.random() * 0.5),
                    radius: 1.2 + Math.random() * 2
                });
            }
        }

        // Accessibility preference check
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var animationFrameId = null;

        function render(now) {
            if (!now) now = performance.now();
            var elapsed = now - lastFrameTime;

            // Throttle frame rate on low-power devices
            if (isLowPowerMode && elapsed < frameInterval - 2) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            lastFrameTime = now;

            // Adaptive FPS Monitor (if performance drops, switch to low power mode automatically)
            frameCount++;
            if (now - fpsCheckStart > 2000) {
                var currentFPS = (frameCount * 1000) / (now - fpsCheckStart);
                if (currentFPS < 35 && !isLowPowerMode) {
                    isLowPowerMode = true;
                    targetFPS = 30;
                    frameInterval = 1000 / targetFPS;
                    maxNodes = 35;
                    maxParticleCount = 15;
                    connectionDist = 85;
                    mouseDist = 160;
                    buildElements();
                }
                frameCount = 0;
                fpsCheckStart = now;
            }

            ctx.clearRect(0, 0, width, height);

            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            // 1. DRAW FLOATING NODES & CURSOR WEBS
            var len = floatingNodes.length;
            for (var fn = 0; fn < len; fn++) {
                var node = floatingNodes[fn];
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                var distToMouse = Math.hypot(mouse.x - node.x, mouse.y - node.y);
                if (distToMouse < mouseDist) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(16, 245, 150, ' + (1 - distToMouse / mouseDist) * 0.75 + ')';
                    ctx.lineWidth = 1.2;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                // Inter-node connections
                for (var j = fn + 1; j < len; j++) {
                    var node2 = floatingNodes[j];
                    var distNodes = Math.hypot(node.x - node2.x, node.y - node2.y);
                    if (distNodes < connectionDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 215, 80, ' + (1 - distNodes / connectionDist) * 0.25 + ')';
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(node2.x, node2.y);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = 'rgba(16, 245, 150, 0.95)';
                ctx.fillRect(node.x - node.radius / 2, node.y - node.radius / 2, node.radius, node.radius);
            }

            // 2. EMBERS / PARTICLES
            ctx.fillStyle = 'rgba(20, 245, 150, 0.5)';
            for (var pIdx = 0; pIdx < particles.length; pIdx++) {
                var pt = particles[pIdx];
                pt.y += pt.vy;
                if (pt.y < -10) pt.y = height + 10;
                ctx.fillRect(pt.x, pt.y, pt.radius, pt.radius);
            }

            if (!prefersReducedMotion && !document.hidden) {
                animationFrameId = requestAnimationFrame(render);
            }
        }

        // Tab visibility pause to save CPU
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                if (videoEl) videoEl.pause();
            } else {
                if (videoEl) videoEl.play().catch(function() {});
                lastFrameTime = performance.now();
                render();
            }
        });

        window.addEventListener('resize', resize);
        resize();
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupDOM);
    } else {
        setupDOM();
    }
})();
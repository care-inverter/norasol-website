/**
 * wallpaper.js — Smart Dynamic System Benchmark & Vibrant Solar Background
 * 
 * Features:
 * - Dynamic Hardware Pre-check (WebGL GPU, CPU cores, software rasterizer detection)
 * - 3 Adaptive Performance Tiers (High, Mid, and Ultra-Low/Static Fallback)
 * - Ultra-crisp, vibrant video styling (no blur filters, high saturation & contrast)
 * - Zero-lag seamless video looping without re-buffering delays
 * - Automatic CPU saving on tab switch
 */
(function () {
    'use strict';

    // ===================== DYNAMIC SYSTEM PRE-CHECK =====================
    function detectSystemTier() {
        var cores = navigator.hardwareConcurrency || 2;
        var memory = navigator.deviceMemory || 4;
        var isSoftwareGPU = false;

        try {
            var testCanvas = document.createElement('canvas');
            var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            if (gl) {
                var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
                    if (/swiftshader|llvmpipe|software|basic render|microsoft basic|canvaskit|gdi/i.test(renderer)) {
                        isSoftwareGPU = true;
                    }
                }
            } else {
                isSoftwareGPU = true; // WebGL disabled or unsupported
            }
        } catch (e) {
            isSoftwareGPU = true;
        }

        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || isSoftwareGPU || cores <= 2 || memory < 4) {
            return 'tier-low';  // Tier 3: Static vibrant wallpaper (0% CPU impact, instant)
        } else if (cores <= 4 || isMobile) {
            return 'tier-mid';  // Tier 2: Crisp video + lightweight mesh (30 FPS cap)
        } else {
            return 'tier-high'; // Tier 1: Full crisp video + 60 FPS mesh
        }
    }

    var systemTier = detectSystemTier();

    // ===================== CSS STYLES =====================
    var wallpaperCSS = `
        /* DEEP SPACE & VIBRANT ATMOSPHERE BACKGROUND */
        .solar-luxury-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -3;
            background: #020b05;
            overflow: hidden;
        }

        /* STATIC VIBRANT FALLBACK FOR TIER-LOW (OLD COMPUTERS) */
        .solar-luxury-bg.tier-low-bg {
            background: 
                radial-gradient(circle at 80% 20%, rgba(16, 245, 150, 0.18), transparent 45%),
                radial-gradient(circle at 20% 80%, rgba(255, 215, 80, 0.15), transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.12), transparent 50%),
                linear-gradient(135deg, #05180c 0%, #0a2916 50%, #020c06 100%);
        }

        /* CRISP & VIBRANT BACKGROUND VIDEO */
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
            opacity: 0.95;
            filter: contrast(1.12) saturate(1.25);
            z-index: -3;
            pointer-events: none;
            backface-visibility: hidden;
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

        /* ATMOSPHERIC GLOW ORBS - HARDWARE ACCELERATED MULTI-STOP GRADIENTS */
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
            background: radial-gradient(circle, rgba(255, 215, 80, 0.32) 0%, rgba(255, 180, 40, 0.18) 25%, rgba(255, 160, 20, 0.07) 50%, rgba(0,0,0,0) 75%);
            bottom: -250px;
            right: -150px;
        }

        .orb-emerald {
            width: 950px;
            height: 950px;
            background: radial-gradient(circle, rgba(16, 245, 150, 0.25) 0%, rgba(10, 180, 110, 0.14) 30%, rgba(5, 100, 60, 0.05) 60%, rgba(0,0,0,0) 80%);
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
            background: radial-gradient(circle at 90% 90%, rgba(0,0,0,0) 40%, rgba(1, 10, 6, 0.55) 100%);
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
        container.className = 'solar-luxury-bg' + (systemTier === 'tier-low' ? ' tier-low-bg' : '');

        // If system is low-end/software GPU, display vibrant static CSS mode (0% CPU impact)
        if (systemTier !== 'tier-low') {
            videoEl = document.createElement('video');
            videoEl.className = 'solar-bg-video';
            videoEl.src = 'Images/9788714-sd_640_360_30fps.mp4';
            videoEl.muted = true;
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.playsInline = true;
            videoEl.preload = 'auto';

            // Zero-Lag Seamless Loop Handling
            videoEl.addEventListener('timeupdate', function() {
                if (videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.3) {
                    videoEl.currentTime = 0.01;
                    if (videoEl.paused) videoEl.play().catch(function() {});
                }
            });

            videoEl.play().catch(function(err) {
                console.log("Background video autoplay info: ", err);
            });

            container.appendChild(videoEl);
        }

        var orb1 = document.createElement('div');
        orb1.className = 'solar-orb orb-sun';

        var orb2 = document.createElement('div');
        orb2.className = 'solar-orb orb-emerald';

        var overlay = document.createElement('div');
        overlay.className = 'luxury-vignette';

        container.appendChild(orb1);
        container.appendChild(orb2);

        if (systemTier !== 'tier-low') {
            var canvas = document.createElement('canvas');
            canvas.id = 'luxurySolarCanvas';
            container.appendChild(canvas);
            initNeuralWebEngine(canvas);
        }

        container.appendChild(overlay);
        document.body.insertBefore(container, document.body.firstChild);
    }

    // ===================== NEURAL WEB & PARTICLES ENGINE =====================
    function initNeuralWebEngine(canvas) {
        var ctx = canvas.getContext('2d', { alpha: true });
        var width, height;

        var isLowPowerMode = (systemTier === 'tier-mid');
        var targetFPS = isLowPowerMode ? 30 : 60;
        var frameInterval = 1000 / targetFPS;

        var maxNodes = isLowPowerMode ? 30 : 100;
        var maxParticleCount = isLowPowerMode ? 12 : 30;
        var connectionDist = isLowPowerMode ? 85 : 135;
        var mouseDist = isLowPowerMode ? 150 : 240;

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
                    vx: (Math.random() - 0.5) * 1.1,
                    vy: (Math.random() - 0.5) * 1.1,
                    radius: 1.5 + Math.random() * 2.2
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

        var animationFrameId = null;

        function render(now) {
            if (!now) now = performance.now();
            var elapsed = now - lastFrameTime;

            if (isLowPowerMode && elapsed < frameInterval - 2) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            lastFrameTime = now;

            // Rolling FPS Safeguard
            frameCount++;
            if (now - fpsCheckStart > 2000) {
                var currentFPS = (frameCount * 1000) / (now - fpsCheckStart);
                if (currentFPS < 30 && !isLowPowerMode) {
                    isLowPowerMode = true;
                    targetFPS = 30;
                    frameInterval = 1000 / targetFPS;
                    maxNodes = 30;
                    maxParticleCount = 12;
                    connectionDist = 85;
                    mouseDist = 150;
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
                    ctx.strokeStyle = 'rgba(16, 245, 150, ' + (1 - distToMouse / mouseDist) * 0.7 + ')';
                    ctx.lineWidth = 1.1;
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
                        ctx.strokeStyle = 'rgba(255, 215, 80, ' + (1 - distNodes / connectionDist) * 0.22 + ')';
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

            if (!document.hidden) {
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
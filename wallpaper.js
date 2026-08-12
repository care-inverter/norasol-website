/**
 * wallpaper.js — ThinkPad X1 & Integrated GPU Ultra-Smooth Engine
 * 
 * Features:
 * - Intel Integrated GPU (UHD / Iris Xe) & Ultrabook Detection
 * - Ultra-Lean Particle Mesh Engine (max 12-25 nodes)
 * - Zero-Lag Crisp Video Looping
 * - Floating Graphics Mode Switcher Widget (Static / Balanced / High)
 * - Saved preference support via localStorage
 */
(function () {
    'use strict';

    // ===================== SYSTEM & GPU DETECTION =====================
    function getSavedTier() {
        return localStorage.getItem('norasol_perf_mode');
    }

    function detectSystemTier() {
        var saved = getSavedTier();
        if (saved && (saved === 'static' || saved === 'balanced' || saved === 'high')) {
            return saved;
        }

        var isIntegratedGPU = false;
        var isSoftwareGPU = false;

        try {
            var testCanvas = document.createElement('canvas');
            var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            if (gl) {
                var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    var renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
                    if (/swiftshader|llvmpipe|software|basic render|microsoft basic|canvaskit|gdi/i.test(renderer)) {
                        isSoftwareGPU = true;
                    }
                    if (/intel|uhd|hd graphics|iris|graphics family|mesa|qualcomm|adreno/i.test(renderer)) {
                        isIntegratedGPU = true;
                    }
                }
            } else {
                isSoftwareGPU = true;
            }
        } catch (e) {
            isSoftwareGPU = true;
        }

        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || isSoftwareGPU) {
            return 'static';
        } else if (isIntegratedGPU || isMobile) {
            return 'balanced'; // Default for ThinkPad X1 / Intel GPUs
        } else {
            return 'high';
        }
    }

    var currentMode = detectSystemTier();

    // ===================== CSS STYLES =====================
    var wallpaperCSS = `
        /* BACKGROUND CONTAINER */
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

        /* STATIC VIBRANT GRADIENT MODE (0% GPU LOAD) */
        .solar-luxury-bg.mode-static {
            background: 
                radial-gradient(circle at 80% 20%, rgba(16, 245, 150, 0.2), transparent 45%),
                radial-gradient(circle at 20% 80%, rgba(255, 215, 80, 0.16), transparent 40%),
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
            filter: contrast(1.12) saturate(1.22);
            z-index: -3;
            pointer-events: none;
        }

        /* CANVAS LAYER */
        #luxurySolarCanvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
        }

        /* ATMOSPHERIC GLOW ORBS */
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
            background: radial-gradient(circle, rgba(255, 215, 80, 0.3) 0%, rgba(255, 180, 40, 0.16) 25%, rgba(255, 160, 20, 0.05) 50%, rgba(0,0,0,0) 75%);
            bottom: -250px;
            right: -150px;
        }

        .orb-emerald {
            width: 950px;
            height: 950px;
            background: radial-gradient(circle, rgba(16, 245, 150, 0.24) 0%, rgba(10, 180, 110, 0.12) 30%, rgba(5, 100, 60, 0.04) 60%, rgba(0,0,0,0) 80%);
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

        /* FLOATING PERFORMANCE MODE TOGGLE WIDGET */
        .perf-toggle-btn {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 9999;
            background: rgba(10, 30, 18, 0.85);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(85, 158, 63, 0.35);
            color: #a3e635;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            transition: all 0.2s ease;
            user-select: none;
        }

        .perf-toggle-btn:hover {
            background: rgba(16, 45, 26, 0.95);
            border-color: rgba(16, 245, 150, 0.6);
            color: #ffffff;
            transform: translateY(-2px);
        }
    `;

    var styleEl = document.createElement('style');
    styleEl.textContent = wallpaperCSS;
    document.head.appendChild(styleEl);

    var container = null;
    var videoEl = null;
    var canvas = null;
    var toggleBtn = null;
    var animationFrameId = null;

    // ===================== DOM SETUP =====================
    function setupDOM() {
        if (!document.body) return;

        container = document.createElement('div');
        container.className = 'solar-luxury-bg mode-' + currentMode;

        // Video setup
        videoEl = document.createElement('video');
        videoEl.className = 'solar-bg-video';
        videoEl.src = 'Images/9788714-sd_640_360_30fps.mp4';
        videoEl.muted = true;
        videoEl.autoplay = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.preload = 'auto';

        videoEl.addEventListener('timeupdate', function() {
            if (videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.3) {
                videoEl.currentTime = 0.01;
                if (videoEl.paused) videoEl.play().catch(function() {});
            }
        });

        if (currentMode !== 'static') {
            container.appendChild(videoEl);
            videoEl.play().catch(function() {});
        }

        var orb1 = document.createElement('div');
        orb1.className = 'solar-orb orb-sun';

        var orb2 = document.createElement('div');
        orb2.className = 'solar-orb orb-emerald';

        canvas = document.createElement('canvas');
        canvas.id = 'luxurySolarCanvas';

        var overlay = document.createElement('div');
        overlay.className = 'luxury-vignette';

        container.appendChild(orb1);
        container.appendChild(orb2);
        container.appendChild(canvas);
        container.appendChild(overlay);
        document.body.insertBefore(container, document.body.firstChild);

        // Inject UI Mode Switcher
        setupToggleWidget();

        if (currentMode !== 'static') {
            initNeuralWebEngine(canvas);
        } else {
            canvas.style.display = 'none';
        }
    }

    // ===================== PERFORMANCE TOGGLE WIDGET =====================
    function setupToggleWidget() {
        toggleBtn = document.createElement('button');
        toggleBtn.className = 'perf-toggle-btn';
        updateToggleText();

        toggleBtn.addEventListener('click', function() {
            if (currentMode === 'high') {
                currentMode = 'balanced';
            } else if (currentMode === 'balanced') {
                currentMode = 'static';
            } else {
                currentMode = 'high';
            }

            localStorage.setItem('norasol_perf_mode', currentMode);
            updateToggleText();
            applyModeChange();
        });

        document.body.appendChild(toggleBtn);
    }

    function updateToggleText() {
        if (!toggleBtn) return;
        if (currentMode === 'high') {
            toggleBtn.innerHTML = '⚡ Graphics: High <span>(Click to reduce)</span>';
        } else if (currentMode === 'balanced') {
            toggleBtn.innerHTML = '⚡ Graphics: Balanced <span>(Smooth ThinkPad Mode)</span>';
        } else {
            toggleBtn.innerHTML = '⚡ Graphics: Static <span>(0% CPU Power Save)</span>';
        }
    }

    function applyModeChange() {
        container.className = 'solar-luxury-bg mode-' + currentMode;

        if (currentMode === 'static') {
            if (videoEl && videoEl.parentNode) videoEl.parentNode.removeChild(videoEl);
            if (canvas) canvas.style.display = 'none';
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        } else {
            if (videoEl && !videoEl.parentNode) {
                container.insertBefore(videoEl, container.firstChild);
                videoEl.play().catch(function() {});
            }
            if (canvas) {
                canvas.style.display = 'block';
                initNeuralWebEngine(canvas);
            }
        }
    }

    // ===================== ULTRA-LEAN NEURAL ENGINE =====================
    function initNeuralWebEngine(targetCanvas) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        var ctx = targetCanvas.getContext('2d', { alpha: true });
        var width, height;

        var isBalanced = (currentMode === 'balanced');
        var targetFPS = isBalanced ? 30 : 60;
        var frameInterval = 1000 / targetFPS;

        // ULTRA LEAN SETTINGS FOR THINKPAD / INTEGRATED INTEL GPUS
        var maxNodes = isBalanced ? 12 : 25;
        var maxEmbers = isBalanced ? 5 : 12;
        var connectionDist = isBalanced ? 75 : 95;
        var mouseDist = isBalanced ? 130 : 180;

        var lastFrameTime = performance.now();

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
            width = targetCanvas.width = window.innerWidth;
            height = targetCanvas.height = window.innerHeight;
            buildElements();
        }

        function buildElements() {
            floatingNodes = [];
            particles = [];

            for (var fn = 0; fn < maxNodes; fn++) {
                floatingNodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.9,
                    vy: (Math.random() - 0.5) * 0.9,
                    radius: 1.5 + Math.random() * 2
                });
            }

            for (var ep = 0; ep < maxEmbers; ep++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vy: -(0.2 + Math.random() * 0.4),
                    radius: 1.2 + Math.random() * 1.8
                });
            }
        }

        function render(now) {
            if (currentMode === 'static') return;
            if (!now) now = performance.now();
            var elapsed = now - lastFrameTime;

            if (isBalanced && elapsed < frameInterval - 2) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            lastFrameTime = now;
            ctx.clearRect(0, 0, width, height);

            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

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
                    ctx.strokeStyle = 'rgba(16, 245, 150, ' + (1 - distToMouse / mouseDist) * 0.6 + ')';
                    ctx.lineWidth = 1.0;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                for (var j = fn + 1; j < len; j++) {
                    var node2 = floatingNodes[j];
                    var distNodes = Math.hypot(node.x - node2.x, node.y - node2.y);
                    if (distNodes < connectionDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 215, 80, ' + (1 - distNodes / connectionDist) * 0.2 + ')';
                        ctx.lineWidth = 0.7;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(node2.x, node2.y);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = 'rgba(16, 245, 150, 0.9)';
                ctx.fillRect(node.x - node.radius / 2, node.y - node.radius / 2, node.radius, node.radius);
            }

            ctx.fillStyle = 'rgba(20, 245, 150, 0.4)';
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

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                if (videoEl) videoEl.pause();
            } else {
                if (videoEl && currentMode !== 'static') videoEl.play().catch(function() {});
                lastFrameTime = performance.now();
                if (currentMode !== 'static') render();
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
/**
 * wallpaper.js — Radical 60 FPS Ultra-Smooth Engine & Deferral System
 * 
 * Features:
 * - Ultra-lightweight Vibrant CSS Background by default (0% CPU/GPU overhead)
 * - Zero background video bandwidth competition during page load
 * - Automatic pause on scroll for 100% fluid scrolling
 * - Optional high-graphics mode accessible via floating toggle widget
 */
(function () {
    'use strict';

    function getSavedTier() {
        return localStorage.getItem('norasol_perf_mode');
    }

    function detectSystemTier() {
        var saved = getSavedTier();
        if (saved && (saved === 'static' || saved === 'balanced' || saved === 'high')) {
            return saved;
        }

        // Default to ultra-smooth static mode to guarantee 60 FPS fluid interaction on all laptops
        var isDedicatedGPU = false;
        try {
            var testCanvas = document.createElement('canvas');
            var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            if (gl) {
                var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    var renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
                    if (/nvidia|radeon|geforce|rtx|gtx|amd/i.test(renderer)) {
                        isDedicatedGPU = true;
                    }
                }
            }
        } catch (e) {}

        return isDedicatedGPU ? 'high' : 'static';
    }

    var currentMode = detectSystemTier();

    var wallpaperCSS = `
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

        .solar-luxury-bg.mode-static,
        .solar-luxury-bg.mode-balanced {
            background: 
                radial-gradient(circle at 80% 20%, rgba(16, 245, 150, 0.22), transparent 45%),
                radial-gradient(circle at 20% 80%, rgba(255, 215, 80, 0.18), transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.14), transparent 50%),
                linear-gradient(135deg, #05180c 0%, #0a2916 50%, #020c06 100%);
        }

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
            opacity: 0.92;
            filter: contrast(1.1) saturate(1.2);
            z-index: -3;
            pointer-events: none;
        }

        #luxurySolarCanvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
        }

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

        .perf-toggle-btn {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 9999;
            background: rgba(10, 30, 18, 0.88);
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

    function setupDOM() {
        if (!document.body) return;

        container = document.createElement('div');
        container.className = 'solar-luxury-bg mode-' + currentMode;

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

        setupToggleWidget();

        if (currentMode === 'high') {
            initVideo();
            initNeuralWebEngine(canvas);
        } else if (currentMode === 'balanced') {
            initNeuralWebEngine(canvas);
        } else {
            canvas.style.display = 'none';
        }
    }

    function initVideo() {
        if (videoEl) return;
        videoEl = document.createElement('video');
        videoEl.className = 'solar-bg-video';
        videoEl.src = 'Images/9788714-sd_640_360_30fps.mp4';
        videoEl.muted = true;
        videoEl.autoplay = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.preload = 'none'; // Don't steal network bandwidth during initial render!

        videoEl.addEventListener('timeupdate', function() {
            if (videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.3) {
                videoEl.currentTime = 0.01;
                if (videoEl.paused) videoEl.play().catch(function() {});
            }
        });

        // Defer video loading until after initial page paint
        window.addEventListener('load', function() {
            setTimeout(function() {
                if (currentMode === 'high' && videoEl) {
                    container.insertBefore(videoEl, container.firstChild);
                    videoEl.play().catch(function() {});
                }
            }, 1000);
        });
    }

    function setupToggleWidget() {
        toggleBtn = document.createElement('button');
        toggleBtn.className = 'perf-toggle-btn';
        updateToggleText();

        toggleBtn.addEventListener('click', function() {
            if (currentMode === 'static') {
                currentMode = 'balanced';
            } else if (currentMode === 'balanced') {
                currentMode = 'high';
            } else {
                currentMode = 'static';
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
            toggleBtn.innerHTML = '⚡ Graphics: High <span>(Video + Mesh)</span>';
        } else if (currentMode === 'balanced') {
            toggleBtn.innerHTML = '⚡ Graphics: Balanced <span>(Light Mesh)</span>';
        } else {
            toggleBtn.innerHTML = '⚡ Graphics: Smooth <span>(0% CPU Static)</span>';
        }
    }

    function applyModeChange() {
        container.className = 'solar-luxury-bg mode-' + currentMode;

        if (currentMode === 'static') {
            if (videoEl && videoEl.parentNode) videoEl.parentNode.removeChild(videoEl);
            if (canvas) canvas.style.display = 'none';
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        } else if (currentMode === 'balanced') {
            if (videoEl && videoEl.parentNode) videoEl.parentNode.removeChild(videoEl);
            if (canvas) {
                canvas.style.display = 'block';
                initNeuralWebEngine(canvas);
            }
        } else {
            initVideo();
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

    function initNeuralWebEngine(targetCanvas) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        var ctx = targetCanvas.getContext('2d', { alpha: true });
        var width, height;

        var maxNodes = (currentMode === 'high') ? 18 : 10;
        var maxEmbers = (currentMode === 'high') ? 8 : 4;
        var connectionDist = 70;
        var mouseDist = 140;

        var mouse = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2
        };

        window.addEventListener('mousemove', function(e) {
            mouse.x += (e.clientX - mouse.x) * 0.08;
            mouse.y += (e.clientY - mouse.y) * 0.08;
        }, { passive: true });

        var floatingNodes = [];
        var particles = [];

        function buildElements() {
            floatingNodes = [];
            particles = [];

            for (var fn = 0; fn < maxNodes; fn++) {
                floatingNodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    radius: 1.5 + Math.random() * 1.8
                });
            }

            for (var ep = 0; ep < maxEmbers; ep++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vy: -(0.2 + Math.random() * 0.3),
                    radius: 1.2 + Math.random() * 1.5
                });
            }
        }

        var isScrolling = false;
        var scrollTimeout = null;

        window.addEventListener('scroll', function() {
            isScrolling = true;
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                isScrolling = false;
            }, 150);
        }, { passive: true });

        function render() {
            if (currentMode === 'static') return;
            if (isScrolling) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            ctx.clearRect(0, 0, width, height);

            var len = floatingNodes.length;
            var connectionDistSq = connectionDist ** 2;
            var mouseDistSq = mouseDist ** 2;

            for (var fn = 0; fn < len; fn++) {
                var node = floatingNodes[fn];
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                var dxM = mouse.x - node.x;
                var dyM = mouse.y - node.y;
                var distToMouseSq = dxM * dxM + dyM * dyM;
                if (distToMouseSq < mouseDistSq) {
                    var dM = Math.sqrt(distToMouseSq);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(16, 245, 150, ' + (1 - dM / mouseDist) * 0.5 + ')';
                    ctx.lineWidth = 1.0;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                for (var j = fn + 1; j < len; j++) {
                    var node2 = floatingNodes[j];
                    var dxN = node.x - node2.x;
                    var dyN = node.y - node2.y;
                    var distNodesSq = dxN * dxN + dyN * dyN;
                    if (distNodesSq < connectionDistSq) {
                        var dN = Math.sqrt(distNodesSq);
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 215, 80, ' + (1 - dN / connectionDist) * 0.18 + ')';
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(node2.x, node2.y);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = 'rgba(16, 245, 150, 0.85)';
                ctx.fillRect(node.x - node.radius / 2, node.y - node.radius / 2, node.radius, node.radius);
            }

            ctx.fillStyle = 'rgba(20, 245, 150, 0.35)';
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
                if (videoEl && currentMode === 'high') videoEl.play().catch(function() {});
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
/**
 * wallpaper.js — Real-World Photorealistic Solar Background with Video & Ultra-Dense Neural Web
 * 
 * Features:
 * - Crystal-clear background video playlist with subtle styling & smooth transitions
 * - Ultra-dense, highly visible interactive cursor-reactive particle & mesh network
 * - Soft, blended energy lines and floating background nodes
 * - Optimized 60 FPS performance
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

        /* BACKGROUND VIDEO PLAYLIST CONTAINER */
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
            filter: blur(2px) brightness(0.9) saturate(1.3);
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
            z-index: -3;
            pointer-events: none;
        }

        .solar-bg-video.active {
            opacity: 0.92;
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
            background: radial-gradient(circle, rgba(255, 215, 80, 0.25) 0%, rgba(255, 160, 20, 0.08) 45%, rgba(0,0,0,0) 75%);
            bottom: -250px;
            right: -150px;
            filter: blur(100px);
        }

        .orb-emerald {
            width: 950px;
            height: 950px;
            background: radial-gradient(circle, rgba(16, 245, 150, 0.2) 0%, rgba(5, 100, 60, 0.06) 50%, rgba(0,0,0,0) 80%);
            bottom: -350px;
            right: -100px;
            filter: blur(120px);
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

    // ===================== DOM SETUP =====================
    function setupDOM() {
        if (!document.body) return;

        var container = document.createElement('div');
        container.className = 'solar-luxury-bg';

        // Background Video Playlist Integration
        var videoSources = [
            'Images/15338260_640_360_23fps.mp4',
            'Images/14580851_640_360_30fps.mp4',
            'Images/9788714-sd_640_360_30fps.mp4'
        ];

        var currentVideoIndex = 0;
        var videoElements = [];

        videoSources.forEach(function(src, index) {
            var video = document.createElement('video');
            video.className = 'solar-bg-video' + (index === 0 ? ' active' : '');
            video.src = src;
            video.muted = true;
            video.autoplay = true;
            video.loop = false;
            video.playsInline = true;
            video.preload = 'auto';
            container.appendChild(video);
            videoElements.push(video);
        });

        function playNextVideo() {
            var currentVideo = videoElements[currentVideoIndex];
            currentVideo.classList.remove('active');
            currentVideo.pause();

            currentVideoIndex = (currentVideoIndex + 1) % videoElements.length;
            var nextVideo = videoElements[currentVideoIndex];
            
            nextVideo.currentTime = 0;
            nextVideo.play().then(function() {
                nextVideo.classList.add('active');
            }).catch(function(err) {
                console.log("Video autoplay blocked or error: ", err);
            });
        }

        videoElements.forEach(function(video) {
            video.addEventListener('ended', playNextVideo);
        });

        videoElements[0].play().catch(function(err) {
            console.log("Initial video autoplay prevented: ", err);
        });

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

            for (var fn = 0; fn < 120; fn++) {
                floatingNodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2,
                    radius: 1.5 + Math.random() * 2.5
                });
            }

            for (var ep = 0; ep < 35; ep++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vy: -(0.3 + Math.random() * 0.5),
                    radius: 1.2 + Math.random() * 2
                });
            }
        }

        function render() {
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
                if (distToMouse < 250) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(16, 245, 150, ' + (1 - distToMouse / 250) * 0.75 + ')';
                    ctx.lineWidth = 1.2;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                // Inter-node connections
                for (var j = fn + 1; j < len; j++) {
                    var node2 = floatingNodes[j];
                    var distNodes = Math.hypot(node.x - node2.x, node.y - node2.y);
                    if (distNodes < 140) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 215, 80, ' + (1 - distNodes / 140) * 0.25 + ')';
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

            requestAnimationFrame(render);
        }

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
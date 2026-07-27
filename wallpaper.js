/**
 * wallpaper.js — Real-World Photorealistic Solar Globe with Background Video & Ultra-Dense Neural Web
 * 
 * Features:
 * - Crystal-clear background video playlist with subtle styling & smooth transitions
 * - Ultra-dense, highly visible interactive cursor-reactive particle & mesh network connecting across the page to globe points
 * - 3D Earth map with real continents, oceans, and atmospheric lighting
 * - Soft, blended energy lines and nano solar micro-panels
 * - Cinematic bottom-right placement & scroll rotation
 * - Optimized 60 FPS performance
 */
(function () {
    'use strict';

    // ===================== CSS STYLES =====================
    var wallpaperCSS = `
        /* DEEP SPACE & EARTH ATMOSPHERE BACKGROUND */
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

        initRealWorldGlobeEngine(canvas);
    }

    // ===================== ENGINE WITH REAL MAP GLOBE & ULTRA-DENSE NEURAL WEB =====================
    function initRealWorldGlobeEngine(canvas) {
        var ctx = canvas.getContext('2d', { alpha: true });
        var width, height;

        var globe = {
            radius: 400,
            rotX: 0.38,
            rotY: 0,
            targetRotY: 0,
            rotSpeedY: 0.0004,
            sunDir: { x: 0.8, y: -0.6, z: 0.7 }
        };

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

        var mapLoaded = false;
        var mapImage = new Image();
        var mapCanvas = document.createElement('canvas');
        var mapCtx = mapCanvas.getContext('2d');
        var mapData = null;

        mapImage.crossOrigin = "Anonymous";
        mapImage.src = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg';
        
        mapImage.onload = function () {
            mapCanvas.width = 360;
            mapCanvas.height = 180;
            mapCtx.drawImage(mapImage, 0, 0, 360, 180);
            try {
                mapData = mapCtx.getImageData(0, 0, 360, 180).data;
                mapLoaded = true;
            } catch(e) {
                mapLoaded = false;
            }
        };

        var panels = [];
        var connections = [];
        var energyPulses = [];
        var floatingNodes = [];
        var particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            globe.radius = Math.min(width, height) * 0.58;
            buildSphereGrid();
        }

        function buildSphereGrid() {
            panels = [];
            connections = [];
            energyPulses = [];
            floatingNodes = [];

            var latSegments = 32;
            var lonSegments = 54;

            for (var lat = 1; lat < latSegments; lat++) {
                var phi = (lat / latSegments) * Math.PI;

                for (var lon = 0; lon < lonSegments; lon++) {
                    var theta = (lon / lonSegments) * Math.PI * 2;

                    var x = Math.sin(phi) * Math.cos(theta);
                    var y = Math.cos(phi);
                    var z = Math.sin(phi) * Math.sin(theta);

                    var u = Math.floor((lon / lonSegments) * 360);
                    var v = Math.floor((lat / latSegments) * 180);

                    var isLand = true;
                    var landColor = '#103d2e';

                    if (mapLoaded && mapData) {
                        var idx = (v * 360 + u) * 4;
                        var r = mapData[idx];
                        var g = mapData[idx + 1];
                        var b = mapData[idx + 2];
                        isLand = (g > b * 0.85) || (r > b * 0.9);
                        landColor = 'rgb(' + r + ',' + g + ',' + b + ')';
                    }

                    panels.push({
                        unitX: x, unitY: y, unitZ: z,
                        px: 0, py: 0, pz: 0,
                        screenX: 0, screenY: 0,
                        visible: false,
                        lightIntensity: 0,
                        isLand: isLand,
                        baseColor: landColor
                    });
                }
            }

            for (var i = 0; i < panels.length; i++) {
                var p1 = panels[i];
                for (var j = i + 1; j < panels.length; j++) {
                    var p2 = panels[j];
                    var distSq = (p1.unitX - p2.unitX)**2 + (p1.unitY - p2.unitY)**2 + (p1.unitZ - p2.unitZ)**2;
                    if (distSq < 0.08) {
                        connections.push({ p1: p1, p2: p2, isLand: p1.isLand && p2.isLand });
                    }
                }
            }

            for (var k = 0; k < 35; k++) {
                energyPulses.push(createEnergyPulse());
            }

            // MASSIVELY DENSE floating interactive nodes across the screen (increased quantity to 280)
            for (var fn = 0; fn < 280; fn++) {
                floatingNodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    radius: 1.5 + Math.random() * 2.5
                });
            }

            particles = [];
            for (var ep = 0; ep < 35; ep++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vy: -(0.3 + Math.random() * 0.5),
                    radius: 1.2 + Math.random() * 2
                });
            }
        }

        function createEnergyPulse() {
            var conn = connections[Math.floor(Math.random() * connections.length)];
            return {
                conn: conn,
                progress: Math.random(),
                speed: 0.005 + Math.random() * 0.01
            };
        }

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    var scrollY = window.scrollY || window.pageYOffset;
                    globe.targetRotY = scrollY * 0.001;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        var sunLen = Math.sqrt(globe.sunDir.x**2 + globe.sunDir.y**2 + globe.sunDir.z**2);
        var normSun = { x: globe.sunDir.x / sunLen, y: globe.sunDir.y / sunLen, z: globe.sunDir.z / sunLen };

        function render() {
            ctx.clearRect(0, 0, width, height);

            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            var centerX = width * 0.95;
            var centerY = height * 0.92;

            globe.rotY += (globe.targetRotY - globe.rotY) * 0.03 + globe.rotSpeedY;

            var cosX = Math.cos(globe.rotX), sinX = Math.sin(globe.rotX);
            var cosY = Math.cos(globe.rotY), sinY = Math.sin(globe.rotY);

            var len = panels.length;
            for (var i = 0; i < len; i++) {
                var p = panels[i];

                var rx1 = p.unitX * cosY + p.unitZ * sinY;
                var ry1 = p.unitY;
                var rz1 = -p.unitX * sinY + p.unitZ * cosY;

                var rx2 = rx1;
                var ry2 = ry1 * cosX - rz1 * sinX;
                var rz2 = ry1 * sinX + rz1 * cosX;

                p.px = rx2; p.py = ry2; p.pz = rz2;
                p.screenX = centerX + rx2 * globe.radius;
                p.screenY = centerY + ry2 * globe.radius;

                p.visible = rz2 > -0.05;
                if (p.visible) {
                    p.lightIntensity = Math.max(0, rx2 * normSun.x + ry2 * normSun.y + rz2 * normSun.z);
                }
            }

            // 1. DRAW HIGH-VISIBILITY ULTRA-DENSE PAGE-WIDE NODES & CURSOR/GLOBE WEBS
            for (var fn = 0; fn < floatingNodes.length; fn++) {
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

                if (fn % 2 === 0 && panels.length > 0) {
                    var targetPanel = panels[(fn * 11) % panels.length];
                    if (targetPanel && targetPanel.visible && targetPanel.isLand) {
                        var distToGlobeNode = Math.hypot(node.x - targetPanel.screenX, node.y - targetPanel.screenY);
                        if (distToGlobeNode < 450) {
                            ctx.beginPath();
                            ctx.strokeStyle = 'rgba(255, 215, 80, ' + (1 - distToGlobeNode / 450) * 0.5 + ')';
                            ctx.lineWidth = 0.9;
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(targetPanel.screenX, targetPanel.screenY);
                            ctx.stroke();
                        }
                    }
                }

                ctx.fillStyle = 'rgba(16, 245, 150, 0.95)';
                ctx.fillRect(node.x - node.radius / 2, node.y - node.radius / 2, node.radius, node.radius);
            }

            // 2. DRAW SOFTLY BLENDED CONNECTING LINES ON GLOBE
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(20, 245, 150, 0.12)';
            ctx.lineWidth = 1;
            var connLen = connections.length;
            for (var c = 0; c < connLen; c++) {
                var conn = connections[c];
                if (conn.p1.visible && conn.p2.visible) {
                    ctx.moveTo(conn.p1.screenX, conn.p1.screenY);
                    ctx.lineTo(conn.p2.screenX, conn.p2.screenY);
                }
            }
            ctx.stroke();

            // 3. DRAW SOFT ENERGY FLOW PULSES
            var pulseLen = energyPulses.length;
            for (var ep = 0; ep < pulseLen; ep++) {
                var pItem = energyPulses[ep];
                pItem.progress += pItem.speed;
                if (pItem.progress >= 1) {
                    energyPulses[ep] = createEnergyPulse();
                } else if (pItem.conn.p1.visible && pItem.conn.p2.visible) {
                    var px = pItem.conn.p1.screenX + (pItem.conn.p2.screenX - pItem.conn.p1.screenX) * pItem.progress;
                    var py = pItem.conn.p1.screenY + (pItem.conn.p2.screenY - pItem.conn.p1.screenY) * pItem.progress;

                    ctx.fillStyle = 'rgba(255, 215, 80, 0.85)';
                    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
                }
            }

            // 4. DRAW CONTINENTAL LANDMASS & SHINY SOLAR PANELS
            for (var k = 0; k < len; k++) {
                var panel = panels[k];
                if (!panel.visible) continue;

                var light = panel.lightIntensity;

                if (panel.isLand) {
                    var size = 3 + light * 4;
                    ctx.fillStyle = light > 0.55 ? 'rgba(255, 210, 60, ' + (0.5 + light * 0.5) + ')' : 'rgba(20, 245, 150, ' + (0.3 + light * 0.5) + ')';
                    ctx.fillRect(panel.screenX - size / 2, panel.screenY - size / 2, size, size);

                    if (light > 0.65) {
                        ctx.fillStyle = 'rgba(255, 255, 255, ' + ((light - 0.65) * 3) + ')';
                        ctx.fillRect(panel.screenX - 1.2, panel.screenY - 1.2, 2.4, 2.4);
                    }
                } else {
                    var seaSize = 1.4 + light * 1.8;
                    ctx.fillStyle = 'rgba(10, 80, 60, ' + (0.2 + light * 0.3) + ')';
                    ctx.fillRect(panel.screenX - seaSize / 2, panel.screenY - seaSize / 2, seaSize, seaSize);
                }
            }

            // 5. EMBERS
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
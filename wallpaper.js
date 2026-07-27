/**
 * wallpaper.js — NoraSol Background Wallpaper System
 *
 * Extracted from Norasol.html for modular maintainability.
 * Injects video background HTML, CSS, and cycling logic into the DOM.
 */
(function () {
    'use strict';

    // ===================== HTML =====================
    var wallpaperHTML =
        '<div class="video-bg-container" id="videoBgContainer">' +
            '<video id="bgVideo0" class="active" muted loop playsinline preload="auto"></video>' +
            '<video id="bgVideo1" muted loop playsinline preload="auto"></video>' +
            '<video id="bgVideo2" muted loop playsinline preload="auto"></video>' +
        '</div>' +
        '<div class="video-overlay"></div>' +
        '<div class="tech-circuit-overlay"></div>';

    // ===================== CSS =====================
    var wallpaperCSS =
        /* VIDEO BACKGROUND - 3 PEXELS VIDEOS WITH FADE TRANSITIONS */
        '.video-bg-container {' +
            'position: fixed;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'z-index: -3;' +
            'overflow: hidden;' +
        '}' +
        '.video-bg-container video {' +
            'position: absolute;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'object-fit: cover;' +
            'opacity: 0;' +
            'transition: opacity 1.5s ease-in-out;' +
            'filter: blur(3px);' +
        '}' +
        '.video-bg-container video.active {' +
            'opacity: 1;' +
        '}' +
        /* Dark gradient overlay on top of videos */
        '.video-overlay {' +
            'position: fixed;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'z-index: -2;' +
            'background: linear-gradient(135deg, rgba(18, 48, 34, 0.5) 0%, rgba(18, 48, 34, 0.7) 100%);' +
            'pointer-events: none;' +
        '}' +
        /* TECH CIRCUIT OVERLAY */
        '.tech-circuit-overlay {' +
            'position: fixed;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'z-index: -1;' +
            'opacity: 0.06;' +
            'background-image: ' +
                'radial-gradient(circle at 20% 30%, transparent 120px, rgba(85, 158, 63, 0.25) 121px, rgba(85, 158, 63, 0.25) 123px, transparent 124px),' +
                'linear-gradient(90deg, rgba(85, 158, 63, 0.08) 1px, transparent 1px),' +
                'linear-gradient(0deg, rgba(85, 158, 63, 0.08) 1px, transparent 1px);' +
            'background-size: 100% 100%, 60px 60px, 60px 60px;' +
        '}';

    // Inject CSS into document head
    var styleEl = document.createElement('style');
    styleEl.textContent = wallpaperCSS;
    document.head.appendChild(styleEl);

    // Inject HTML at the beginning of body (first child)
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = wallpaperHTML;
    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
    }
    document.body.insertBefore(fragment, document.body.firstChild);


    // ===================== VIDEO CYCLING LOGIC =====================
    var VIDEO_FILES = [
        'Images/15338260_640_360_23fps.mp4',
        'Images/9788714-sd_640_360_30fps.mp4',
        'Images/14580851_640_360_30fps.mp4'
    ];

    var vids = [
        document.getElementById('bgVideo0'),
        document.getElementById('bgVideo1'),
        document.getElementById('bgVideo2')
    ];

    var curIdx = 0;

    function show(idx) {
        for (var i = 0; i < vids.length; i++) {
            if (vids[i]) vids[i].classList.remove('active');
        }
        var v = vids[idx];
        if (v) {
            v.classList.add('active');
            v.currentTime = 0;
            var p = v.play();
            if (p && p['catch']) p['catch'](function () {});
        }
        curIdx = idx;
    }

    function init() {
        for (var i = 0; i < vids.length; i++) {
            if (vids[i]) {
                vids[i].src = VIDEO_FILES[i];
                vids[i].load();
            }
        }

        setTimeout(function () {
            show(0);
        }, 500);

        setInterval(function () {
            var next = (curIdx + 1) % vids.length;
            show(next);
        }, 10000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


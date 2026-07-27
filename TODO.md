# Wallpaper Extraction Plan

## Steps:

1. **Create `wallpaper.js`** - ✅ Done
   - Self-contained JS file that:
   - Injects wallpaper HTML (video container, overlays, tech circuit) into the DOM
   - Injects wallpaper CSS via a dynamically created `<style>` tag
   - Contains the video cycling logic
   - Uses a self-executing function for encapsulation

2. **Edit `Norasol.html`** - ✅ Done
   - Remove wallpaper HTML divs (video-bg-container, video-overlay, tech-circuit-overlay)
   - Remove wallpaper CSS from `<style>` block (video backgrounds, overlays, tech circuit)
   - Remove the video cycling JavaScript IIFE at the bottom

3. **Add `<script src="wallpaper.js"></script>`** - ✅ Done


RialoHQ Mini Game – Character Image Guide

 1) Kahan rakhna hai / Where to place
 - File name: character.png (exact)
 - Folder path: assets/character.png
 - Example full path (Windows): C:\Users\USER\CascadeProjects\rialohq-mini-game\assets\character.png

 2) Format & Quality
 - Preferred: PNG with transparency (alpha)
 - Works: JPG/JPEG too (no transparency), but PNG looks better
 - Recommended size: 56×64 to 112×128 px (game auto-scales slightly)
 - Safe area: Keep the face/body centered with a little padding around

 3) Common mistakes (bahut log yahi galti karte hain)
 - Double extension: character.png.png → sahi karo: character.png
 - Wrong folder: File ko assets/ ke bahar mat rakho
 - Case usually okay on Windows, but keep lowercase: character.png

 4) Test kaise karein / How to test
 - Run local server (recommended): http://localhost:5500/
 - Hard refresh: Ctrl+F5 (cache clear)
 - Console errors check karein (Ctrl+Shift+I → Console)
   • 404 for /assets/character.png ⇒ path/filename galat hai
   • Image decode error ⇒ corrupt file; re‑export PNG

 5) Tips
 - Transparent background se avatar canvas par acha dikhega
 - If your image is very large, resize near 64×64–128×128 for better load
 - Edge glow ya stroke add karna ho to image me hi add kar sakte ho

 6) Fallback
 - Agar image nahi milti: game ek cute fallback avatar draw karta hai

 7) Brand
 - Brand name already shown: “RialoHQ”. Change not needed for image to work

 Quick checklist
 - [ ] File name exactly character.png
 - [ ] Located in assets/ folder
 - [ ] PNG with transparency (recommended)
 - [ ] Page hard‑refreshed (Ctrl+F5)
 - [ ] No red errors in Console

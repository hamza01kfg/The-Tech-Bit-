# The Tech Bit

A fully functional static PWA website with product showcase, videos (no autoplay), 3D touch navigation, and source protection.

## Features Implemented

- **Brand**: "The Tech Bit" with custom favicon and logo.
- **3D Touch Navigation**: Press animations on all interactive elements.
- **Products Page**: Shows brand, category, price, quality rating (stars + text).
- **Source Protection**: Right-click disabled, keyboard shortcuts blocked (F12, Ctrl+U, etc.).
- **Video Page**: No autoplay – user must manually play/pause.
- **Fully responsive** with mobile bottom navigation.
- **Contact form** (demo mode) and **authentication UI** (demo).

## How to Run

1. Save all files in the same folder:
   - `index.html`
   - `app.js`
   - `firebase-setup.js`
   - `products.json`
   - `manifest.json`
2. Serve using any static server (e.g., `npx serve .` or open with Live Server in VS Code).
3. For Firebase/EmailJS, replace keys in `firebase-setup.js` with your own.

## Customization

- Edit `products.json` to add/remove products.
- Modify colors in CSS variables inside `index.html`.

All code is self-contained and working.
# Memristor 3D Schematic Diagram
### MoO₃ / ZnO Resistive Switching Stack — Interactive 3D Visualization

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## Overview

This project presents an **interactive 3D schematic diagram** of a Memristor device based on a **MoO₃ / ZnO resistive switching stack**. Built entirely with **Three.js** and vanilla web technologies, it provides a real-time, browser-based visualization of the memristor's layered structure.

The visualization is designed for researchers, engineers, and students working in the field of **neuromorphic computing**, **resistive switching memory (RRAM)**, and **non-volatile memory devices**.

---

## Features

- **Interactive 3D Rendering** — rotate, zoom, and pan the device structure using mouse/touch controls
- **Multi-Theme Support** — Dark Blue/Neon, Pure Black, Deep Space Gradient, Light Gray, White/Presentation
- **Layer-by-Layer Visualization** — clearly shows each material layer of the MoO₃/ZnO stack
- **Export Options** — download/screenshot the visualization directly from the browser
- **Fully Browser-Based** — no installation required; runs in any modern browser
- **Responsive Design** — works on desktop and tablet screens

---

## Device Structure

```
┌────────────────────────────────┐
│         Top Electrode (Au/Pt)   │
├─────────────────────────────────┤
│         MoO₃  (Switching Layer) │
├─────────────────────────────────┤
│         ZnO   (Buffer Layer)    │
├─────────────────────────────────┤
│      Bottom Electrode (ITO)     │
└─────────────────────────────────┘
```

The **resistive switching** occurs primarily in the MoO₃ layer through formation and rupture of conductive filaments, enabling non-volatile binary and multilevel memory states (HRS / LRS).

---

## Getting Started

### Run Locally

```bash
git clone https://github.com/Qaiser-baitham/memristor-3d.git
cd memristor-3d
```

Then simply open `index.html` in any modern browser — for no build step or server required.

### Live Demo

> Open `index.html` directly in your browser or host on GitHub Pages.

---

## File Structure

```
memristor-3d/
├── index.html      # Main HTML entry point & UI layout
├── script.js        # Three.js 3D scene, geometry, controls & interactions
├── style.css       # Styling, themes, toolbar & responsive layout
└── README.md       # Project documentation
```

---

## Technologies Used

| Technology | Purpose |
|---|---|
| [Three.js r128](https://threejs.org/) | 3D rendering engine |
| HTML5 Canvas | WebGL rendering surface |
| CSS3 Custom Properties | Multi-theme system |
| Vanilla JavaScript (ES6+) | Scene logic & interactivity |
| Google Fonts (Inter) | UI typography |

---

## Screenshots

> Launch `index.html` in your browser to view the interactive 3D schematic.

---

## Author

**Qaiser Baitham**
Researcher | Memristor & Neuromorphic Computing

- **WhatsApp:** [+92 332 5514465](https://wa.me/923325514465)
- **GitHub:** [@Qaiser-baitham](https://github.com/Qaiser-baitham)

---

## License

This project is licensed under the **MIT License** — free to use, modify, and distribute with attribution.

---

*If you find this project useful, please give it a ⭐ on GitHub!*

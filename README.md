<div align="center">

```
   __ _  _   _  _ __ ___  
  / _` || | | || '_ ` _ \ 
 | (_| || |_| || | | | | |
  \__,_| \__,_||_| |_| |_|   planes.io
```

# Otter Planes IO

**Multiplayer-ready 3D flight playground in the browser** — React, Three.js, and a Node/Socket.io backend. Fly curated aircraft, explore a huge world, or build your own plane in the **Ultimate Plane Builder**.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Vitest](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

[Features](#features) · [Screenshots](#screenshots) · [Quick start](#quick-start) · [Controls](#controls) · [Tests](#tests) · [Tech stack](#tech-stack) · [Docs](#project-documentation) · [Roadmap](#roadmap)

</div>

---

## Features

| | |
| :--- | :--- |
| **Ultimate Plane Builder** | 10 part categories, 60+ parts, live stats, save/load, clipboard share, undo/redo |
| **Hangar** | WWI biplanes, jets, civil aircraft, specials (Otter One, Tung Tung Air, GPT & Claude-themed craft, and more) |
| **World** | ~30k terrain span, airport, roads, lake resort, downtown skyline, wind farm, lighthouse, minimap (M / U) |
| **Flight model** | Semi-realistic lift, AoA, stall, continuous throttle, HUD with instruments |
| **Modes** | Single-player (pause) and multiplayer sync via Socket.io |
| **Performance** | Instancing, LOD, throttled state/network updates, pooled math objects |

---

## Screenshots

> There is no `assets/` gallery in-repo yet. Add `docs/screenshots/` (or GitHub-uploaded images) and link them here for a richer landing page.

---

## Quick start

**Requirements:** Node.js **18+** and npm.

### One command (Windows)

From the repo root:

```bat
launch.bat
```

This installs client/server deps if needed, starts **client** on [http://localhost:3000](http://localhost:3000) and **server** on port **3001**, then opens the game in your browser.

### Manual

```bash
# Terminal 1 — game UI
cd client
npm install
npm run dev

# Terminal 2 — multiplayer backend
cd server
npm install
npm run dev
```

**Clone this repo**

```bash
git clone https://github.com/Otterdays/otter.planes.io.git
cd otter.planes.io
```

---

## Controls

| Action | Keys |
| :--- | :---: |
| Throttle up / brake | `Shift` / `Ctrl` |
| Pitch | `W` / `S` |
| Roll | `A` / `D` |
| Yaw | `Q` / `E` |
| Free camera | Hold `RMB` + drag |
| Reset | `R` |
| Minimap | `M` (fullscreen), `U` (size cycle) |

**Tip:** Coordinate turns with roll (`A`/`D`) then pull (`S`) so lift pulls you through the turn.

---

## Tests

```bash
# From repository root (runs client Vitest)
npm test

# Or inside client/
cd client && npm test
```

```bash
npm run test:watch    # watch mode
npm run test:coverage # coverage (see vite.config.ts include paths)
```

The suite covers **world/POI config**, **LOD heuristics**, **instancing helpers**, and **performance budgets** (35+ tests).

---

## Tech stack

| Layer | Choice |
| :--- | :--- |
| UI | React 18, Zustand, component-scoped CSS |
| 3D | React Three Fiber, Drei, Three.js |
| Tooling | TypeScript (strict), Vite 5 |
| Realtime | Socket.io (client + Express server) |
| Tests | Vitest, jsdom, Testing Library |

---

## Project documentation

Internal engineering notes live under **`DOCS/`**:

- [`DOCS/SUMMARY.md`](DOCS/SUMMARY.md) — status and milestones  
- [`DOCS/ARCHITECTURE.md`](DOCS/ARCHITECTURE.md) — system overview  
- [`DOCS/CHANGELOG.md`](DOCS/CHANGELOG.md) — release history  

---

## Roadmap

- [x] Core flight physics and HUD  
- [x] Large world + roads + major POIs  
- [x] Plane Builder with save/load  
- [x] Multiplayer synchronization  
- [ ] Richer road/traffic simulation  
- [ ] Weather (rain, storms) layered on existing clouds/fog  
- [ ] Missions (races, checkpoints, delivery)  

---

<div align="center">

**MIT License** — see [`LICENSE`](LICENSE).

Built for the joy of low-altitude joyrides and ridiculous aircraft.

</div>

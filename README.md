<div align="center">

# 🛩️ Otter Planes IO
### The Open Source Browser Flight Simulator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?logo=vite&logoColor=white)

<br />

**Otter Planes IO** is a next-generation browser MMO flight simulator. We combine the accessibility of web technologies with the depth of a desktop simulator. Build your own aircraft, master realistic aerodynamics, and fly with friends in a persistent 3D world.

[Features](#-key-features) •
[Getting Started](#-getting-started) •
[Controls](#-flight-manual) •
[Tech Stack](#-technology) •
[Roadmap](#-roadmap)

</div>

---

## 🌟 Key Features

### 🛠️ Ultimate Plane Builder
Design your aircraft from the fuselage up.
- **60+ Modular Parts**: Engines, wings, cockpits, and landing gear.
- **Real-time Physics**: Your design choices affect weight, drag, and lift centers.
- **Live Preview**: See your creation evolve in 3D before you fly.
- **Save & Share**: Copy designs to clipboard and share with friends.
- **Undo/Redo**: Full history support for your engineering experiments.

### ✈️ Massive Hangar (10+ Variants)
Fly a diverse fleet of aircraft:
- **Classic**: Sopwith Camel, SPAD XIII, Fokker Dr.I.
- **Modern**: F-22 Raptor, B-2 Spirit, Boeing 747.
- **Special**: 
  - 🦦 **Otter One**: Our mascot plane with wagging tail dynamics.
  - 🥁 **Tung Tung Air**: The meme legend, powered by spinning bat technology.
  - 🧠 **Claude AI**: Neural-network aesthetic interceptor.

### 🌍 Expansive Open World
- **30km² Map**: From the skyscrapers of **Downtown** to the peaks of **Mt. Dorp**.
- **Dynamic Environment**: Volumetric cloud fog, time of day, and atmospheric scattering.
- **Locations**: Crystal Lake beach, International Airport, hidden easter eggs.
- **Traffic**: (Coming Soon) AI traffic on roads and airways.

### 🎮 Gameplay Modes
- **Single Player**: Free flight and exploration with pause capability.
- **Multiplayer**: Real-time synchronization for formation flying and dogfights.
- **HUD**: Professional flight instruments (AoA, G-Force, Mach, Altitude).

### ⚡ Performance Core
- **Optimized Engine**: Frame-rate independent physics and camera smoothing.
- **Object Pooling**: Zero-garbage collection overhead during flight.
- **LOD System**: High-fidelity visuals with solid 60fps performance on standard hardware.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm (or yarn/pnpm)

### installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/otter-planes-io.git
   cd otter-planes-io
   ```

2. **Launch Everything** (Windows)
   Simply run the automated launch script:
   ```bash
   launch.bat
   ```

### Manual Setup

If you prefer to run services manually:

**Client**
```bash
cd client
npm install
npm run dev
```

**Server**
```bash
cd server
npm install
npm run dev
```

Visit `http://localhost:3000` to take flight.

---

## 🕹️ Flight Manual

<div align="center">

| Action | Key | Description |
| :--- | :---: | :--- |
| **Throttle** | `Shift` / `Ctrl` | Accelerate (Hold `Shift`) / Brake or Reverse (Hold `Ctrl`) |
| **Pitch** | `W` / `S` | Pitch Down / Pitch Up |
| **Roll** | `A` / `D` | Roll Left / Roll Right |
| **Yaw** | `Q` / `E` | Rudder Left / Rudder Right |
| **Camera** | `RMB` + Drag | Free look around the aircraft |
| **Reset** | `R` | Reset aircraft position (if crashed) |

</div>

> **Pro Tip**: To turn smoothly, **bank** with A/D and then **pull up** with S. This uses your wing's lift to pull you through the turn, just like a real plane!

---

## 💻 Technology

This project validates that complex 3D games can live natively in the browser.

| Domain | Tech |
| :--- | :--- |
| **Frontend** | React 18, Zustand, styled-components |
| **3D Engine** | React Three Fiber (Three.js), Drei |
| **Language** | TypeScript (Strict Mode) |
| **Build Tool** | Vite |
| **Backend** | Node.js, Socket.io |
| **Testing** | Vitest, React Testing Library |

---

## 🗺️ Roadmap

- [x] Core Flight Physics
- [x] Plane Builder Demo
- [x] Multiplayer Synchronization
- [ ] **Advanced Road System**: Grid-based generation with traffic.
- [ ] **Weather System**: Volumetric clouds and rain.
- [ ] **Missions**: Checkpoint races and cargo delivery.

---

<div align="center">
Built with ❤️ by the Otter Planes Team.
</div>
